import type { FetchOwnerPostsParams, XPost, XProvider } from "./types.js";

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

  async fetchOwnerPosts(_params: FetchOwnerPostsParams): Promise<XPost[]> {
    throw new Error(
      "ApiXProvider is not implemented in v1. Set X_PROVIDER=mock. Do not use scraping.",
    );
  }
}
