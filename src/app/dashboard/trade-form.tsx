"use client";

import { useActionState, useState } from "react";
import { placeTrade, type TradeResult } from "./actions";

const inputClass =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:text-white dark:focus:border-white/30";
const labelClass = "block text-xs font-medium text-black/60 dark:text-white/60";

/**
 * A market order, placed only after an explicit, separate confirmation —
 * not just a submit button. Re-checking symbol/side/volume/confirmed
 * client-side here is a courtesy; the Server Action checks them again and
 * is the one that actually enforces anything.
 */
export function TradeForm({ ready }: { ready: boolean }) {
  const [result, action, pending] = useActionState<TradeResult | null, FormData>(placeTrade, null);
  const [confirming, setConfirming] = useState(false);
  const [summary, setSummary] = useState<{ symbol: string; side: string; volume: string } | null>(null);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirming) {
          // First submit: show what we're about to send instead of sending it.
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setSummary({ symbol: String(f.get("symbol") ?? "").toUpperCase(), side: String(f.get("side") ?? ""), volume: String(f.get("volume") ?? "") });
          setConfirming(true);
        }
      }}
      className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/15"
    >
      <h2 className="text-sm font-semibold">Place a market order</h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="symbol">
            Symbol
          </label>
          <input id="symbol" name="symbol" required disabled={!ready} placeholder="EURUSD" className={inputClass} onChange={() => setConfirming(false)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="side">
            Side
          </label>
          <select id="side" name="side" required disabled={!ready} defaultValue="buy" className={inputClass} onChange={() => setConfirming(false)}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="volume">
            Volume (lots)
          </label>
          <input id="volume" name="volume" required disabled={!ready} defaultValue="0.01" placeholder="0.01" className={inputClass} onChange={() => setConfirming(false)} />
        </div>
        <div />
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="stopLoss">
            Stop loss <span className="font-normal opacity-60">(price, optional)</span>
          </label>
          <input id="stopLoss" name="stopLoss" disabled={!ready} placeholder="1.0900" className={inputClass} onChange={() => setConfirming(false)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="takeProfit">
            Take profit <span className="font-normal opacity-60">(price, optional)</span>
          </label>
          <input id="takeProfit" name="takeProfit" disabled={!ready} placeholder="1.1200" className={inputClass} onChange={() => setConfirming(false)} />
        </div>
      </div>

      {confirming && summary && (
        <div className="flex flex-col gap-2 rounded-lg bg-amber-500/10 px-3 py-2.5 text-sm text-amber-800 dark:text-amber-300">
          <p>
            This sends a real order: <strong>{summary.side}</strong> <strong>{summary.volume}</strong> lots of{" "}
            <strong>{summary.symbol}</strong>. Confirm to send it.
          </p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="confirmed" required className="size-4" />I understand this places a real order on this account.
          </label>
        </div>
      )}

      {result && !result.ok && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
          {result.error}
        </p>
      )}
      {result?.ok && <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">Order sent.</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!ready || pending}
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {pending ? "Sending…" : confirming ? "Confirm and send" : "Review order"}
        </button>
        {confirming && (
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
          >
            Cancel
          </button>
        )}
      </div>
      {!ready && <p className="text-xs text-black/50 dark:text-white/50">Bring the account online first.</p>}
    </form>
  );
}
