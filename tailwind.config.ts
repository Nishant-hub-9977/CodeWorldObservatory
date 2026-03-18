import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)", "system-ui", "sans-serif"],
                mono: ["var(--font-mono)", "ui-monospace", "monospace"],
            },
            colors: {
                background: "rgb(var(--background) / <alpha-value>)",
                surface: "rgb(var(--surface) / <alpha-value>)",
                "surface-elevated": "rgb(var(--surface-elevated) / <alpha-value>)",
                "surface-hover": "rgb(var(--surface-hover) / <alpha-value>)",
                "surface-active": "rgb(var(--surface-active) / <alpha-value>)",
                "border-subtle": "rgb(var(--border-subtle) / <alpha-value>)",
                "border-muted": "rgb(var(--border-muted) / <alpha-value>)",
                "border-strong": "rgb(var(--border-strong) / <alpha-value>)",
                "text-primary": "rgb(var(--text-primary) / <alpha-value>)",
                "text-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
                "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
                "text-disabled": "rgb(var(--text-disabled) / <alpha-value>)",
                accent: "rgb(var(--accent) / <alpha-value>)",
                "accent-strong": "rgb(var(--accent-strong) / <alpha-value>)",
                "accent-soft": "rgb(var(--accent-soft) / <alpha-value>)",
                success: "rgb(var(--success) / <alpha-value>)",
                "success-soft": "rgb(var(--success-soft) / <alpha-value>)",
                warning: "rgb(var(--warning) / <alpha-value>)",
                "warning-soft": "rgb(var(--warning-soft) / <alpha-value>)",
                danger: "rgb(var(--danger) / <alpha-value>)",
                "danger-soft": "rgb(var(--danger-soft) / <alpha-value>)",
                info: "rgb(var(--info) / <alpha-value>)",
                "info-soft": "rgb(var(--info-soft) / <alpha-value>)",
                ring: "rgb(var(--ring) / <alpha-value>)",
            },
            backgroundImage: {
                "grid-subtle":
                    "linear-gradient(rgb(var(--border-subtle) / 0.3) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--border-subtle) / 0.3) 1px, transparent 1px)",
                "radial-glow":
                    "radial-gradient(ellipse at top, rgb(var(--accent) / 0.06) 0%, transparent 60%)",
            },
            backgroundSize: {
                grid: "40px 40px",
            },
            animation: {
                "fade-in": "fadeIn 0.4s ease-in-out",
                "slide-up": "slideUp 0.5s ease-out",
                pulse: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(12px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
            boxShadow: {
                observatory:
                    "0 1px 2px 0 rgb(0 0 0 / 0.06), 0 4px 16px -6px rgb(0 0 0 / 0.12)",
                "observatory-soft":
                    "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 2px 8px -4px rgb(0 0 0 / 0.08)",
            },
        },
    },
    plugins: [],
};

export default config;
