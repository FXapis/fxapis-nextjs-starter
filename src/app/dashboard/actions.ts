"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FxapisError } from "fxapis";
import { fxapis } from "@/lib/fxapis-client";
import { forgetAccount, savedAccountId } from "@/lib/store";

export type TradeResult = { ok: true } | { ok: false; error: string };

function explain(error: unknown): string {
  if (error instanceof FxapisError) return error.message;
  return "Could not reach fxapis. Check your connection and FXAPIS_API_KEY.";
}

/** Brings the connected account online. Safe to call again -- warming an already-online account is a no-op. */
export async function bringOnline(): Promise<void> {
  const id = await savedAccountId();
  if (!id) redirect("/connect");
  await fxapis().postAccountsByIdWarm(id);
  revalidatePath("/dashboard");
}

/**
 * Places a market order, after the dashboard's own confirmation step. Volumes and
 * prices are strings, never floats, and the order always carries a fresh
 * idempotency key -- a resubmitted form (a double click, a retry) must never
 * place a second order.
 */
export async function placeTrade(_prev: TradeResult | null, formData: FormData): Promise<TradeResult> {
  const id = await savedAccountId();
  if (!id) return { ok: false, error: "No account connected." };

  if (formData.get("confirmed") !== "on") {
    return { ok: false, error: "Confirm the order before sending it — this places a real order on this account." };
  }

  const symbol = String(formData.get("symbol") ?? "").trim().toUpperCase();
  const side = String(formData.get("side") ?? "");
  const volume = String(formData.get("volume") ?? "").trim();
  const stopLoss = String(formData.get("stopLoss") ?? "").trim();
  const takeProfit = String(formData.get("takeProfit") ?? "").trim();

  if (!symbol || (side !== "buy" && side !== "sell") || !volume) {
    return { ok: false, error: "Symbol, side and volume are required." };
  }

  try {
    await fxapis().postAccountsByIdOrdersMarket(
      id,
      {
        symbol,
        side: side as "buy" | "sell",
        volume,
        ...(stopLoss ? { stopLoss } : {}),
        ...(takeProfit ? { takeProfit } : {}),
      },
      { idempotencyKey: randomUUID() }
    );
  } catch (error) {
    return { ok: false, error: explain(error) };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

/** Closes one position in full, keyed so a repeated click never closes it twice as two opposite orders. */
export async function closePosition(positionId: string): Promise<void> {
  const id = await savedAccountId();
  if (!id) redirect("/connect");
  await fxapis().postAccountsByIdPositionsByPositionIdClose(id, positionId, {}, { idempotencyKey: `close_${positionId}` });
  revalidatePath("/dashboard");
}

/** Forgets the connected account here. The account itself, and anything open on it, is untouched at fxapis. */
export async function disconnect(): Promise<void> {
  await forgetAccount();
  redirect("/connect");
}
