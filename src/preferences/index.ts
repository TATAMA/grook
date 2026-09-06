import { looksLikeScam } from "../summary/scam.js";
import type { XFeedItem } from "../x/types.js";

export interface ReportPreferences {
  includeTimeline: boolean;
  includeFollowedNotifications: boolean;
  excludeOwnPosts: boolean;
  excludeUnfollowedMentions: boolean;
  excludeScams: boolean;
  /** v1 固定 false：報表不輸出讚 / 回覆 / 瀏覽。之後可在此增刪欄位。 */
  includeEngagement: boolean;
}

export const DEFAULT_PREFERENCES: ReportPreferences = {
  includeTimeline: true,
  includeFollowedNotifications: true,
  excludeOwnPosts: true,
  excludeUnfollowedMentions: true,
  excludeScams: true,
  includeEngagement: false,
};

export function loadPreferences(): ReportPreferences {
  return { ...DEFAULT_PREFERENCES };
}

export function normalizeHandle(handle: string): string {
  return handle.replace(/^@/, "").toLowerCase();
}

function dedupePreferTimeline(items: XFeedItem[]): XFeedItem[] {
  const byId = new Map<string, XFeedItem>();
  for (const item of items) {
    const existing = byId.get(item.id);
    if (!existing || (item.source === "timeline" && existing.source !== "timeline")) {
      byId.set(item.id, item);
    }
  }
  return [...byId.values()].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );
}

export function applyPreferences(
  items: XFeedItem[],
  preferences: ReportPreferences,
  ownerHandle: string,
): XFeedItem[] {
  const owner = normalizeHandle(ownerHandle);
  const kept = items.filter((item) => {
    if (
      preferences.excludeOwnPosts &&
      normalizeHandle(item.authorHandle) === owner
    ) {
      return false;
    }
    if (item.source === "timeline" && !preferences.includeTimeline) {
      return false;
    }
    if (item.source === "notification" && !preferences.includeFollowedNotifications) {
      return false;
    }
    if (!item.authorIsFollowed) {
      const allowUnfollowedMention =
        item.mentionsOwner && !preferences.excludeUnfollowedMentions;
      if (!allowUnfollowedMention) {
        return false;
      }
    }
    if (preferences.excludeScams && looksLikeScam(item.text)) {
      return false;
    }
    return true;
  });

  return dedupePreferTimeline(kept);
}
