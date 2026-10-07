import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FxapisError } from "fxapis";
import { fxapis } from "@/lib/fxapis-client";
import { savedAccountId } from "@/lib/store";
import { MOVING_STATES, type Account, type Position } from "@/lib/types";
import { disconnect } from "./actions";
import { LiveRefresh } from "./live-refresh";
import { OnlineButton } from "./online-button";
import { PositionsTable } from "./positions-table";
import { TradeForm } from "./trade-form";

export const metadata: Metadata = { title: "Dashboard · fxapis starter" };

// Never statically cached: this reads the account's live state and open
// positions from fxapis on every request -- a trading dashboard must never
// show a stale, build-time snapshot.
export const dynamic = "force-dynamic";

const STATE_LABEL: Partial<Record<Account["state"], string>> = {
  ready: "Online",
  executing: "Online — order in flight",
  offline: "Offline",
  created: "Not yet connected",
  invalid_credentials: "Login refused — reconnect with the right password",
  trading_disabled: "Trading disabled by the broker",
  needs_2fa: "Needs a second factor at the broker",
  needs_certificate: "Needs a client certificate",
  error: "Error — see detail",
};

export default async function DashboardPage() {
  const accountId = await savedAccountId();
  if (!accountId) redirect("/connect");

  let account: Account;
  let positions: Position[];
  try {
    [account, positions] = await Promise.all([
      fxapis().getAccountsById(accountId) as Promise<Account>,
      fxapis().getAccountsByIdPositions(accountId) as Promise<Position[]>,
    ]);
  } catch (error) {
    const message = error instanceof FxapisError ? error.message : "Could not reach fxapis.";
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-4 px-6 py-16">
        <p className="rounded-lg bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">{message}</p>
        <form action={disconnect}>
          <button type="submit" className="text-sm font-medium underline">
            Forget this account and connect another
          </button>
        </form>
      </main>
    );
  }

  const ready = account.state === "ready" || account.state === "executing";
  const moving = MOVING_STATES.has(account.state);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      {moving && <LiveRefresh active />}

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{account.label || `${account.login}@${account.server}`}</h1>
          <p className="text-sm text-black/50 dark:text-white/50">
            {account.login} · {account.server}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              ready
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : moving
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                  : "bg-black/10 text-black/60 dark:bg-white/10 dark:text-white/60"
            }`}
          >
            {STATE_LABEL[account.state] ?? account.state}
          </span>
          {!ready && !moving && <OnlineButton />}
        </div>
      </header>

      {account.stateDetail && <p className="text-sm text-black/60 dark:text-white/60">{account.stateDetail}</p>}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Positions</h2>
        <PositionsTable positions={positions} />
      </section>

      <TradeForm ready={ready} />

      <form action={disconnect} className="self-start">
        <button type="submit" className="text-xs font-medium text-black/40 underline hover:text-black/60 dark:text-white/40 dark:hover:text-white/60">
          Forget this account
        </button>
      </form>
    </main>
  );
}
