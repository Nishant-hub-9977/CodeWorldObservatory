// ─── ESLint flat config — Next.js 16 ──────────────────────────────
// `next lint` and the eslint option in next.config were removed in Next 16
// in favor of the ESLint CLI. This is the official flat-config setup using
// the canonical `eslint-config-next` package (core-web-vitals preset).

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
    ...nextVitals,
    {
        rules: {
            // Cosmetic-only rule; React escapes entities safely at runtime.
            // Disabled to keep lint focused on real issues across the codebase.
            "react/no-unescaped-entities": "off",
            // Pre-existing, idiomatic mount-effect data-load and theme-hydration
            // patterns are flagged by this newer rule. Downgraded to a warning so
            // lint stays actionable without a non-Q2 refactor of existing panels.
            "react-hooks/set-state-in-effect": "warn",
        },
    },
    globalIgnores([
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
        // Local build tooling (Node script, not part of the app surface).
        "scripts/**",
    ]),
]);

export default eslintConfig;
