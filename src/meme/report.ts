import type { MemeScanResult } from "./types.js";

export function formatMemeReport(result: MemeScanResult, now = new Date()): string {
  const lines: string[] = [];
  lines.push("【迷因敘事｜按需】");
  lines.push(`時間：${now.toISOString()}`);
  lines.push("");
  lines.push(`1) 標準：${result.standardLine}`);
  lines.push("");

  if (result.passed.length === 0) {
    lines.push("2) 通過候選：0");
    lines.push(
      result.emptyReason ?? "本次無合格敘事候選（嚴篩、寧缺勿濫）。",
    );
  } else {
    lines.push(`2) 通過候選（${result.passed.length}）`);
    result.passed.forEach((c, i) => {
      lines.push("");
      lines.push(
        `${i + 1}. ${c.name}${c.symbol ? `（${c.symbol}）` : ""}｜${c.chainId}`,
      );
      lines.push(`- 敘事：${c.narrative}`);
      lines.push(`- 討論：${c.discussion}`);
      lines.push(`- 共鳴：${c.resonance}`);
      lines.push(`- 鏈上：${c.onchain}`);
      if (c.url) lines.push(`- 連結：${c.url}`);
    });
  }

  lines.push("");
  lines.push("3) 剔除雜訊");
  if (result.rejected.length === 0) {
    lines.push("- （無）");
  } else {
    for (const r of result.rejected.slice(0, 10)) {
      lines.push(`- ${r.name}：${r.reason}`);
    }
  }

  if (result.chainRanking.length > 0) {
    lines.push("");
    lines.push("（參考）鏈量排名粗看：");
    for (const row of result.chainRanking.slice(0, 8)) {
      lines.push(
        `- ${row.label}：≈$${Math.round(row.volumeUsd24h).toLocaleString("en-US")}`,
      );
    }
  }

  lines.push("");
  lines.push(
    "4) 免責：非投資建議；鏈上與社群訊號可能延遲或不完整。資料來源以公開 HTTPS API／mock 為限。",
  );
  return lines.join("\n");
}
