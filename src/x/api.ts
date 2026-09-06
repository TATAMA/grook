import type { FetchFeedParams, XFeedItem, XProvider } from "./types.js";

/**
 * Official X API adapter. v1 is intentionally unimplemented.
 * Do not add scraping here.
 */
export class ApiXProvider implements XProvider {
  constructor(
    private readonly _options: {
      bearerToken: string;
      ownerHandle: string;
    },
  ) {}

  async fetchFeed(_params: FetchFeedParams): Promise<XFeedItem[]> {
    throw new Error(
      "ApiXProvider is not implemented in v1. Set X_PROVIDER=mock. Do not use scraping.",
    );
  }
}
