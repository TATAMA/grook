import type { FetchOwnerPostsParams, XPost, XProvider } from "./types.js";

export class MockXProvider implements XProvider {
  constructor(private readonly posts: XPost[]) {}

  static sample(now: Date = new Date(), ownerHandle = "owner"): MockXProvider {
    return new MockXProvider([
      {
        id: "mock-original-recent",
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        text: "今天把 Grook 的 webhook 骨架補完了。",
        url: `https://x.com/${ownerHandle}/status/1`,
        kind: "original",
        authorHandle: ownerHandle,
      },
      {
        id: "mock-repost-recent",
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        text: "轉發：TypeScript + LINE Messaging API 筆記",
        url: `https://x.com/${ownerHandle}/status/2`,
        kind: "repost",
        authorHandle: ownerHandle,
      },
      {
        id: "mock-original-old",
        createdAt: new Date(now.getTime() - 30 * 60 * 60 * 1000),
        text: "這則超過 24 小時，不應出現在預設時間窗。",
        url: `https://x.com/${ownerHandle}/status/3`,
        kind: "original",
        authorHandle: ownerHandle,
      },
    ]);
  }

  async fetchOwnerPosts(params: FetchOwnerPostsParams): Promise<XPost[]> {
    return this.posts
      .filter((post) => {
        const t = post.createdAt.getTime();
        return t > params.since.getTime() && t <= params.until.getTime();
      })
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}
