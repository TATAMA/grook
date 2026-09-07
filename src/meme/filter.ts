import type {
  NarrativeCandidate,
  NewPoolSignal,
  RejectedNoise,
} from "./types.js";

/** Hard narrative screen: culture-before-coin, sustained discussion, creative derivatives. */
export function applyNarrativeHardFilter(
  pools: NewPoolSignal[],
  hints: NarrativeCandidate[] = [],
): { passed: NarrativeCandidate[]; rejected: RejectedNoise[] } {
  const passed: NarrativeCandidate[] = [];
  const rejected: RejectedNoise[] = [];

  for (const hint of hints) {
    const blob = `${hint.narrative} ${hint.discussion}`;
    const ok =
      hint.narrative.trim().length > 0 &&
      hint.discussion.trim().length > 0 &&
      !/一波流|純刷量|純 kol|boost|空投連錢包/i.test(blob);
    if (ok) {
      passed.push(hint);
    } else {
      rejected.push({
        name: hint.name,
        reason: "未通過敘事硬過濾（缺持續討論／二創，或像一波流雜訊）",
      });
    }
  }

  for (const pool of pools) {
    const already =
      passed.some((p) => p.name === pool.baseSymbol) ||
      rejected.some((r) => r.name === pool.baseSymbol) ||
      hints.some((h) => h.name === pool.baseSymbol);
    if (already) continue;
    rejected.push({
      name: pool.baseSymbol,
      reason: "僅有新池／量能訊號，尚無文化先於幣＋可持續討論證據",
    });
  }

  return { passed: passed.slice(0, 5), rejected: rejected.slice(0, 20) };
}
