// ─── Export Manifest Builder ──────────────────────────────────────────
// Phase 10: Builds a deterministic, auditable ExportManifest by
// scanning persisted artifacts, computing content hashes, and
// assembling a complete evidence lineage from the brief.

import fs from "fs";
import path from "path";
import crypto from "crypto";
import type {
    ExportManifest,
    ExportArtifactRecord,
    ExportArtifactType,
    BriefEvidenceReference,
    ObservatoryBrief,
} from "../types/research-export";
import { OBSERVATORY_VERSION } from "../constants/observatory";
import { assertUniqueKeys, buildObservatoryKey } from "../utils/observatory-key";

const ARTIFACTS_ROOT = path.join(process.cwd(), "artifacts");
const MANIFEST_DIR = path.join(ARTIFACTS_ROOT, "research", "manifests");

// Ensure directory exists synchronously at startup
if (!fs.existsSync(MANIFEST_DIR)) {
    fs.mkdirSync(MANIFEST_DIR, { recursive: true });
}

export class ExportManifestBuilder {
    /**
     * Builds a complete ExportManifest from the given brief.
     * Scans all artifact directories, computes SHA-256 hashes, and
     * extracts the evidence lineage from the brief's sections.
     */
    public static build(
        brief: ObservatoryBrief,
        options: { evaluationRecordId?: string | null } = {}
    ): ExportManifest {
        const now = new Date().toISOString();
        const manifestId = `manifest-${Date.now().toString(36)}`;
        const evidenceLineage = this.collectEvidenceLineage(brief);
        const evaluationRecordId = options.evaluationRecordId ?? null;

        // ─── Collect all artifacts ────────────────────────────────
        const artifacts: ExportArtifactRecord[] = [];

        // Briefings
        this.scanDir(
            path.join(ARTIFACTS_ROOT, "research", "briefings"),
            "brief",
            artifacts,
            evidenceLineage,
            brief.id
        );

        // Dossiers
        this.scanDir(
            path.join(ARTIFACTS_ROOT, "research"),
            "dossier",
            artifacts,
            evidenceLineage,
            brief.id,
            evaluationRecordId,
            f => f.startsWith("dossier-")
        );

        // Simulation sessions
        this.scanDir(
            path.join(ARTIFACTS_ROOT, "simulations"),
            "session",
            artifacts,
            evidenceLineage,
            brief.id,
            evaluationRecordId,
            f => f.startsWith("session-")
        );

        // Benchmark runs
        this.scanDir(
            path.join(ARTIFACTS_ROOT, "simulations"),
            "benchmark",
            artifacts,
            evidenceLineage,
            brief.id,
            evaluationRecordId,
            f => f.startsWith("benchmark-")
        );

        this.scanDir(
            path.join(ARTIFACTS_ROOT, "research", "evaluations"),
            "evaluation-snapshot",
            artifacts,
            evidenceLineage,
            brief.id,
            evaluationRecordId,
            f => f.startsWith("evaluation-")
        );

        this.scanDir(
            path.join(ARTIFACTS_ROOT, "research", "world-state"),
            "snapshot",
            artifacts,
            evidenceLineage,
            brief.id,
            evaluationRecordId,
            f => f.startsWith("wss-")
        );

        this.scanDir(
            path.join(ARTIFACTS_ROOT, "research", "datasets"),
            "dataset",
            artifacts,
            evidenceLineage,
            brief.id,
            evaluationRecordId,
            f => f.startsWith("dataset-")
        );

        this.scanDir(
            path.join(ARTIFACTS_ROOT, "research", "replay-packages"),
            "replay-package",
            artifacts,
            evidenceLineage,
            brief.id,
            evaluationRecordId,
            f => f.startsWith("replay-")
        );

        artifacts.sort((left, right) => {
            if (left.inclusionRole !== right.inclusionRole) {
                return left.inclusionRole === "cited-by-brief" ? -1 : 1;
            }
            if (left.artifactType !== right.artifactType) {
                return left.artifactType.localeCompare(right.artifactType);
            }
            return right.generatedAt.localeCompare(left.generatedAt);
        });

        assertUniqueKeys(
            "ExportManifestBuilder.artifacts",
            artifacts.map(artifact => artifact.canonicalKey)
        );

        // ─── Compute totals ──────────────────────────────────────
        const totalSizeBytes = artifacts.reduce((sum, a) => sum + a.sizeBytes, 0);
        const evidenceArtifactCount = artifacts.filter(a => a.inclusionRole === "cited-by-brief").length;
        const contextualArtifactCount = artifacts.length - evidenceArtifactCount;

        const manifest: ExportManifest = {
            id: manifestId,
            exportedAt: now,
            exportedBy: "agent",
            systemVersion: OBSERVATORY_VERSION,
            briefId: brief.id,
            replayStatusSummary: brief.replayStatusSummary,
            comparisonPosture: {
                evaluationSnapshotId: evaluationRecordId,
                strongestExperimentTitle: brief.comparativeEvaluation.strongestExperimentTitle,
                strongestComparativeWeightLabel: brief.comparativeEvaluation.strongestComparativeWeightLabel,
                highConfidenceComparisonCount: brief.comparativeEvaluation.highConfidenceComparisonCount,
                comparativeCaveat: brief.comparativeEvaluation.comparativeCaveat,
            },
            prioritizationSummary: brief.prioritizationContext,
            priorityDriftSummary: brief.priorityDrift ?? null,
            governanceSummary: brief.recommendationGovernance ?? null,
            priorityHistorySummary: brief.priorityHistorySummary ?? null,
            snapshotComparisons: brief.snapshotComparisons ?? null,
            governanceSynthesis: brief.governanceSynthesis ?? null,
            artifacts,
            evidenceLineage,
            totalArtifacts: artifacts.length,
            evidenceArtifactCount,
            contextualArtifactCount,
            totalSizeBytes,
            integrityNote: artifacts.length > 0
                ? `${evidenceArtifactCount} artifact(s) are cited by this brief and ${contextualArtifactCount} are retained for context. All exported artifacts include SHA-256 hashes. Total export size: ${(totalSizeBytes / 1024).toFixed(1)} KB.`
                : "No persisted artifacts found. Export manifest is structurally valid but empty.",
            integrityGuarantees: [
                "Every exported artifact is hashed with SHA-256 at export time.",
                "Artifacts are labeled as either cited by the brief or included for context.",
                "Evidence lineage is collected deterministically from sections, findings, constraints, and recommendations.",
                "Governance boundaries, advisory caveats, and non-execution constraints are consolidated in the governanceSynthesis field. See governanceSynthesis.governanceBoundaries for the canonical governance boundary statements.",
            ],
        };

        // Persist manifest
        this.saveManifest(manifest);

        return manifest;
    }

