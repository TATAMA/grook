import "dotenv/config";
import path from "node:path";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { createSdkLineClient } from "./line/client.js";
import { loadPreferences } from "./preferences/index.js";
import { FileLastMentionStore } from "./store/last-mention.js";
import { createXProvider } from "./x/provider.js";

const config = loadConfig();
const store = new FileLastMentionStore(
  path.join(config.dataDir, "last-mention.json"),
);

const app = createApp({
  config,
  store,
  xProvider: createXProvider(config),
  lineClient: createSdkLineClient(config.lineChannelAccessToken),
  preferences: loadPreferences(),
});

app.listen(config.port, () => {
  console.log(`Grook listening on :${config.port} (X_PROVIDER=${config.xProvider})`);
});
