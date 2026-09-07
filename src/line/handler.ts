import type { AppConfig } from "../config.js";
import { detectMentionIntent } from "../intent.js";
import { runMemeNarrativeDigest } from "../meme/pipeline.js";
import { runMentionSummary } from "../pipeline.js";
import type { ReportPreferences } from "../preferences/index.js";
import type { LastMentionStore } from "../store/last-mention.js";
import type { XProvider } from "../x/types.js";
import type { LineReplyClient } from "./client.js";
import { isBotMentioned, type Mentionee } from "./mention.js";

export interface LineTextEvent {
  type?: string;
  replyToken?: string;
  source?: {
    type?: string;
    groupId?: string;
    roomId?: string;
    userId?: string;
  };
  message?: {
    type?: string;
    text?: string;
    mention?: {
      mentionees?: Mentionee[];
    };
  };
}

export interface HandlerContext {
  config: AppConfig;
  store: LastMentionStore;
  xProvider: XProvider;
  lineClient: LineReplyClient;
  preferences: ReportPreferences;
  now: () => Date;
  botUserId?: string;
}

export function groupIdFromEvent(event: LineTextEvent): string | undefined {
  return event.source?.groupId ?? event.source?.roomId;
}

export async function handleWebhookEvent(
  event: LineTextEvent,
  ctx: HandlerContext,
): Promise<"replied" | "ignored"> {
  if (event.type !== "message" || event.message?.type !== "text") {
    return "ignored";
  }

  const groupId = groupIdFromEvent(event);
  if (!groupId || !event.replyToken) {
    return "ignored";
  }

  const mentioned = isBotMentioned({
    sourceType: event.source?.type,
    text: event.message.text,
    mentionees: event.message.mention?.mentionees,
    botDisplayName: ctx.config.lineBotDisplayName,
    botUserId: ctx.botUserId,
  });
  if (!mentioned) {
    return "ignored";
  }

  const intent = detectMentionIntent(event.message.text);
  const now = ctx.now();
  try {
    if (intent === "meme-narrative") {
      const { text } = await runMemeNarrativeDigest({
        provider: ctx.config.memeProvider,
        now,
      });
      await ctx.lineClient.replyText(event.replyToken, text);
      // Do not advance X last-mention window for meme-only requests.
      return "replied";
    }

    const { text } = await runMentionSummary({
      groupId,
      store: ctx.store,
      xProvider: ctx.xProvider,
      ownerHandle: ctx.config.xOwnerHandle,
      preferences: ctx.preferences,
      now,
    });
    await ctx.lineClient.replyText(event.replyToken, text);
    await ctx.store.setLastSuccessAt(groupId, now);
    return "replied";
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("failed to handle @Grook mention:", message);
    try {
      await ctx.lineClient.replyText(
        event.replyToken,
        "Grook 整理失敗，請稍後再 @ 我一次。",
      );
    } catch (replyErr) {
      const replyMessage =
        replyErr instanceof Error ? replyErr.message : String(replyErr);
      console.error("failed to send error reply:", replyMessage);
    }
    return "ignored";
  }
}