    /**
     * Retrieves the most recently exported manifest, or null if none exist.
     */
    public static getLatest(): ExportManifest | null {
        if (!fs.existsSync(MANIFEST_DIR)) return null;

        const files = fs.readdirSync(MANIFEST_DIR)
            .filter(f => f.startsWith("manifest-") && f.endsWith(".json"));
        if (files.length === 0) return null;

        // Order newest-first by id. Manifest ids encode their creation time, so
        // this is deterministic even in immutable deploy environments (e.g.
        // Vercel) where every checked-out file shares an identical mtime — which
        // made the previous mtime-based sort non-deterministic in production and
        // could surface a legacy manifest missing current-schema fields.
        files.sort((a, b) => b.localeCompare(a));

        // Prefer the newest manifest that matches the current schema so the UI
        // never receives a legacy artifact missing required fields such as
        // replayStatusSummary. Fall back to the newest readable manifest.
        let newestReadable: ExportManifest | null = null;
        for (const file of files) {
            try {
                const parsed = JSON.parse(
                    fs.readFileSync(path.join(MANIFEST_DIR, file), "utf-8")
                ) as ExportManifest;
                if (newestReadable === null) newestReadable = parsed;
                if (parsed?.replayStatusSummary) return parsed;
            } catch {
                // Skip unreadable/corrupt manifest and continue scanning.
            }
        }

        return newestReadable;
    }

    // ─── Internal Helpers ─────────────────────────────────────────

