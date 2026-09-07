import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import type { AddressInfo } from "node:net";
import { describe, it } from "node:test";
import { createApp } from "../src/app.js";
import type { AppConfig } from "../src/config.js";
import { DEFAULT_PREFERENCES } from "../src/preferences/index.js";
import { MemoryLastMentionStore } from "../src/store/last-mention.js";
import { MockXProvider } from "../src/x/mock.js";

const SECRET = "test_channel_secret";
const NOW = new Date("2026-09-07T12:00:00.000Z");

const config: AppConfig = {
  port: 0,
  lineChannelSecret: SECRET,
  lineChannelAccessToken: "test_token",
  lineBotDisplayName: "Grook",
  xProvider: "mock",
  xOwnerHandle: "owner",
  xBearerToken: "replace_me",
  memeProvider: "mock",
  dataDir: "/tmp/grook-test",
};

function sign(body: string): string {
  return createHmac("sha256", SECRET).update(body).digest("base64");
}

async function listen(app: ReturnType<typeof createApp>): Promise<{
  baseUrl: string;
  close: () => Promise<void>;
}> {
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  const address = server.address() as AddressInfo;
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}

describe("HTTP endpoints", () => {
  it("GET /health returns ok", async () => {
    const app = createApp({
      config,
      store: new MemoryLastMentionStore(),
      xProvider: MockXProvider.sample(NOW, "owner"),
      lineClient: { async replyText() {} },
      preferences: DEFAULT_PREFERENCES,
      now: () => NOW,
    });
    const { baseUrl, close } = await listen(app);
    try {
      const res = await fetch(`${baseUrl}/health`);
      assert.equal(res.status, 200);
      const body = (await res.json()) as { ok: boolean; name: string };
      assert.equal(body.ok, true);
      assert.equal(body.name, "grook");
    } finally {
      await close();
    }
  });

  it("POST /webhook rejects a missing or invalid signature", async () => {
    const app = createApp({
      config,
      store: new MemoryLastMentionStore(),
      xProvider: MockXProvider.sample(NOW, "owner"),
      lineClient: { async replyText() {} },
      preferences: DEFAULT_PREFERENCES,
      now: () => NOW,
    });
    const { baseUrl, close } = await listen(app);
    const body = JSON.stringify({ events: [], destination: "Ubot" });
    try {
      const missing = await fetch(`${baseUrl}/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      assert.equal(missing.status, 401);

      const invalid = await fetch(`${baseUrl}/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Line-Signature": "not-valid",
        },
        body,
      });
      assert.equal(invalid.status, 401);
    } finally {
      await close();
    }
  });

  it("POST /webhook accepts a signed empty event list", async () => {
    const app = createApp({
      config,
      store: new MemoryLastMentionStore(),
      xProvider: MockXProvider.sample(NOW, "owner"),
      lineClient: { async replyText() {} },
      preferences: DEFAULT_PREFERENCES,
      now: () => NOW,
    });
    const { baseUrl, close } = await listen(app);
    const body = JSON.stringify({ events: [], destination: "Ubot" });
    try {
      const res = await fetch(`${baseUrl}/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Line-Signature": sign(body),
        },
        body,
      });
      assert.equal(res.status, 200);
    } finally {
      await close();
    }
  });

  it("POST /webhook runs the mock summary when the bot is mentioned", async () => {
    const replies: string[] = [];
    const store = new MemoryLastMentionStore();
    const app = createApp({
      config,
      store,
      xProvider: MockXProvider.sample(NOW, "owner"),
      lineClient: {
        async replyText(_token, text) {
          replies.push(text);
        },
      },
      preferences: DEFAULT_PREFERENCES,
      now: () => NOW,
    });
    const { baseUrl, close } = await listen(app);
    const body = JSON.stringify({
      destination: "Ubot",
      events: [
        {
          type: "message",
          replyToken: "reply-token",
          source: { type: "group", groupId: "Cgroup1", userId: "Uuser" },
          message: {
            type: "text",
            text: "@Grook 整理一下",
            mention: { mentionees: [{ index: 0, length: 6, type: "user", isSelf: true }] },
          },
        },
      ],
    });
    try {
      const res = await fetch(`${baseUrl}/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Line-Signature": sign(body),
        },
        body,
      });
      assert.equal(res.status, 200);
      assert.equal(replies.length, 1);
      assert.match(replies[0] ?? "", /Grook 整理/);
      assert.equal((await store.getLastSuccessAt("Cgroup1"))?.toISOString(), NOW.toISOString());
    } finally {
      await close();
    }
  });

  it("POST /webhook runs meme digest without advancing last-mention", async () => {
    const replies: string[] = [];
    const store = new MemoryLastMentionStore();
    const app = createApp({
      config,
      store,
      xProvider: MockXProvider.sample(NOW, "owner"),
      lineClient: {
        async replyText(_token, text) {
          replies.push(text);
        },
      },
      preferences: DEFAULT_PREFERENCES,
      now: () => NOW,
    });
    const { baseUrl, close } = await listen(app);
    const body = JSON.stringify({
      destination: "Ubot",
      events: [
        {
          type: "message",
          replyToken: "reply-token-meme",
          source: { type: "group", groupId: "Cgroup2", userId: "Uuser" },
          message: {
            type: "text",
            text: "@Grook 迷因",
            mention: { mentionees: [{ index: 0, length: 6, type: "user", isSelf: true }] },
          },
        },
      ],
    });
    try {
      const res = await fetch(`${baseUrl}/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Line-Signature": sign(body),
        },
        body,
      });
      assert.equal(res.status, 200);
      assert.equal(replies.length, 1);
      assert.match(replies[0] ?? "", /迷因敘事/);
      assert.equal(await store.getLastSuccessAt("Cgroup2"), null);
    } finally {
      await close();
    }
  });
});
