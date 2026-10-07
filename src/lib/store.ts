import "server-only";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Where this starter remembers which MT5 account it connected: one JSON
 * file, `.data/account.json` (gitignored). That is enough to "connect once,
 * trade from then on" without asking you to stand up a database just to try
 * the starter.
 *
 * Swap this for your real database before this goes anywhere near
 * production — a JSON file has no concurrency control and no multi-user
 * story, and this starter only ever remembers one account.
 */

const FILE = path.join(process.cwd(), ".data", "account.json");

type Stored = { accountId: string };

export async function savedAccountId(): Promise<string | null> {
  try {
    const raw = await readFile(FILE, "utf8");
    return (JSON.parse(raw) as Stored).accountId;
  } catch {
    return null;
  }
}

export async function saveAccountId(accountId: string): Promise<void> {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify({ accountId } satisfies Stored, null, 2));
}

export async function forgetAccount(): Promise<void> {
  await rm(FILE, { force: true });
}
