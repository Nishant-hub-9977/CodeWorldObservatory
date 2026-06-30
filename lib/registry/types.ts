// ─── Reserved Registry Boundary Types ───────────────────────────────
// Public-safe shapes for Q10 server-only database preflight. These types
// never contain database URLs, hosts, usernames, passwords, or raw errors.

export type RegistryProvider = "neon-postgres";
export type RegistryMode = "reserved-preflight";
export type RegistryHealthMode = "server-only-read-preflight";
export type RegistryErrorCategory =
    | "not-configured"
    | "connection-failed"
    | "query-failed"
    | "unknown";

export interface RegistryConfigSummary {
    configured: boolean;
    provider: RegistryProvider;
    mode: RegistryMode;
    secretVisible: false;
}

export interface RegistryHealthStatus {
    ok: boolean;
    configured: boolean;
    connected: boolean;
    provider: RegistryProvider;
    mode: RegistryHealthMode;
    checkedAtIso: string | null;
    latencyMs: number | null;
    errorCategory: RegistryErrorCategory | null;
    writesEnabled: false;
    persistenceEnabled: false;
    registryMode: "reserved";
    advisoryOnly: true;
    secretVisible: false;
}
