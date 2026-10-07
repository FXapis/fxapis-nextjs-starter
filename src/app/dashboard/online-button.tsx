"use client";

import { useTransition } from "react";
import { bringOnline } from "./actions";

export function OnlineButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => bringOnline())}
      className="rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-black"
    >
      {pending ? "Bringing online…" : "Bring online"}
    </button>
  );
}
