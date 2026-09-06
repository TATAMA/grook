import path from "node:path";

export type XProviderName = "mock" | "api";

export interface AppConfig {
  port: number;
  lineChannelSecret: string;
  lineChannelAccessToken: string;
  lineBotDisplayName: string;
  xProvider: XProviderName;
  xOwnerHandle: string;
  xBearerToken: string;
  dataDir: string;
}

function readRequired(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key];
  if (value === undefined || value.trim() === "") {
    throw new Error(
      `Missing env ${key}. Copy .env.example to .env and replace placeholders.`,
    );
  }
  return value.trim();
}

function readOptional(
  env: NodeJS.ProcessEnv,
  key: string,
  fallback: string,
): string {
  const value = env[key];
  if (value === undefined || value.trim() === "") {
    return fallback;
  }
  return value.trim();
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const providerRaw = readOptional(env, "X_PROVIDER", "mock");
  if (providerRaw !== "mock" && providerRaw !== "api") {
    throw new Error(`X_PROVIDER must be "mock" or "api", got "${providerRaw}"`);
  }

  const portRaw = readOptional(env, "PORT", "3000");
  const port = Number.parseInt(portRaw, 10);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`PORT must be a positive integer, got "${portRaw}"`);
  }

  return {
    port,
    lineChannelSecret: readRequired(env, "LINE_CHANNEL_SECRET"),
    lineChannelAccessToken: readRequired(env, "LINE_CHANNEL_ACCESS_TOKEN"),
    lineBotDisplayName: readOptional(env, "LINE_BOT_DISPLAY_NAME", "Grook"),
    xProvider: providerRaw,
    xOwnerHandle: readOptional(env, "X_OWNER_HANDLE", "replace_me"),
    xBearerToken: readOptional(env, "X_BEARER_TOKEN", "replace_me"),
    dataDir: path.resolve(readOptional(env, "DATA_DIR", "./data")),
  };
}
