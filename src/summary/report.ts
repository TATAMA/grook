import { formatWindowLabel, type TimeWindow } from "./window.js";
import type { XPost } from "../x/types.js";

const TAIPEI = "Asia/Taipei";

export interface FormatReportInput {
  window: TimeWindow;
  posts: XPost[];
  ownerHandle: string;
  now: Date;
}

export function formatPostTime(date: Date): string {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: TAIPEI,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function kindLabel(kind: XPost["kind"]): string {
  return kind === "repost" ? "轉發" : "原創";
}

export function formatReport(input: FormatReportInput): string {
  const handle = input.ownerHandle.replace(/^@/, "");
  const windowLabel = formatWindowLabel(input.window);
  const header = `Grook 整理（${windowLabel}）\n主人 @${handle}`;

  if (input.posts.length === 0) {
    return `${header}\n這段時間沒有新的貼文或轉發。`;
  }

  const lines = input.posts.map((post, index) => {
    const time = formatPostTime(post.createdAt);
    return `${index + 1}. ${kindLabel(post.kind)} · ${time}\n${post.text}\n${post.url}`;
  });

  return `${header}\n\n${lines.join("\n\n")}\n\n共 ${input.posts.length} 則。下次在群組 @Grook 會從這次之後繼續整理。`;
}
