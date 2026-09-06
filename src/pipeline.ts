import { applyPreferences, type ReportPreferences } from "./preferences/index.js";
import { formatReport } from "./summary/report.js";
import { resolveWindow, type TimeWindow } from "./summary/window.js";
import type { LastMentionStore } from "./store/last-mention.js";
import type { XProvider } from "./x/types.js";

export interface RunMentionSummaryInput {
  groupId: string;
  store: LastMentionStore;
  xProvider: XProvider;
  ownerHandle: string;
  preferences: ReportPreferences;
  now: Date;
}

export interface RunMentionSummaryResult {
  text: string;
  window: TimeWindow;
}

export async function runMentionSummary(
  input: RunMentionSummaryInput,
): Promise<RunMentionSummaryResult> {
  const lastSuccessAt = await input.store.getLastSuccessAt(input.groupId);
  const window = resolveWindow(input.now, lastSuccessAt);
  const items = await input.xProvider.fetchFeed({
    since: window.since,
    until: window.until,
    ownerHandle: input.ownerHandle,
  });
  const filtered = applyPreferences(items, input.preferences, input.ownerHandle);
  const text = formatReport({
    window,
    items: filtered,
    ownerHandle: input.ownerHandle,
    now: input.now,
  });
  return { text, window };
}
