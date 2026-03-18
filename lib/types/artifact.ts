// ─── Artifact Types ──────────────────────────────────────────────
// Artifacts are the immutable trust instruments of the Observatory.
// Every significant operation produces an artifact. Every artifact
// is hashed, timestamped, and ledgered. They cannot be modified
// after creation — only superseded by newer artifacts.

export type ArtifactType =
    | "plan"             // implementation plan before any action
    | "simulation"       // predicted outcome of an intervention
    | "prediction"       // model prediction record
    | "world-snapshot"   // captured world state
    | "verification"     // test/check results
    | "walkthrough"      // completed work summary
    | "eval-result"      // evaluation outcome
    | "constitution"     // governance document
    | "execution"        // actual execution of an intervention
    | "comparison"       // prediction vs reality delta record
    | "raw-output";      // unstructured agent output

export type ArtifactKind = ArtifactType;

export type VerificationStatus =
    | "verified"
    | "pending"
    | "diverged"
    | "failed";

export type TrustLevel =
    | "high"      // verified by automated checks + human review
    | "medium"    // verified by automated checks only
    | "low"       // agent-produced, not yet verified
    | "unverified"; // no checks performed

export interface ArtifactHash {
    algorithm: "sha256";
    value: string; // hex string
}

export interface ArtifactLink {
    artifactId: string;
    relationship: "supersedes" | "derives-from" | "verifies" | "references";
}

export interface Artifact {
    id: string;
    type: ArtifactType;
    title: string;
    description: string;
    createdAt: string;   // ISO 8601
    createdBy: "human" | "agent" | "system";
    agentId?: string;
    conversationId?: string;
    worldStateId?: string;   // snapshot at time of creation
    interventionId?: string; // linked intervention if applicable
    experimentId?: string;
    sessionId?: string;
    benchmarkId?: string;
    executionId?: string;
    hash: ArtifactHash;
    trustLevel: TrustLevel;
    verifiedAt?: string; // ISO 8601
    verifiedBy?: string;
    path?: string;         // filesystem path if written to disk
    links: ArtifactLink[];
    tags: string[];
}

export interface ArtifactEntry extends Artifact {
    verificationStatus?: VerificationStatus;
    summary?: string;
}

export interface ArtifactLedgerResponse {
    entries: ArtifactEntry[];
    totalCount: number;
    lastUpdated: string;
}
