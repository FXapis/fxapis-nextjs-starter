import "server-only";
import { Fxapis } from "fxapis";

/**
 * The one fxapis client, built from the server-only API key.
 *
 * `import "server-only"` makes it a build error to import this from a
 * Client Component — the key must never reach the browser. Every page and
 * Server Action in this starter reads fxapis through this file alone.
 */

let client: Fxapis | undefined;

export function fxapis(): Fxapis {
  if (client) return client;
  const key = process.env.FXAPIS_API_KEY;
  if (!key) {
    throw new Error(
      "FXAPIS_API_KEY is not set. Copy .env.local.example to .env.local, add a key from " +
        "https://fxapis.com/dashboard/keys, and restart the dev server."
    );
  }
  client = new Fxapis(key);
  return client;
}
