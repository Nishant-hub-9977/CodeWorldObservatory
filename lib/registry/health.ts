import "server-only";

import { getRegistryConfigSummary } from "./env";
import { getRegistrySql } from "./db";
import type { RegistryErrorCategory, RegistryHealthStatus } from "./types";

function baseStatus(): Omit<RegistryHealthStatus, "ok" | "configured" | "connected" | "checkedAtIso" | "latencyMs" | "errorCategory"> {
    return {
        provider: "neon-postgres",
        mode: "server-only-read-preflight",
        writesEnabled: false,
        persistenceEnabled: false,
        registryMode: "reserved",
        advisoryOnly: true,
        secretVisible: false,
    };
}

function categorizeError(error: unknown): RegistryErrorCategory {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes("fetch") || message.includes("connect") || message.includes("network")) {
            return "connection-failed";
        }
        if (message.includes("query") || message.includes("syntax") || message.includes("select")) {
            return "query-failed";
        }
    }
    return "unknown";
}

export async function getRegistryHealth(): Promise<RegistryHealthStatus> {
    const config = getRegistryConfigSummary();
    if (!config.configured) {
        return {
            ...baseStatus(),
            ok: true,
            configured: false,
            connected: false,
            checkedAtIso: null,
            latencyMs: null,
            errorCategory: "not-configured",
        };
    }

    const started = Date.now();
    try {
        const sql = getRegistrySql();
        if (!sql) {
            return {
                ...baseStatus(),
                ok: true,
                configured: false,
                connected: false,
                checkedAtIso: null,
                latencyMs: null,
                errorCategory: "not-configured",
            };
        }

        await sql`SELECT 1 AS registry_preflight`;
        return {
            ...baseStatus(),
            ok: true,
            configured: true,
            connected: true,
            checkedAtIso: new Date().toISOString(),
            latencyMs: Date.now() - started,
            errorCategory: null,
        };
    } catch (error) {
        return {
            ...baseStatus(),
            ok: false,
            configured: true,
            connected: false,
            checkedAtIso: new Date().toISOString(),
            latencyMs: Date.now() - started,
            errorCategory: categorizeError(error),
        };
    }
}
