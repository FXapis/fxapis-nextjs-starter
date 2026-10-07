"use client";

import { useActionState } from "react";
import { connectAccount, type ConnectResult } from "./actions";

const inputClass =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:text-white dark:focus:border-white/30";
const labelClass = "block text-sm font-medium text-black/80 dark:text-white/80";

export function ConnectForm() {
  const [result, action, pending] = useActionState<ConnectResult | null, FormData>(connectAccount, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="login">
          MT5 login
        </label>
        <input id="login" name="login" required placeholder="26177561" className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="server">
          Server
        </label>
        <input id="server" name="server" required placeholder="VantageMarkets-Demo" className={inputClass} />
        <p className="text-xs text-black/50 dark:text-white/50">
          Exactly as MetaTrader shows it on the login screen, e.g. the broker&apos;s welcome email.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="password">
          Trading password
        </label>
        <input id="password" name="password" type="password" required autoComplete="off" className={inputClass} />
        <p className="text-xs text-black/50 dark:text-white/50">
          The trading password, not the read-only investor password. Sent straight to fxapis over
          HTTPS from this server; never stored by this app.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="label">
          Label <span className="font-normal text-black/40 dark:text-white/40">(optional)</span>
        </label>
        <input id="label" name="label" placeholder="demo — starter" className={inputClass} />
      </div>

      {result && !result.ok && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
          {result.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Connecting…" : "Connect account"}
      </button>
    </form>
  );
}
