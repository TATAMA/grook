import { formatMemeReport } from "./report.js";
import { scanMemeNarrative } from "./scan.js";
import type { MemeProviderKind } from "./types.js";

export interface RunMemeNarrativeInput {
  provider?: MemeProviderKind;
  now?: Date;
}

export async function runMemeNarrativeDigest(
  input: RunMemeNarrativeInput = {},
): Promise<{ text: string }> {
  const provider = input.provider ?? "mock";
  const result = await scanMemeNarrative(provider);
  const text = formatMemeReport(result, input.now ?? new Date());
  return { text };
}
