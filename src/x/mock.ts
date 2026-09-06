import type { FetchFeedParams, XFeedItem, XProvider } from "./types.js";

export class MockXProvider implements XProvider {
  constructor(private readonly items: XFeedItem[]) {}

  static sample(now: Date = new Date(), ownerHandle = "owner"): MockXProvider {
    return new MockXProvider([
      {
        id: "mock-timeline-alice",
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        text: "今天把 webhook 骨架補完了。",
        url: "https://x.com/alice/status/1",
        kind: "original",
        authorHandle: "alice",
        source: "timeline",
        authorIsFollowed: true,
        mentionsOwner: false,
      },
      {
        id: "mock-timeline-bob-repost",
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        text: "轉發：TypeScript + LINE Messaging API 筆記",
        url: "https://x.com/bob/status/2",
        kind: "repost",
        authorHandle: "bob",
        source: "timeline",
        authorIsFollowed: true,
        mentionsOwner: false,
      },
      {
        id: "mock-notify-carol",
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        text: "一篇新筆記",
        url: "https://x.com/carol/status/3",
        kind: "original",
        authorHandle: "carol",
        source: "notification",
        authorIsFollowed: true,
        mentionsOwner: false,
      },
      {
        id: "mock-notify-unfollowed-mention",
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        text: "@owner 看一下這個",
        url: "https://x.com/spammer/status/4",
        kind: "original",
        authorHandle: "spammer",
        source: "notification",
        authorIsFollowed: false,
        mentionsOwner: true,
      },
      {
        id: "mock-scam-airdrop",
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        text: "限時空投免費領取，請連接錢包",
        url: "https://x.com/airdropbot/status/5",
        kind: "original",
        authorHandle: "airdropbot",
        source: "notification",
        authorIsFollowed: false,
        mentionsOwner: true,
      },
      {
        id: "mock-own-post",
        createdAt: new Date(now.getTime() - 90 * 60 * 1000),
        text: "這是自己的貼文，不應出現在整理裡。",
        url: `https://x.com/${ownerHandle}/status/6`,
        kind: "original",
        authorHandle: ownerHandle,
        source: "timeline",
        authorIsFollowed: false,
        mentionsOwner: false,
      },
      {
        id: "mock-too-old",
        createdAt: new Date(now.getTime() - 30 * 60 * 60 * 1000),
        text: "這則超過 24 小時，不應出現在預設時間窗。",
        url: "https://x.com/alice/status/7",
        kind: "original",
        authorHandle: "alice",
        source: "timeline",
        authorIsFollowed: true,
        mentionsOwner: false,
      },
    ]);
  }

  async fetchFeed(params: FetchFeedParams): Promise<XFeedItem[]> {
    return this.items
      .filter((item) => {
        const t = item.createdAt.getTime();
        return t > params.since.getTime() && t <= params.until.getTime();
      })
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}
