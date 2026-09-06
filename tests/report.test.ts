import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatReport } from "../src/summary/report.js";
import type { XFeedItem } from "../src/x/types.js";

const NOW = new Date("2026-09-07T12:00:00.000Z");
const WINDOW = {
  since: new Date(NOW.getTime() - 6 * 60 * 60 * 1000),
  until: NOW,
};

const ITEMS: XFeedItem[] = [
  {
    id: "1",
    createdAt: new Date("2026-09-07T10:00:00.000Z"),
    text: "今天把 webhook 骨架補完了。",
    url: "https://x.com/alice/status/1",
    kind: "original",
    authorHandle: "alice",
    source: "timeline",
    authorIsFollowed: true,
    mentionsOwner: false,
  },
  {
    id: "2",
    createdAt: new Date("2026-09-07T08:00:00.000Z"),
    text: "一篇新筆記",
    url: "https://x.com/carol/status/2",
    kind: "original",
    authorHandle: "carol",
    source: "notification",
    authorIsFollowed: true,
    mentionsOwner: false,
  },
];

describe("formatReport", () => {
  it("lists timeline and followed notifications without engagement numbers", () => {
    const text = formatReport({
      window: WINDOW,
      items: ITEMS,
      ownerHandle: "owner",
      now: NOW,
    });
    assert.match(text, /過去 6 小時/);
    assert.match(text, /時間軸/);
    assert.match(text, /跟隨中/);
    assert.match(text, /@alice/);
    assert.match(text, /@carol/);
    assert.match(text, /webhook 骨架/);
    assert.match(text, /共 2 則/);
    assert.doesNotMatch(text, /讚|回覆|瀏覽|like|reply|view/i);
  });

  it("explains an empty window", () => {
    const text = formatReport({
      window: WINDOW,
      items: [],
      ownerHandle: "owner",
      now: NOW,
    });
    assert.match(text, /沒有新的時間軸或跟隨中貼文/);
  });
});
