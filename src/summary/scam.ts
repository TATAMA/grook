const SCAM_PATTERNS: RegExp[] = [
  /連接錢包/,
  /connect\s*wallet/i,
  /免費領取/,
  /領取空投/,
  /限時空投/,
  /airdrop/i,
  /助記詞/,
  /seed\s*phrase/i,
  /私訊.{0,8}領/,
  /保證獲利/,
  /claim\s+your\s+(airdrop|reward|prize)/i,
  /雙倍返還/,
  /點擊.{0,8}領獎/,
];

export function looksLikeScam(text: string): boolean {
  return SCAM_PATTERNS.some((pattern) => pattern.test(text));
}
