import { DEFAULT_PREFERENCES, applyPreferences } from "./preferences/index.js";
import { formatReport } from "./summary/report.js";
import { resolveWindow } from "./summary/window.js";
import { MockXProvider } from "./x/mock.js";

const now = new Date();
const ownerHandle = "owner";
const window = resolveWindow(now, null);
const provider = MockXProvider.sample(now, ownerHandle);
const items = applyPreferences(
  await provider.fetchFeed({
    since: window.since,
    until: window.until,
    ownerHandle,
  }),
  DEFAULT_PREFERENCES,
  ownerHandle,
);

process.stdout.write(
  `${formatReport({ window, items, ownerHandle, now })}\n`,
);
