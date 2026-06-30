import "server-only";

import type { RegistryConfigSummary } from "./types";

const PROVIDER = "neon-postgres" as const;
const MODE = "reserved-preflight" as const;

export function getDatabaseUrl(): string | null {
    const value = process.env.DATABASE_URL;
    return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export function getRegistryConfigSummary(): RegistryConfigSummary {
    return {
        configured: getDatabaseUrl() !== null,
        provider: PROVIDER,
        mode: MODE,
        secretVisible: false,
    };
}
