import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyPreferences,
  DEFAULT_PREFERENCES,
} from "../src/preferences/index.js";
import { looksLikeScam } from "../src/summary/scam.js";
import type { XFeedItem } from "../src/x/types.js";

const NOW = new Date("2026-09-07T12:00:00.000Z");

function item(overrides: Partial<XFeedItem>): XFeedItem {
  return {
    id: "id",
    createdAt: NOW,
    text: "正常貼文",
    url: "https://x.com/alice/status/1",
    kind: "original",
    authorHandle: "alice",
    source: "timeline",
    authorIsFollowed: true,
    mentionsOwner: false,
    ...overrides,
  };
}

describe("looksLikeScam", () => {
  it("lets ordinary posts through", () => {
    assert.equal(looksLikeScam("今天把 webhook 骨架補完了。"), false);
  });

  it("flags obvious airdrop / wallet bait", () => {
    assert.equal(
      looksLikeScam("免費領取空投，請立刻連接錢包驗證 https://example.invalid"),
      true,
    );
    assert.equal(looksLikeScam("Connect wallet to claim your airdrop now"), true);
    assert.equal(looksLikeScam("私訊我領獎，保證獲利，請提供助記詞"), true);
  });
});

describe("applyPreferences", () => {
  it("keeps followed timeline posts and followed-account notifications", () => {
    const filtered = applyPreferences(
      [
        item({ id: "tl", source: "timeline", authorHandle: "alice" }),
        item({
          id: "note",
          source: "notification",
          authorHandle: "carol",
          authorIsFollowed: true,
        }),
      ],
      DEFAULT_PREFERENCES,
      "owner",
    );
    assert.deepEqual(
      filtered.map((row) => row.id),
      ["tl", "note"],
    );
  });

  it("drops the owner's own posts", () => {
    const filtered = applyPreferences(
      [item({ id: "mine", authorHandle: "owner", source: "timeline" })],
      DEFAULT_PREFERENCES,
      "owner",
    );
    assert.deepEqual(filtered, []);
  });

  it("drops mentions from accounts the owner does not follow", () => {
    const filtered = applyPreferences(
      [
        item({
          id: "stranger-at",
          source: "notification",
          authorHandle: "spammer",
          authorIsFollowed: false,
          mentionsOwner: true,
          text: "@owner 看一下這個",
        }),
      ],
      DEFAULT_PREFERENCES,
      "owner",
    );
    assert.deepEqual(filtered, []);
  });

  it("drops obvious scam copy even from a followed account", () => {
    const filtered = applyPreferences(
      [
        item({
          id: "scam",
          authorHandle: "alice",
          authorIsFollowed: true,
          text: "限時空投免費領取，請連接錢包",
        }),
      ],
      DEFAULT_PREFERENCES,
      "owner",
    );
    assert.deepEqual(filtered, []);
  });

  it("prefers the timeline copy when the same post also arrives as a notification", () => {
    const filtered = applyPreferences(
      [
        item({ id: "same", source: "notification", authorHandle: "alice" }),
        item({ id: "same", source: "timeline", authorHandle: "alice" }),
      ],
      DEFAULT_PREFERENCES,
      "owner",
    );
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]?.source, "timeline");
  });
});
