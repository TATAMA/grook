import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ApiXProvider } from "../src/x/api.js";
import { MockXProvider } from "../src/x/mock.js";

const NOW = new Date("2026-09-07T12:00:00.000Z");

describe("MockXProvider", () => {
  it("returns originals and reposts inside the window and drops older posts", async () => {
    const provider = MockXProvider.sample(NOW, "owner");
    const posts = await provider.fetchOwnerPosts({
      since: new Date(NOW.getTime() - 24 * 60 * 60 * 1000),
      until: NOW,
      ownerHandle: "owner",
    });
    assert.deepEqual(
      posts.map((post) => post.id),
      ["mock-repost-recent", "mock-original-recent"],
    );
    assert.equal(
      posts.every((post) => !("likes" in post) && !("replies" in post) && !("views" in post)),
      true,
    );
  });

  it("returns nothing when the window is shorter than the newest mock post", async () => {
    const provider = MockXProvider.sample(NOW, "owner");
    const posts = await provider.fetchOwnerPosts({
      since: new Date(NOW.getTime() - 30 * 60 * 1000),
      until: NOW,
      ownerHandle: "owner",
    });
    assert.equal(posts.length, 0);
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
        provider.fetchOwnerPosts({
          since: new Date(NOW.getTime() - 3600_000),
          until: NOW,
          ownerHandle: "owner",
        }),
      /not implemented/i,
    );
  });
});
