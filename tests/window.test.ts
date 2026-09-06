import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_WINDOW_MS,
  formatWindowLabel,
  resolveWindow,
} from "../src/summary/window.js";

const NOW = new Date("2026-09-07T12:00:00.000Z");

describe("resolveWindow", () => {
  it("uses 24 hours when there is no previous successful @", () => {
    const window = resolveWindow(NOW, null);
    assert.equal(window.until.toISOString(), NOW.toISOString());
    assert.equal(window.since.getTime(), NOW.getTime() - MAX_WINDOW_MS);
    assert.equal(formatWindowLabel(window), "過去 24 小時");
  });

  it("uses elapsed time when last @ was 6 hours ago", () => {
    const last = new Date(NOW.getTime() - 6 * 60 * 60 * 1000);
    const window = resolveWindow(NOW, last);
    assert.equal(window.since.toISOString(), last.toISOString());
    assert.equal(formatWindowLabel(window), "過去 6 小時");
  });

  it("caps at 24 hours when last @ was more than a day ago", () => {
    const last = new Date(NOW.getTime() - 30 * 60 * 60 * 1000);
    const window = resolveWindow(NOW, last);
    assert.equal(window.since.getTime(), NOW.getTime() - MAX_WINDOW_MS);
    assert.equal(formatWindowLabel(window), "過去 24 小時");
  });

  it("treats a future last-success timestamp as first run", () => {
    const last = new Date(NOW.getTime() + 60_000);
    const window = resolveWindow(NOW, last);
    assert.equal(window.since.getTime(), NOW.getTime() - MAX_WINDOW_MS);
  });
});
