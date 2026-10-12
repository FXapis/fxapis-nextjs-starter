"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Re-fetches the page every 2.5s while the account is between states (e.g.
 * `starting` -> `ready`), and stops on its own once it isn't, exactly as the
 * "Poll lifecycle state" step in the fxapis docs describes. Polling works on
 * localhost; a deployed app can take fxapis webhooks instead (README, "Taking
 * this further").
 */
export function LiveRefresh({ active }: { active: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => router.refresh(), 2_500);
    return () => clearInterval(id);
  }, [active, router]);

  return null;
}
