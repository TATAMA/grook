import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isBotMentioned } from "../src/line/mention.js";

describe("isBotMentioned", () => {
  it("returns true in a group when LINE marks the bot as isSelf", () => {
    assert.equal(
      isBotMentioned({
        sourceType: "group",
        text: "@Grook 整理",
        mentionees: [{ isSelf: true, type: "user" }],
        botDisplayName: "Grook",
      }),
      true,
    );
  });

  it("returns true in a group when text contains @Grook", () => {
    assert.equal(
      isBotMentioned({
        sourceType: "group",
        text: "嘿 @Grook 幫我整理",
        botDisplayName: "Grook",
      }),
      true,
    );
  });

  it("returns true for fullwidth ＠ and custom display name", () => {
    assert.equal(
      isBotMentioned({
        sourceType: "room",
        text: "＠小助手 請整理",
        botDisplayName: "小助手",
      }),
      true,
    );
  });

  it("returns true when mentionee userId matches the bot", () => {
    assert.equal(
      isBotMentioned({
        sourceType: "group",
        text: "hi",
        mentionees: [{ type: "user", userId: "Ubot" }],
        botDisplayName: "Grook",
        botUserId: "Ubot",
      }),
      true,
    );
  });

  it("returns false when nobody @ the bot", () => {
    assert.equal(
      isBotMentioned({
        sourceType: "group",
        text: "今天天氣不錯",
        mentionees: [{ type: "user", userId: "Usomeone", isSelf: false }],
        botDisplayName: "Grook",
        botUserId: "Ubot",
      }),
      false,
    );
  });

  it("returns false for @All without mentioning the bot", () => {
    assert.equal(
      isBotMentioned({
        sourceType: "group",
        text: "@All 大家午安",
        mentionees: [{ type: "all" }],
        botDisplayName: "Grook",
      }),
      false,
    );
  });

  it("returns false in 1:1 chats even if isSelf is set", () => {
    assert.equal(
      isBotMentioned({
        sourceType: "user",
        text: "@Grook 整理",
        mentionees: [{ isSelf: true }],
        botDisplayName: "Grook",
      }),
      false,
    );
  });
});
