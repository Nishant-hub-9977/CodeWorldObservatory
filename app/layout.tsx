import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PageShell } from "@/components/shell/PageShell";
import { ThemeProvider } from "@/lib/theme/theme-provider";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "CodeWorld Observatory",
    description:
        "A simulation-first control plane for agentic software engineering. Treating software repositories as dynamic causal worlds.",
    keywords: [
        "software intelligence",
        "simulation",
        "counterfactual planning",
        "agentic engineering",
        "world models",
        "SE-JEPA",
    ],
    openGraph: {
        title: "CodeWorld Observatory",
        description:
            "Imagine code futures before acting. A new interaction model for agentic software engineering.",
        type: "website",
    },
};

const themeScript = `try{var t=localStorage.getItem("observatory-theme");var r=t;if(!t||t==="system"){r=window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"}if(r==="light"){document.documentElement.classList.remove("dark");document.documentElement.classList.add("light")}else{document.documentElement.classList.remove("light");document.documentElement.classList.add("dark")}}catch(e){}`;

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
            </head>
            <body className={`${inter.variable} antialiased`}>
                <ThemeProvider defaultTheme="system">
                    <PageShell>{children}</PageShell>
                </ThemeProvider>
            </body>
        </html>
    );
}
