/**
 * The shapes this starter reads from fxapis, kept here rather than imported
 * from the `fxapis` package: the SDK's methods are untyped (`Promise<any>`)
 * by design — see its README — so a caller names the fields it actually
 * uses. These match the live API reference at
 * https://docs.fxapis.com/api-reference.
 */

export type AccountState =
  | "created"
  | "provisioning"
  | "standby"
  | "starting"
  | "connecting"
  | "synchronizing"
  | "ready"
  | "executing"
  | "cooling"
  | "offline"
  | "degraded"
  | "reconnecting"
  | "invalid_credentials"
  | "trading_disabled"
  | "needs_2fa"
  | "needs_certificate"
  | "error";

/** States worth polling again shortly -- the account is on its way somewhere. */
export const MOVING_STATES: ReadonlySet<AccountState> = new Set(["provisioning", "starting", "connecting", "synchronizing", "reconnecting", "cooling"]);

/** `GET /v1/accounts/{id}`. */
export type Account = {
  id: string;
  label: string | null;
  login: string;
  server: string;
  mode: "always_on" | "warm_on_demand" | "cold";
  state: AccountState;
  stateDetail: string | null;
};

/** `GET /v1/accounts/{id}/positions`, one row of `data`. */
export type Position = {
  brokerPositionId: string;
  symbol: string;
  side: "buy" | "sell";
  volume: string | null;
  profit: string | null;
  openPrice: string | null;
  currentPrice: string | null;
  observedAt: string;
};
