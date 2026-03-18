import { NextResponse } from "next/server";
import { StateTransitionChainer } from "@/lib/services/state-transition-chain";
import { JepaPrototypeMapping } from "@/lib/types/se-jepa";

export async function GET() {
    try {
        const chain = await StateTransitionChainer.generateChain("SE-JEPA Operational Prototype Initialization");

        if (!chain) {
            return NextResponse.json(
                { error: "Could not generate SE-JEPA transition chain" },
                { status: 500 }
            );
        }

        const mapping: JepaPrototypeMapping = {
            status: "active",
            mode: "structural-prototype",
            currentChain: chain
        };

        return NextResponse.json(mapping);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to retrieve SE-JEPA prototype mapping", details: String(error) },
            { status: 500 }
        );
    }
}
