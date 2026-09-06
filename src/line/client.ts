import { messagingApi } from "@line/bot-sdk";
import { toLineTextMessages } from "./text.js";

export interface LineReplyClient {
  replyText(replyToken: string, text: string): Promise<void>;
}

export function createSdkLineClient(channelAccessToken: string): LineReplyClient {
  const client = new messagingApi.MessagingApiClient({
    channelAccessToken,
  });

  return {
    async replyText(replyToken: string, text: string): Promise<void> {
      await client.replyMessage({
        replyToken,
        messages: toLineTextMessages(text),
      });
    },
  };
}
