/** Integer cents. Financial figures in this app are never stored as binary floats. */

export function percentOf(cents, bps) {
  if (!Number.isInteger(cents) || !Number.isInteger(bps)) {
    throw new Error("Money math requires integer cents and basis points.");
  }
  const negative = cents < 0;
  const product = Math.abs(cents) * bps;
  const result = Math.floor((product + 5000) / 10000);
  return negative ? -result : result;
}

export function formatBps(bps) {
  const whole = Math.trunc(bps / 100);
  const fraction = Math.abs(bps % 100);
  if (fraction === 0) return `${whole}%`;
  return `${whole}.${String(fraction).padStart(2, "0")}%`;
}

export function formatCents(cents) {
  if (cents == null || Number.isNaN(Number(cents))) return "—";
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const dollars = Math.trunc(abs / 100);
  const remainder = abs % 100;
  const body = `$${dollars.toLocaleString("en-US")}.${String(remainder).padStart(2, "0")}`;
  return negative ? `-${body}` : body;
}

export function parseMoneyInput(raw) {
  const cleaned = String(raw ?? "").trim().replace(/[$,\s]/g, "");
  if (cleaned === "") return { cents: null, empty: true, error: null };
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) {
    return { cents: null, empty: false, error: "Enter a valid dollar amount." };
  }
  const [whole, fraction = ""] = cleaned.split(".");
  const cents = Number(whole) * 100 + Number((fraction + "00").slice(0, 2));
  if (!Number.isSafeInteger(cents)) {
    return { cents: null, empty: false, error: "Amount is too large." };
  }
  return { cents, empty: false, error: null };
}

export function centsToInput(cents) {
  if (cents == null) return "";
  const dollars = Math.trunc(cents / 100);
  const remainder = cents % 100;
  if (remainder === 0) return String(dollars);
  return `${dollars}.${String(remainder).padStart(2, "0")}`;
}
