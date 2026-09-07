import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runMemeNarrativeDigest } from "../src/meme/pipeline.js";

describe("meme narrative digest", () => {
  it("formats a mock report with required sections", async () => {
    const { text } = await runMemeNarrativeDigest({
      provider: "mock",
      now: new Date("2026-09-07T12:00:00.000Z"),
    });
    assert.match(text, /【迷因敘事｜按需】/);
    assert.match(text, /1\) 標準/);
    assert.match(text, /2\) 通過候選/);
    assert.match(text, /3\) 剔除雜訊/);
    assert.match(text, /4\) 免責/);
  });
});
