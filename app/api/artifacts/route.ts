import { NextResponse } from "next/server";
import { ArtifactLedgerService } from "@/lib/services/artifact-ledger";

export async function GET() {
    try {
        const ledger = ArtifactLedgerService.getLedger();
        return NextResponse.json(ledger);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to retrieve artifacts", details: String(error) },
            { status: 500 }
        );
    }
}
