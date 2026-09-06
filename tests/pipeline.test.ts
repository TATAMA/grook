import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { handleWebhookEvent, type LineTextEvent } from "../src/line/handler.js";
import { runMentionSummary } from "../src/pipeline.js";
import { DEFAULT_PREFERENCES } from "../src/preferences/index.js";
import { MemoryLastMentionStore } from "../src/store/last-mention.js";
import { MockXProvider } from "../src/x/mock.js";
import type { AppConfig } from "../src/config.js";
import type { LineReplyClient } from "../src/line/client.js";
import type { XProvider } from "../src/x/types.js";

const NOW = new Date("2026-09-07T12:00:00.000Z");

const config: AppConfig = {
  port: 3000,
  lineChannelSecret: "test_secret",
  lineChannelAccessToken: "test_token",
  lineBotDisplayName: "Grook",
  xProvider: "mock",
  xOwnerHandle: "owner",
  xBearerToken: "replace_me",
  dataDir: "/tmp/grook-test",
};

function mentionEvent(overrides: Partial<LineTextEvent> = {}): LineTextEvent {
  return {
    type: "message",
    replyToken: "reply-1",
    source: { type: "group", groupId: "Cgroup1", userId: "Uuser" },
    message: {
      type: "text",
      text: "@Grook 整理一下",
      mention: { mentionees: [{ isSelf: true, type: "user" }] },
    },
    ...overrides,
  };
}

describe("runMentionSummary", () => {
  it("uses a 6-hour window after a successful mention 6 hours ago", async () => {
    const store = new MemoryLastMentionStore();
    await store.setLastSuccessAt(
      "Cgroup1",
      new Date(NOW.getTime() - 6 * 60 * 60 * 1000),
    );
    const result = await runMentionSummary({
      groupId: "Cgroup1",
      store,
      xProvider: MockXProvider.sample(NOW, "owner"),
      ownerHandle: "owner",
      preferences: DEFAULT_PREFERENCES,
      now: NOW,
    });
    assert.match(result.text, /過去 6 小時/);
    assert.match(result.text, /webhook 骨架/);
    assert.doesNotMatch(result.text, /超過 24 小時/);
  });
});

describe("handleWebhookEvent", () => {
  it("replies and records last success only when the bot is @mentioned", async () => {
    const store = new MemoryLastMentionStore();
    const replies: string[] = [];
    const lineClient: LineReplyClient = {
      async replyText(_token, text) {
        replies.push(text);
      },
    };

    const ignored = await handleWebhookEvent(
      mentionEvent({
        message: { type: "text", text: "隨便聊聊" },
      }),
      {
        config,
        store,
        xProvider: MockXProvider.sample(NOW, "owner"),
        lineClient,
        preferences: DEFAULT_PREFERENCES,
        now: () => NOW,
      },
    );
    assert.equal(ignored, "ignored");
    assert.equal(replies.length, 0);
    assert.equal(await store.getLastSuccessAt("Cgroup1"), null);

    const replied = await handleWebhookEvent(mentionEvent(), {
      config,
      store,
      xProvider: MockXProvider.sample(NOW, "owner"),
      lineClient,
      preferences: DEFAULT_PREFERENCES,
      now: () => NOW,
    });
    assert.equal(replied, "replied");
    assert.equal(replies.length, 1);
    assert.match(replies[0] ?? "", /Grook 整理/);
    assert.equal((await store.getLastSuccessAt("Cgroup1"))?.toISOString(), NOW.toISOString());
  });

  it("does not record last success when reply fails", async () => {
    const store = new MemoryLastMentionStore();
    const lineClient: LineReplyClient = {
      async replyText() {
        throw new Error("LINE down");
      },
    };
    const result = await handleWebhookEvent(mentionEvent(), {
      config,
      store,
      xProvider: MockXProvider.sample(NOW, "owner"),
      lineClient,
      preferences: DEFAULT_PREFERENCES,
      now: () => NOW,
    });
    assert.equal(result, "ignored");
    assert.equal(await store.getLastSuccessAt("Cgroup1"), null);
  });

  it("does not record last success when the X provider fails", async () => {
    const store = new MemoryLastMentionStore();
    const replies: string[] = [];
    const failingProvider: XProvider = {
      async fetchOwnerPosts() {
        throw new Error("boom");
      },
    };
    const lineClient: LineReplyClient = {
      async replyText(_token, text) {
        replies.push(text);
      },
    };
    const result = await handleWebhookEvent(mentionEvent(), {
      config,
      store,
      xProvider: failingProvider,
      lineClient,
      preferences: DEFAULT_PREFERENCES,
      now: () => NOW,
    });
    assert.equal(result, "ignored");
    assert.match(replies[0] ?? "", /整理失敗/);
    assert.equal(await store.getLastSuccessAt("Cgroup1"), null);
  });
});
