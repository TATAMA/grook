export const LINE_TEXT_MAX = 5000;
export const LINE_REPLY_MAX_MESSAGES = 5;

export function chunkText(
  text: string,
  max = LINE_TEXT_MAX,
): string[] {
  if (text.length <= max) {
    return [text];
  }
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += max) {
    chunks.push(text.slice(i, i + max));
  }
  return chunks;
}

export function toLineTextMessages(text: string): Array<{ type: "text"; text: string }> {
  const chunks = chunkText(text).slice(0, LINE_REPLY_MAX_MESSAGES);
  const last = chunks[chunks.length - 1];
  if (chunks.length === LINE_REPLY_MAX_MESSAGES && last && text.length > LINE_TEXT_MAX * LINE_REPLY_MAX_MESSAGES) {
    const marker = "\n（後略）";
    chunks[chunks.length - 1] = `${last.slice(0, Math.max(0, last.length - marker.length))}${marker}`;
  }
  return chunks.map((item) => ({ type: "text" as const, text: item }));
}
