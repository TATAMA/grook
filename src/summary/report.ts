import { formatWindowLabel, type TimeWindow } from "./window.js";
import type { XFeedItem } from "../x/types.js";

const TAIPEI = "Asia/Taipei";

export interface FormatReportInput {
  window: TimeWindow;
  items: XFeedItem[];
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

function kindLabel(kind: XFeedItem["kind"]): string {
  return kind === "repost" ? "轉發" : "原創";
}

function formatItem(item: XFeedItem, index: number): string {
  const time = formatPostTime(item.createdAt);
  const handle = item.authorHandle.replace(/^@/, "");
  return `${index + 1}. @${handle} · ${kindLabel(item.kind)} · ${time}\n${item.text}\n${item.url}`;
}

function formatSection(title: string, items: XFeedItem[]): string | null {
  if (items.length === 0) {
    return null;
  }
  const lines = items.map((item, index) => formatItem(item, index));
  return `【${title}】\n${lines.join("\n\n")}`;
}

export function formatReport(input: FormatReportInput): string {
  const handle = input.ownerHandle.replace(/^@/, "");
  const windowLabel = formatWindowLabel(input.window);
  const header = `Grook 整理（${windowLabel}）\n@${handle} 的時間軸與跟隨中新貼文`;

  if (input.items.length === 0) {
    return `${header}\n這段時間沒有新的時間軸或跟隨中貼文。`;
  }

  const timeline = input.items.filter((item) => item.source === "timeline");
  const notifications = input.items.filter((item) => item.source === "notification");
  const sections = [
    formatSection("時間軸", timeline),
    formatSection("跟隨中的新貼文", notifications),
  ].filter((section): section is string => section !== null);

  return `${header}\n\n${sections.join("\n\n")}\n\n共 ${input.items.length} 則。下次在群組 @Grook 會從這次之後繼續整理。`;
}
