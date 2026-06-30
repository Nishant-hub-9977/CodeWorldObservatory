// ─── External Evidence Pack Static Import ───────────────────────────
// Imports the committed Q9 sample pack and validates it as read-only
// evidence. No upload handling, filesystem scanning, or external API use.

import samplePackJson from "@/data/external-evidence-pack.json";
import { validateEvidencePack } from "./validate";

export const externalEvidencePackValidation = validateEvidencePack(samplePackJson as unknown);
export const externalEvidencePack = externalEvidencePackValidation.pack;