    private static scanDir(
        dirPath: string,
        artifactType: ExportArtifactType,
        target: ExportArtifactRecord[],
        evidenceLineage: BriefEvidenceReference[],
        briefId: string,
        evaluationRecordId?: string | null,
        filter?: (filename: string) => boolean
    ): void {
        if (!fs.existsSync(dirPath)) return;

        const files = fs.readdirSync(dirPath).filter(f => {
            if (!f.endsWith(".json")) return false;
            return filter ? filter(f) : true;
        });

        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);
            if (!stat.isFile()) continue;

            const content = fs.readFileSync(filePath, "utf-8");
            const hash = crypto.createHash("sha256").update(content).digest("hex");

            const artifactId = this.deriveArtifactId(content, file);
            const canonicalKey = buildObservatoryKey(
                "export-artifact",
                artifactType,
                artifactId,
                path.relative(process.cwd(), filePath)
            );

            target.push({
                canonicalKey,
                artifactId,
                artifactType,
                filePath: path.relative(process.cwd(), filePath),
                sha256: hash,
                generatedAt: stat.mtime.toISOString(),
                sizeBytes: stat.size,
                inclusionRole: this.classifyArtifactInclusionRole(artifactType, artifactId, evidenceLineage, briefId, evaluationRecordId ?? null),
            });
        }
    }

    private static collectEvidenceLineage(brief: ObservatoryBrief): BriefEvidenceReference[] {
        const refs: BriefEvidenceReference[] = [];
        const seen = new Set<string>();

        for (const section of brief.sections) {
            for (const ref of section.evidenceRefs) {
                const key = `${ref.sourceType}:${ref.sourceId}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    refs.push(ref);
                }
            }
        }

        for (const finding of brief.findings) {
            for (const ref of finding.supportingEvidence) {
                const key = `${ref.sourceType}:${ref.sourceId}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    refs.push(ref);
                }
            }
        }

        for (const constraint of brief.constraints) {
            for (const ref of constraint.evidenceRefs) {
                const key = `${ref.sourceType}:${ref.sourceId}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    refs.push(ref);
                }
            }
        }

        for (const step of brief.recommendedNextSteps) {
            for (const ref of step.evidenceRefs) {
                const key = `${ref.sourceType}:${ref.sourceId}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    refs.push(ref);
                }
            }
        }

        return refs;
    }

    private static classifyArtifactInclusionRole(
        artifactType: ExportArtifactType,
        artifactId: string,
        evidenceLineage: BriefEvidenceReference[],
        briefId: string,
        evaluationRecordId: string | null
    ): "cited-by-brief" | "context" {
        if (artifactType === "brief") {
            return artifactId === briefId ? "cited-by-brief" : "context";
        }

        if (artifactType === "evaluation-snapshot") {
            return artifactId === evaluationRecordId
                ? "cited-by-brief"
                : "context";
        }

        if (artifactType === "dossier") {
            return evidenceLineage.some(ref => ref.sourceType === "dossier" && ref.sourceId === artifactId)
                ? "cited-by-brief"
                : "context";
        }

        const sourceTypes = this.sourceTypesForArtifact(artifactType);
        if (sourceTypes.some(sourceType => evidenceLineage.some(ref => ref.sourceType === sourceType && ref.sourceId === artifactId))) {
            return "cited-by-brief";
        }

        return "context";
    }

    private static deriveArtifactId(content: string, file: string): string {
        try {
            const parsed = JSON.parse(content) as Record<string, unknown>;
            return String(
                parsed.id
                ?? parsed.evaluationRecordId
                ?? parsed.replayPackageId
                ?? parsed.snapshotId
                ?? parsed.datasetId
                ?? file.replace(".json", "")
            );
        } catch {
            return file.replace(".json", "");
        }
    }

    private static sourceTypesForArtifact(artifactType: ExportArtifactType): BriefEvidenceReference["sourceType"][] {
        switch (artifactType) {
            case "snapshot":
                return ["snapshot", "world-state"];
            case "session":
                return ["simulation"];
            case "benchmark":
                return ["benchmark"];
            case "dataset":
                return ["dataset"];
            case "replay-package":
                return ["replay-package"];
            case "evaluation-snapshot":
                return ["evaluation-snapshot"];
            default:
                return [];
        }
    }

    private static saveManifest(manifest: ExportManifest): void {
        const filePath = path.join(MANIFEST_DIR, `${manifest.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2), "utf-8");
    }
}
