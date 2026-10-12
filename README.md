<div align="center">

<img src="https://fxapis.com/logo.png" alt="" width="72" height="72">

# fxapis Next.js starter

**Connect an MT5 account, watch its positions, and place a confirmed demo trade — a small, real app built on fxapis**

[Website](https://fxapis.com) · [Docs](https://docs.fxapis.com) · [API Reference](https://docs.fxapis.com/api-reference) · [Status](https://status.fxapis.com) · [Support](mailto:support@fxapis.com)

[![License: MIT](https://img.shields.io/badge/license-MIT-22D3D6?style=flat-square)](LICENSE)
[![ci](https://img.shields.io/github/actions/workflow/status/FXapis/fxapis-nextjs-starter/ci.yml?branch=main&style=flat-square&label=ci)](https://github.com/FXapis/fxapis-nextjs-starter/actions/workflows/ci.yml)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![fxapis status](https://status.fxapis.com/badge.svg)](https://status.fxapis.com)

</div>

---

A working — not a toy — Next.js 16 app on **[fxapis](https://fxapis.com)**, the hosted MetaTrader 5 REST API: connect a broker demo account, bring it online, watch its open positions, and place a market order only after an explicit confirmation step. Everything that touches your API key or your broker credentials runs on the server; the browser never sees either.

Three routes, three files you'll actually read:

| Route | What it does | Where |
|---|---|---|
| `/connect` | Connects an MT5 account and brings it online | [`src/app/connect/`](src/app/connect/) |
| `/dashboard` | Shows account state, open positions, and the trade form | [`src/app/dashboard/`](src/app/dashboard/) |
| `/` | Sends you to whichever of those two applies | [`src/app/page.tsx`](src/app/page.tsx) |

## Table of contents

- [Quickstart](#quickstart)
- [How it's built](#how-its-built)
- [Why every page is dynamic](#why-every-page-is-dynamic)
- [The confirm-before-trade pattern](#the-confirm-before-trade-pattern)
- [Project structure](#project-structure)
- [Taking this further](#taking-this-further)
- [Related fxapis repositories](#related-fxapis-repositories)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

## Quickstart

```bash
git clone https://github.com/FXapis/fxapis-nextjs-starter.git
cd fxapis-nextjs-starter
npm install
cp .env.local.example .env.local   # add your fxapis API key
npm run dev
```

Open [localhost:3000](http://localhost:3000). With no account connected yet, it sends you to **Connect an account** — fill in a broker **demo** account's login, server and trading password (not the read-only investor password), and it connects, brings the account online, and takes you to the dashboard.

> [!WARNING]
> **Test keys reach real brokers.** An `fx_test_` key is a label for your configuration, not a sandbox — there is no simulated market at fxapis. Use a broker demo account for everything here. Create a key at [fxapis.com/dashboard/keys](https://fxapis.com/dashboard/keys) with `accounts:read`, `accounts:write`, `trading:read` and `trading:execute`.

## How it's built

- **The API key never leaves the server.** [`src/lib/fxapis-client.ts`](src/lib/fxapis-client.ts) builds the one `Fxapis` client from `process.env.FXAPIS_API_KEY`, and starts with `import "server-only"` — importing it from a Client Component is a build error, not a runtime surprise.
- **Server Actions do every write.** Connecting an account, bringing it online, placing an order, closing a position — each is a `"use server"` function (`connect/actions.ts`, `dashboard/actions.ts`) called directly from a form or a button. No separate API routes to keep in sync with the UI.
- **One account, no database.** [`src/lib/store.ts`](src/lib/store.ts) remembers the connected account's id in `.data/account.json` (gitignored) — enough to try this out with zero setup. It says right in the file where to put your real persistence layer when this stops being a demo.
- **Orders always carry an idempotency key**, generated fresh per submit (`crypto.randomUUID()`), so a resubmitted form can never place the order twice — see [the trading guide](https://docs.fxapis.com/trading).
- **Response shapes are hand-typed**, in [`src/lib/types.ts`](src/lib/types.ts), not imported from the SDK: `fxapis`'s methods are intentionally untyped (`Promise<any>`, see its [README](https://github.com/FXapis/fxapis-typescript#readme)) so a caller names only the fields it uses, matching the [API reference](https://docs.fxapis.com/api-reference).

## Why every page is dynamic

`/` and `/dashboard` are marked `export const dynamic = "force-dynamic"`. This is a trading dashboard: it reads an account's live state and open positions on every request, and Next's default App Router behaviour will happily prerender a page like this **once**, at build time, and then serve that frozen snapshot forever in production. `force-dynamic` turns that off. (`/connect` is a plain form with nothing live to read, so it's left to prerender normally.)

This starter does not use Next 16's [Cache Components](https://nextjs.org/docs/app/getting-started/caching) — that model is a good fit for content that benefits from being cached and selectively revalidated, which live trading data is not. If you add a page that *is* cacheable (a public marketing page, static docs), Cache Components is worth reaching for there.

## The confirm-before-trade pattern

The trade form ([`src/app/dashboard/trade-form.tsx`](src/app/dashboard/trade-form.tsx)) never sends an order on the first click. Submitting shows exactly what will be sent — side, volume, symbol — behind a required checkbox, and only a second, explicit "Confirm and send" places the order. The Server Action checks the same `confirmed` field again server-side, because a client-side check alone is a UI nicety, not a safeguard — something that can call the action directly (a script, a replayed request) bypasses it entirely.

## Project structure

```
src/
  lib/
    fxapis-client.ts   server-only Fxapis client, built from FXAPIS_API_KEY
    store.ts           where the connected account's id is remembered
    types.ts           the response shapes this app reads, hand-typed
  app/
    page.tsx            /  — redirects to /connect or /dashboard
    connect/
      page.tsx           the connect page
      connect-form.tsx   "use client" form
      actions.ts         "use server" connectAccount
    dashboard/
      page.tsx            account state + positions + the trade form
      trade-form.tsx       "use client" form with the confirm step
      positions-table.tsx  "use client" table with a close button per row
      online-button.tsx    "use client" — calls bringOnline()
      live-refresh.tsx     "use client" — polls while the account is connecting
      actions.ts            "use server" bringOnline, placeTrade, closePosition, disconnect
```

## Taking this further

- **A real database.** Swap `src/lib/store.ts` for your ORM of choice, and it becomes multi-account, multi-user — the rest of the app barely changes, since every other file already takes the account id as a value, not a global.
- **Auth.** There's none here on purpose — this starter is single-tenant, "your own app with your own key." Put [better-auth](https://www.better-auth.com), [Auth.js](https://authjs.dev) or your own session layer in front of `/dashboard`, same as any other Next.js app.
- **Live updates without polling.** `live-refresh.tsx` polls every 2.5s while an account is connecting, which works anywhere, including `localhost`. Once the app is deployed, add a route that receives fxapis [webhooks](https://docs.fxapis.com/guides/webhooks) — `account.state_changed`, `order.filled`, `position.closed` — checks each with `verifyWebhook()` from the SDK, and pushes the change to the browser (server-sent events, say). `live-refresh.tsx` is the one file that goes.
- **More of the API.** Pending orders, modifying a position's stop loss/take profit, multi-account orders, order and deal history — all covered by the SDK; see [`fxapis-typescript`](https://github.com/FXapis/fxapis-typescript#methods) for the full method list, or copy a pattern from [`fxapis-examples`](https://github.com/FXapis/fxapis-examples).

## Related fxapis repositories

| Repository | What it is |
|---|---|
| [`fxapis-typescript`](https://github.com/FXapis/fxapis-typescript) | The SDK this starter is built on |
| [`fxapis-examples`](https://github.com/FXapis/fxapis-examples) | More runnable examples: Python, Node/TypeScript, curl |
| [`fxapis-python`](https://github.com/FXapis/fxapis-python) | The official Python SDK |
| [`fxapis-mcp-examples`](https://github.com/FXapis/fxapis-mcp-examples) | Connect AI agents (Claude, Cursor, VS Code) over MCP |
| [`fxapis-integrations`](https://github.com/FXapis/fxapis-integrations) | Postman collection, TradingView payloads, automation templates |

## Contributing

```bash
npm install
npm run lint
npm run build   # also type-checks
```

These are exactly what the `ci` workflow runs. Keep additions in the spirit of a *starter*: a new feature should be a pattern worth copying, not a framework worth learning. Pull requests that fix a bug or add a small, well-commented feature (closing a position partially, a pending-order form) are welcome; please keep the confirm-before-trade pattern intact for anything that trades.

## Support

- **Docs:** [docs.fxapis.com](https://docs.fxapis.com)
- **Status:** [status.fxapis.com](https://status.fxapis.com)
- **Bugs:** [open an issue](https://github.com/FXapis/fxapis-nextjs-starter/issues)
- **Everything else:** [support@fxapis.com](mailto:support@fxapis.com)

## License

[MIT](LICENSE) © 2026 El Wizard
