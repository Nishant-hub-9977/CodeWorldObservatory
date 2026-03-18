import { ActionRepresentation } from "../types/se-jepa";
import { InterventionBranch, ScopeClass } from "../types/intervention";

export class ActionEncoder {
    /**
     * Converts an InterventionBranch into a normalized ActionRepresentation.
     * Maps the proposed execution into the abstract "action" space.
     */
    public static encode(branch: InterventionBranch): ActionRepresentation {

        let burden: "low" | "moderate" | "heavy" = "moderate";
        if (branch.scopeImpact.scopeClass === "structural" || branch.riskLevel === "critical") {
            burden = "heavy";
        } else if (branch.scopeImpact.scopeClass === "isolated" && branch.riskLevel === "low") {
            burden = "low";
        }

        return {
            id: `act-${branch.id}`,
            interventionBranchId: branch.id,
            strategy: branch.strategy,
            scopeClass: branch.scopeImpact.scopeClass,
            riskLevel: branch.riskLevel,
            structuralCost: {
                targetFileCount: branch.targetFiles.length,
                estimatedRadius: branch.scopeImpact.estimatedFileRadius,
            },
            verificationBurden: burden
        };
    }
}
