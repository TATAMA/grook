import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface LastMentionStore {
  getLastSuccessAt(groupId: string): Promise<Date | null>;
  setLastSuccessAt(groupId: string, at: Date): Promise<void>;
}

interface FileShape {
  groups: Record<string, string>;
}

export class FileLastMentionStore implements LastMentionStore {
  constructor(private readonly filePath: string) {}

  async getLastSuccessAt(groupId: string): Promise<Date | null> {
    const data = await this.read();
    const raw = data.groups[groupId];
    if (!raw) {
      return null;
    }
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed;
  }

  async setLastSuccessAt(groupId: string, at: Date): Promise<void> {
    const data = await this.read();
    data.groups[groupId] = at.toISOString();
    await this.write(data);
  }

  private async read(): Promise<FileShape> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as FileShape;
      if (!parsed || typeof parsed !== "object" || !parsed.groups) {
        return { groups: {} };
      }
      return { groups: parsed.groups };
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "ENOENT") {
        return { groups: {} };
      }
      throw err;
    }
  }

  private async write(data: FileShape): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  }
}

export class MemoryLastMentionStore implements LastMentionStore {
  private readonly groups = new Map<string, Date>();

  async getLastSuccessAt(groupId: string): Promise<Date | null> {
    return this.groups.get(groupId) ?? null;
  }

  async setLastSuccessAt(groupId: string, at: Date): Promise<void> {
    this.groups.set(groupId, at);
  }
}
