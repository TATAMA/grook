import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { FileLastMentionStore } from "../src/store/last-mention.js";

describe("FileLastMentionStore", () => {
  it("returns null when the file does not exist", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "grook-store-"));
    const store = new FileLastMentionStore(path.join(dir, "last-mention.json"));
    assert.equal(await store.getLastSuccessAt("Cgroup"), null);
  });

  it("round-trips per-group timestamps and does not mix groups", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "grook-store-"));
    const filePath = path.join(dir, "last-mention.json");
    const store = new FileLastMentionStore(filePath);
    const at = new Date("2026-09-07T06:00:00.000Z");

    await store.setLastSuccessAt("Cgroup-a", at);
    assert.equal((await store.getLastSuccessAt("Cgroup-a"))?.toISOString(), at.toISOString());
    assert.equal(await store.getLastSuccessAt("Cgroup-b"), null);

    const raw = await readFile(filePath, "utf8");
    assert.match(raw, /Cgroup-a/);
    assert.match(raw, /2026-09-07T06:00:00.000Z/);
  });
});
