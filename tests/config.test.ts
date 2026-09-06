import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("accepts replace_me placeholders and defaults X_PROVIDER to mock", () => {
    const config = loadConfig({
      LINE_CHANNEL_SECRET: "replace_me",
      LINE_CHANNEL_ACCESS_TOKEN: "replace_me",
    });
    assert.equal(config.xProvider, "mock");
    assert.equal(config.lineBotDisplayName, "Grook");
    assert.equal(config.port, 3000);
  });

  it("rejects a missing LINE channel secret", () => {
    assert.throws(
      () =>
        loadConfig({
          LINE_CHANNEL_ACCESS_TOKEN: "replace_me",
        }),
      /LINE_CHANNEL_SECRET/,
    );
  });

  it("rejects an unknown X_PROVIDER", () => {
    assert.throws(
      () =>
        loadConfig({
          LINE_CHANNEL_SECRET: "replace_me",
          LINE_CHANNEL_ACCESS_TOKEN: "replace_me",
          X_PROVIDER: "scraper",
        }),
      /mock" or "api/,
    );
  });
});
