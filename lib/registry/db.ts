import "server-only";

import { neon } from "@neondatabase/serverless";
import { getDatabaseUrl } from "./env";

export function getRegistrySql() {
    const databaseUrl = getDatabaseUrl();
    if (!databaseUrl) return null;
    return neon(databaseUrl);
}
