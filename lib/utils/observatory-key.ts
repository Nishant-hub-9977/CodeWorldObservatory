type ObservatoryKeyPart = string | number | boolean | null | undefined;

function normalizePart(value: ObservatoryKeyPart): string {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    return String(value).trim().replace(/\s+/g, "-");
}

export function buildObservatoryKey(scope: string, ...parts: ObservatoryKeyPart[]): string {
    return [scope, ...parts.map(normalizePart)].join("::");
}

export function buildArtifactKey(artifactType: string, artifactId: ObservatoryKeyPart, origin: ObservatoryKeyPart): string {
    return buildObservatoryKey("artifact", artifactType, artifactId, origin);
}

export function buildDerivedItemKey(
    family: string,
    originId: ObservatoryKeyPart,
    semanticId: ObservatoryKeyPart,
    ...parts: ObservatoryKeyPart[]
): string {
    return buildObservatoryKey(`derived-${family}`, originId, semanticId, ...parts);
}

export function buildSummaryItemKey(group: string, summaryId: ObservatoryKeyPart, ...parts: ObservatoryKeyPart[]): string {
    return buildObservatoryKey(`summary-${group}`, summaryId, ...parts);
}

export function assertUniqueKeys(scope: string, keys: readonly string[]): void {
    if (process.env.NODE_ENV === "production") {
        return;
    }

    const seen = new Set<string>();
    const duplicates = new Set<string>();

    for (const key of keys) {
        if (seen.has(key)) {
            duplicates.add(key);
            continue;
        }
        seen.add(key);
    }

    if (duplicates.size > 0) {
        throw new Error(
            `[observatory] Duplicate canonical keys detected in ${scope}: ${Array.from(duplicates).join(", ")}`
        );
    }
}