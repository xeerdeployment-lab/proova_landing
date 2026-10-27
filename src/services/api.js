import { ApiError } from "./errors";

/**
 * Member API client.
 *
 * - `VITE_API_URL` set: every call goes to that backend, which owns balances, eligibility and
 *   settlement. Auth rides on the session cookie.
 * - Development build without an API: calls go to the in-browser development ledger, which runs
 *   the same plan engine and labels everything as demo data. It is never bundled for production.
 * - Production build without an API: the dashboard reports that it is not connected rather than
 *   showing invented figures.
 */
const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export const dataSource = baseUrl ? "api" : import.meta.env.DEV ? "demo" : "offline";

let devLedger = null;
async function dev() {
  if (!import.meta.env.DEV) throw new ApiError("offline", "The member API is not configured.", 503);
  devLedger ??= await import("./devLedger");
  return devLedger;
}

async function http(path, { method = "GET", body, idempotencyKey } = {}) {
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("network", "We couldn't reach the server. Check your connection and try again.", 0);
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(payload?.code ?? "server", payload?.message ?? "The request could not be completed.", response.status);
  }
  return payload;
}

async function call(route, args) {
  if (dataSource === "offline") throw new ApiError("offline", "The member API is not configured for this build.", 503);
  if (dataSource === "demo") return (await dev()).handle(route, args);
  return http(route.path, { method: route.method, body: args?.body, idempotencyKey: args?.idempotencyKey });
}

const accountRoute = { name: "account", method: "GET", path: "/me/account" };
let primedAccount = null;

/**
 * Starts the account request during page load, before the dashboard has mounted. The first
 * getAccount() call takes over that in-flight request; it is never reused after that, so every
 * later read (refresh, polling, retry) goes back to the server.
 */
export function primeAccount() {
  if (dataSource === "offline" || primedAccount) return;
  primedAccount = call(accountRoute);
  primedAccount.catch(() => {});
}

export const api = {
  getAccount: () => {
    const primed = primedAccount;
    primedAccount = null;
    return primed ?? call(accountRoute);
  },
  stake: ({ amountCents, idempotencyKey }) =>
    call({ name: "stake", method: "POST", path: "/me/stakes" }, { body: { amountCents }, idempotencyKey }),
  restake: ({ amountCents, idempotencyKey }) =>
    call({ name: "restake", method: "POST", path: "/me/restakes" }, { body: { amountCents }, idempotencyKey }),
  claimDailyIncome: ({ idempotencyKey }) =>
    call({ name: "claim", method: "POST", path: "/me/daily-income/claims" }, { idempotencyKey }),
  withdraw: ({ amountCents, idempotencyKey }) =>
    call({ name: "withdraw", method: "POST", path: "/me/withdrawals" }, { body: { amountCents }, idempotencyKey }),
  updateProfile: ({ displayName }) =>
    call({ name: "profile", method: "PATCH", path: "/me/profile" }, { body: { displayName } }),
};

/** Development-ledger controls. Unavailable outside demo mode. */
export const demoTools = {
  reset: async (scenario) => (await dev()).reset(scenario),
  advanceClock: async (hours) => (await dev()).advanceClock(hours),
  scenarios: async () => (await dev()).scenarios,
};

export function newIdempotencyKey() {
  return crypto.randomUUID();
}
