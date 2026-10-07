"use server";

import { redirect } from "next/navigation";
import { FxapisError } from "fxapis";
import { fxapis } from "@/lib/fxapis-client";
import { saveAccountId } from "@/lib/store";

export type ConnectResult = { ok: true } | { ok: false; error: string };

/**
 * Connects an MT5 account and brings it online right away, so a wrong
 * password is caught on this screen rather than on the first trade.
 */
export async function connectAccount(_prev: ConnectResult | null, formData: FormData): Promise<ConnectResult> {
  const login = String(formData.get("login") ?? "").trim();
  const server = String(formData.get("server") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const label = String(formData.get("label") ?? "").trim();

  if (!login || !server || !password) {
    return { ok: false, error: "Login, server and password are all required." };
  }

  try {
    const account = await fxapis().postAccounts({
      login,
      server,
      password,
      mode: "warm_on_demand",
      ...(label ? { label } : {}),
    });
    await saveAccountId(account.id);
    // Bring it online now, so the dashboard opens already warming up rather
    // than cold. Not fatal if this call itself fails -- the dashboard's own
    // "Bring online" button covers that.
    await fxapis()
      .postAccountsByIdWarm(account.id)
      .catch(() => {});
  } catch (error) {
    if (error instanceof FxapisError) return { ok: false, error: error.message };
    return { ok: false, error: "Could not reach fxapis. Check your connection and FXAPIS_API_KEY." };
  }

  redirect("/dashboard");
}
