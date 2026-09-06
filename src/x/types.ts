export type XPostKind = "original" | "repost";
export type XItemSource = "timeline" | "notification";

export interface XFeedItem {
  id: string;
  createdAt: Date;
  text: string;
  url: string;
  kind: XPostKind;
  authorHandle: string;
  source: XItemSource;
  authorIsFollowed: boolean;
  mentionsOwner: boolean;
}

export interface FetchFeedParams {
  since: Date;
  until: Date;
  ownerHandle: string;
}

export interface XProvider {
  fetchFeed(params: FetchFeedParams): Promise<XFeedItem[]>;
}
