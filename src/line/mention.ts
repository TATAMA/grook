export interface Mentionee {
  index?: number;
  length?: number;
  type?: string;
  userId?: string;
  isSelf?: boolean;
}

export interface MentionCheckInput {
  sourceType?: string;
  text?: string;
  mentionees?: Mentionee[];
  botDisplayName: string;
  botUserId?: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isGroupSource(sourceType?: string): boolean {
  return sourceType === "group" || sourceType === "room";
}

export function isBotMentioned(input: MentionCheckInput): boolean {
  if (!isGroupSource(input.sourceType)) {
    return false;
  }

  const mentionees = input.mentionees ?? [];
  if (mentionees.some((item) => item.isSelf === true)) {
    return true;
  }
  if (
    input.botUserId &&
    mentionees.some((item) => item.userId === input.botUserId)
  ) {
    return true;
  }

  const text = input.text ?? "";
  const names = new Set<string>(
    ["Grook", input.botDisplayName].filter((name) => name.trim() !== ""),
  );
  for (const name of names) {
    const pattern = new RegExp(`[@＠]${escapeRegExp(name)}`, "i");
    if (pattern.test(text)) {
      return true;
    }
  }
  return false;
}
