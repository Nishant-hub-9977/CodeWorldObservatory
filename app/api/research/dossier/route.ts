import { NextResponse } from "next/server";
import { DossierGenerator } from "@/lib/services/dossier-generator";
import type { DossierGenerationResponse } from "@/lib/types/research-memory";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const dossierResponse = DossierGenerator.generateDossier({ persist: false });
        return NextResponse.json(dossierResponse);
    } catch (error) {
        console.error("Failed to fetch research dossier:", error);
        return NextResponse.json({ error: "Failed to fetch research dossier" }, { status: 500 });
    }
}

export async function POST() {
    try {
        const dossierResponse = DossierGenerator.generateDossier();
        return NextResponse.json(dossierResponse);
    } catch (error) {
        console.error("Failed to generate research dossier:", error);
        return NextResponse.json({ error: "Failed to generate research dossier" }, { status: 500 });
    }
}
