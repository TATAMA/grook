import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { detectMentionIntent } from "../src/intent.js";

describe("detectMentionIntent", () => {
  it("defaults to x-summary", () => {
    assert.equal(detectMentionIntent("@Grook 整理一下"), "x-summary");
  });

  it("detects Traditional Chinese keywords", () => {
    assert.equal(detectMentionIntent("@Grook 迷因"), "meme-narrative");
    assert.equal(detectMentionIntent("@Grook 敘事日報"), "meme-narrative");
  });

  it("detects English keywords case-insensitively", () => {
    assert.equal(detectMentionIntent("@Grook MEME"), "meme-narrative");
    assert.equal(detectMentionIntent("@Grook Narrative please"), "meme-narrative");
  });
});
