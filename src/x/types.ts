export type XPostKind = "original" | "repost";

export interface XPost {
  id: string;
  createdAt: Date;
  text: string;
  url: string;
  kind: XPostKind;
  authorHandle: string;
}

export interface FetchOwnerPostsParams {
  since: Date;
  until: Date;
  ownerHandle: string;
}

export interface XProvider {
  fetchOwnerPosts(params: FetchOwnerPostsParams): Promise<XPost[]>;
}
