import { NextResponse } from "next/server";
import { McpContractsRegistry } from "@/lib/services/mcp-contracts";

export async function GET() {
    try {
        const contracts = McpContractsRegistry.getContracts();
        return NextResponse.json({
            status: "active",
            layer: "Phase 5 Governance",
            contracts
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to retrieve MCP contracts", details: String(error) },
            { status: 500 }
        );
    }
}
