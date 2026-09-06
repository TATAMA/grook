import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ApiXProvider } from "../src/x/api.js";
import { MockXProvider } from "../src/x/mock.js";

const NOW = new Date("2026-09-07T12:00:00.000Z");

describe("MockXProvider", () => {
  it("returns timeline and followed notifications inside the window", async () => {
    const provider = MockXProvider.sample(NOW, "owner");
    const items = await provider.fetchFeed({
      since: new Date(NOW.getTime() - 24 * 60 * 60 * 1000),
      until: NOW,
      ownerHandle: "owner",
    });
    const ids = items.map((item) => item.id);
    assert.equal(ids.includes("mock-timeline-alice"), true);
    assert.equal(ids.includes("mock-timeline-bob-repost"), true);
    assert.equal(ids.includes("mock-notify-carol"), true);
    assert.equal(ids.includes("mock-notify-unfollowed-mention"), true);
    assert.equal(ids.includes("mock-scam-airdrop"), true);
    assert.equal(ids.includes("mock-own-post"), true);
    assert.equal(ids.includes("mock-too-old"), false);
    assert.equal(
      items.every((item) => !("likes" in item) && !("replies" in item) && !("views" in item)),
      true,
    );
  });

  it("returns nothing when the window is shorter than the newest mock item", async () => {
    const provider = MockXProvider.sample(NOW, "owner");
    const items = await provider.fetchFeed({
      since: new Date(NOW.getTime() - 30 * 60 * 1000),
      until: NOW,
      ownerHandle: "owner",
    });
    assert.equal(items.length, 0);
  });
});

describe("ApiXProvider", () => {
  it("throws a TODO error instead of scraping", async () => {
    const provider = new ApiXProvider({
      bearerToken: "replace_me",
      ownerHandle: "owner",
    });
    await assert.rejects(
      () =>
        provider.fetchFeed({
          since: new Date(NOW.getTime() - 3600_000),
          until: NOW,
          ownerHandle: "owner",
        }),
      /not implemented/i,
    );
  });
});
