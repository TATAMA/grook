import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyPreferences,
  DEFAULT_PREFERENCES,
} from "../src/preferences/index.js";
import { formatReport } from "../src/summary/report.js";
import type { XPost } from "../src/x/types.js";

const NOW = new Date("2026-09-07T12:00:00.000Z");
const WINDOW = {
  since: new Date(NOW.getTime() - 6 * 60 * 60 * 1000),
  until: NOW,
};

const POSTS: XPost[] = [
  {
    id: "1",
    createdAt: new Date("2026-09-07T10:00:00.000Z"),
    text: "骨架好了",
    url: "https://x.com/owner/status/1",
    kind: "original",
    authorHandle: "owner",
  },
  {
    id: "2",
    createdAt: new Date("2026-09-07T08:00:00.000Z"),
    text: "轉發一則筆記",
    url: "https://x.com/owner/status/2",
    kind: "repost",
    authorHandle: "owner",
  },
];

describe("formatReport", () => {
  it("lists originals and reposts without engagement numbers", () => {
    const text = formatReport({
      window: WINDOW,
      posts: POSTS,
      ownerHandle: "owner",
      now: NOW,
    });
    assert.match(text, /過去 6 小時/);
    assert.match(text, /@owner/);
    assert.match(text, /原創/);
    assert.match(text, /轉發/);
    assert.match(text, /骨架好了/);
    assert.match(text, /共 2 則/);
    assert.doesNotMatch(text, /讚|回覆|瀏覽|like|reply|view/i);
  });

  it("explains an empty window", () => {
    const text = formatReport({
      window: WINDOW,
      posts: [],
      ownerHandle: "owner",
      now: NOW,
    });
    assert.match(text, /沒有新的貼文或轉發/);
  });
});

describe("applyPreferences", () => {
  it("can drop reposts when that field is turned off", () => {
    const filtered = applyPreferences(POSTS, {
      ...DEFAULT_PREFERENCES,
      includeReposts: false,
    });
    assert.deepEqual(
      filtered.map((post) => post.kind),
      ["original"],
    );
  });
});
