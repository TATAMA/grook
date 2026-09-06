import type { AppConfig } from "../config.js";
import { ApiXProvider } from "./api.js";
import { MockXProvider } from "./mock.js";
import type { XProvider } from "./types.js";

export type { XPost, XPostKind, XProvider, FetchOwnerPostsParams } from "./types.js";

export function createXProvider(config: AppConfig, now: Date = new Date()): XProvider {
  if (config.xProvider === "api") {
    return new ApiXProvider({
      bearerToken: config.xBearerToken,
      ownerHandle: config.xOwnerHandle,
    });
  }
  return MockXProvider.sample(now, config.xOwnerHandle);
}
