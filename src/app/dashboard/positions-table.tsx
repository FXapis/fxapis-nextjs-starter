"use client";

import { useTransition } from "react";
import { closePosition } from "./actions";
import type { Position } from "@/lib/types";

export function PositionsTable({ positions }: { positions: Position[] }) {
  const [pending, start] = useTransition();

  if (positions.length === 0) {
    return <p className="text-sm text-black/50 dark:text-white/50">No open positions.</p>;
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="text-xs text-black/50 dark:text-white/50">
          <th className="py-1.5 font-medium">Symbol</th>
          <th className="py-1.5 font-medium">Side</th>
          <th className="py-1.5 font-medium">Volume</th>
          <th className="py-1.5 font-medium">Profit</th>
          <th className="py-1.5 font-medium" />
        </tr>
      </thead>
      <tbody>
        {positions.map((p) => (
          <tr key={p.brokerPositionId} className="border-t border-black/5 dark:border-white/10">
            <td className="py-2 font-medium">{p.symbol}</td>
            <td className="py-2 capitalize">{p.side}</td>
            <td className="py-2">{p.volume}</td>
            <td className={`py-2 ${Number(p.profit) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{p.profit}</td>
            <td className="py-2 text-right">
              <button
                type="button"
                disabled={pending}
                onClick={() => start(() => closePosition(p.brokerPositionId))}
                className="text-xs font-medium text-black/60 underline decoration-black/20 hover:text-black disabled:opacity-50 dark:text-white/60 dark:decoration-white/20 dark:hover:text-white"
              >
                Close
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
