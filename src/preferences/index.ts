import type { XPost } from "../x/types.js";

export interface ReportPreferences {
  includeOriginals: boolean;
  includeReposts: boolean;
  /** v1 固定 false：報表不輸出讚 / 回覆 / 瀏覽。之後可在此增刪欄位。 */
  includeEngagement: boolean;
}

export const DEFAULT_PREFERENCES: ReportPreferences = {
  includeOriginals: true,
  includeReposts: true,
  includeEngagement: false,
};

export function loadPreferences(): ReportPreferences {
  return { ...DEFAULT_PREFERENCES };
}

export function applyPreferences(
  posts: XPost[],
  preferences: ReportPreferences,
): XPost[] {
  return posts.filter((post) => {
    if (post.kind === "original") {
      return preferences.includeOriginals;
    }
    if (post.kind === "repost") {
      return preferences.includeReposts;
    }
    return false;
  });
}
