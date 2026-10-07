import type { Metadata } from "next";
import { ConnectForm } from "./connect-form";

export const metadata: Metadata = { title: "Connect an account · fxapis starter" };

export default function ConnectPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Connect an MT5 account</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Use a broker <strong>demo</strong> account while you try this out — fxapis has no
          simulated market, and every key (test keys included) reaches a real broker.
        </p>
      </div>
      <ConnectForm />
    </main>
  );
}
