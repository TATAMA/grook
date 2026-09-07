export type MentionIntent = "x-summary" | "meme-narrative";

const MEME_KEYWORDS = ["迷因", "敘事", "meme", "narrative"] as const;

/** Detect on-demand meme digest vs default X summary. Keywords are case-insensitive. */
export function detectMentionIntent(text: string | undefined): MentionIntent {
  const normalized = (text ?? "").toLowerCase();
  for (const keyword of MEME_KEYWORDS) {
    if (normalized.includes(keyword.toLowerCase())) {
      return "meme-narrative";
    }
  }
  return "x-summary";
}

export function memeKeywords(): readonly string[] {
  return MEME_KEYWORDS;
}
