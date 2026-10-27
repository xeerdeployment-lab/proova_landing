import { planConfig } from "../data/planConfig";
import { formatBps, formatCents, percentOf } from "./money";

/**
 * Plan calculations. Pure functions over integer cents and epoch milliseconds, with no browser
 * dependencies, so the backend (and the development ledger) run the exact same math the interface
 * previews. The interface only ever previews; settled amounts come from the server.
 */

export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;

const toMs = (value) => (value == null ? null : typeof value === "number" ? value : new Date(value).getTime());
const sum = (values) => values.reduce((total, value) => total + value, 0);

/* ───────── Stake ───────── */

export function validateStakeCents(cents, { minCents = planConfig.stake.minCents } = {}) {
  if (cents == null) return ["Enter a stake amount."];
  const { maxCents, incrementCents } = planConfig.stake;
  if (!Number.isInteger(cents)) return ["Enter a whole-dollar amount."];
  if (cents < minCents) return [`Minimum is ${formatCents(minCents)}.`];
  if (cents > maxCents) return [`Maximum is ${formatCents(maxCents)}.`];
  if (cents % incrementCents !== 0) return [`Use steps of ${formatCents(incrementCents)}.`];
  return [];
}

export function stakeBreakdown(amountCents) {
  const feeCents = percentOf(amountCents, planConfig.stake.platformFeeBps);
  return {
    amountCents,
    feeCents,
    allocationCents: amountCents - feeCents,
    feeLabel: formatBps(planConfig.stake.platformFeeBps),
    allocationLabel: formatBps(planConfig.stake.allocationBps),
  };
}

export function clampStakeCents(cents, { minCents = planConfig.stake.minCents } = {}) {
  const { maxCents, incrementCents } = planConfig.stake;
  const stepped = Math.round(cents / incrementCents) * incrementCents;
  return Math.min(maxCents, Math.max(minCents, stepped));
}

export function restakeBounds(lastStakeCents) {
  return {
    minCents: Math.max(planConfig.stake.minCents, lastStakeCents ?? planConfig.stake.minCents),
    maxCents: planConfig.stake.maxCents,
  };
}

/* ───────── Up/Down ───────── */

export function upDownTierFor(cents) {
  if (cents == null) return null;
  return planConfig.upDown.tiers.find((tier) => cents >= tier.minCents && cents <= tier.maxCents) ?? null;
}

/** Size of the pool a stake funds. This is not what any one person receives. */
export function upDownPoolCents(stakeCents) {
  return percentOf(stakeCents, planConfig.upDown.poolBps);
}

/* ───────── Direct reward ───────── */

export function directRewardCents(sourceStakeCents) {
  return percentOf(sourceStakeCents, planConfig.directReward.rateBps);
}

/* ───────── Daily income ───────── */

/** `eligibleByLevel` is an array indexed by level - 1 with eligible active user counts. */
export function dailyIncomeRows(eligibleByLevel = [], claimedByLevel = []) {
  const rows = planConfig.dailyIncome.levels.map(({ level, rateCents }) => {
    const eligible = eligibleByLevel[level - 1] ?? 0;
    return {
      level,
      eligible,
      rateCents,
      dailyCents: eligible * rateCents,
      claimedCents: claimedByLevel[level - 1] ?? 0,
    };
  });
  return { rows, totalCents: sum(rows.map((row) => row.dailyCents)) };
}

export function claimWindow(lastClaimAt, now) {
  const last = toMs(lastClaimAt);
  const current = toMs(now);
  if (last == null) return { open: true, nextAt: null, remainingMs: 0 };
  const nextAt = last + planConfig.dailyIncome.claimIntervalHours * HOUR_MS;
  return { open: current >= nextAt, nextAt, remainingMs: Math.max(0, nextAt - current) };
}

/* ───────── Withdrawal ───────── */

/**
 * The one withdrawal split. Every line is derived from `grossCents` in integer cents and the
 * lines must add back to it exactly; a configuration that would over-allocate throws.
 */
export function withdrawalBreakdown(grossCents) {
  const rules = planConfig.withdrawal;
  if (rules.memberShareBps + rules.upDownShareBps !== 10_000) {
    throw new Error("Withdrawal member and up/down shares must total 100%.");
  }
  const deductionCents = percentOf(grossCents, rules.deductionBps);
  const netCents = grossCents - deductionCents;
  const memberCents = percentOf(netCents, rules.memberShareBps);
  const upDownCents = netCents - memberCents;
  const communityCents = percentOf(deductionCents, rules.deductionSplit.communityFundBps);
  const rankPools = planConfig.ranks.map((rank) => {
    const bps = rules.deductionSplit.rankPoolBps[rank.id] ?? 0;
    return { id: rank.id, name: rank.name, bps, cents: percentOf(deductionCents, bps) };
  });
  const rankCents = sum(rankPools.map((pool) => pool.cents));
  const platformCents = deductionCents - communityCents - rankCents;
  if (platformCents < 0) throw new Error("Deduction allocations exceed the deduction.");

  const allocated = memberCents + upDownCents + communityCents + rankCents + platformCents;
  if (allocated !== grossCents) throw new Error("Withdrawal allocations do not reconcile.");

  return {
    grossCents,
    deductionCents,
    netCents,
    memberCents,
    upDownCents,
    communityCents,
    rankPools,
    rankCents,
    platformCents,
    labels: {
      deduction: formatBps(rules.deductionBps),
      member: formatBps(rules.memberShareBps),
      upDown: formatBps(rules.upDownShareBps),
      community: formatBps(rules.deductionSplit.communityFundBps),
    },
  };
}

export function validateWithdrawal(cents, { availableCents = 0, hasPending = false, capabilityReached = false } = {}) {
  const rules = planConfig.withdrawal;
  if (cents == null) return ["Enter an amount."];
  if (!Number.isInteger(cents) || cents <= 0) return ["Enter a valid amount."];
  if (cents < rules.minCents) return [`Minimum withdrawal is ${formatCents(rules.minCents)}.`];
  if (cents > availableCents) return [`Only ${formatCents(availableCents)} is available.`];
  if (rules.blockWhilePending && hasPending) return ["A withdrawal is already processing."];
  if (rules.blockWhenCapabilityReached && capabilityReached) return ["Reward capability is reached. Restake to continue withdrawing."];
  return [];
}

/* ───────── Reward capability ───────── */

/** Directs whose confirmed stake landed within `days` of the member's first stake. */
export function directsStakedWithin(firstStakeAt, directs, days) {
  const start = toMs(firstStakeAt);
  if (start == null) return [];
  const end = start + days * DAY_MS;
  return directs.filter((person) => {
    const at = toMs(person.stakedAt);
    return at != null && at >= start && at <= end;
  });
}

export function capabilitySummary({ stakeCents, firstStakeAt, directs = [], countedCents = 0, now }) {
  const rules = planConfig.capability;
  const current = toMs(now);
  const start = toMs(firstStakeAt);
  const windowDays = Math.max(...rules.enhanced.map((tier) => tier.withinDays));
  const inWindow = directsStakedWithin(firstStakeAt, directs, windowDays).length;
  const earned = rules.enhanced.find((tier) => inWindow >= tier.directs) ?? null;
  const multiple = earned?.multiple ?? rules.baseMultiple;
  const windowEndsAt = start == null ? null : start + windowDays * DAY_MS;
  const windowOpen = windowEndsAt != null && current <= windowEndsAt;
  const nextTier = [...rules.enhanced].reverse().find((tier) => tier.multiple > multiple) ?? null;
  const maxCents = (stakeCents ?? 0) * multiple;
  const remainingCents = Math.max(0, maxCents - countedCents);

  return {
    baseMultiple: rules.baseMultiple,
    multiple,
    stakeCents: stakeCents ?? 0,
    maxCents,
    countedCents,
    remainingCents,
    progress: maxCents > 0 ? Math.min(1, countedCents / maxCents) : 0,
    reached: maxCents > 0 && countedCents >= maxCents,
    window: {
      days: windowDays,
      endsAt: windowEndsAt,
      open: windowOpen,
      directsInWindow: inWindow,
      nextTier: windowOpen ? nextTier : null,
    },
  };
}

/** Clips a reward so the counted total never passes the cap. */
export function clipToCapability(rewardCents, capability) {
  return Math.max(0, Math.min(rewardCents, capability.remainingCents));
}

/* ───────── Ranks ───────── */

export function evaluateRanks({ firstStakeAt, firstStakeCents, directs = [], now }) {
  const start = toMs(firstStakeAt);
  const current = toMs(now);

  const ranks = planConfig.ranks.map((rank) => {
    const deadline = start == null ? null : start + rank.windowHours * HOUR_MS;
    const qualifying = directs.filter((person) => {
      const at = toMs(person.stakedAt);
      return (person.stakeCents ?? 0) >= rank.directStakeCents && at != null && deadline != null && at <= deadline;
    });
    const selfMet = start != null && (firstStakeCents ?? 0) >= rank.selfStakeCents;
    const directsMet = qualifying.length >= rank.directCount;
    const achieved = selfMet && directsMet;
    const expired = deadline != null && current > deadline;
    const state = achieved ? "achieved" : start == null ? "locked" : expired ? "missed" : "in-progress";

    return {
      ...rank,
      state,
      achieved,
      deadline,
      remainingMs: deadline == null ? null : Math.max(0, deadline - current),
      directProgress: Math.min(qualifying.length, rank.directCount),
      checks: [
        { id: "self", label: `Self stake of ${formatCents(rank.selfStakeCents)} or more`, met: selfMet },
        { id: "directs", label: `${rank.directCount} directs staking ${formatCents(rank.directStakeCents)}+`, met: directsMet, progress: `${Math.min(qualifying.length, rank.directCount)}/${rank.directCount}` },
        { id: "window", label: `Within ${rank.windowHours} hours of first stake`, met: achieved || (!expired && start != null), pending: !achieved && !expired },
      ],
    };
  });

  const current_ = [...ranks].reverse().find((rank) => rank.achieved) ?? null;
  const next = ranks.find((rank) => !rank.achieved && rank.state === "in-progress") ?? null;
  return { ranks, current: current_, next };
}

/* ───────── Ledger helpers ───────── */

export const countsAgainstCap = (row) => planConfig.capability.countedCategories.includes(row.category) && row.status === "completed";

export function sumCents(rows) {
  return sum(rows.map((row) => row.amountCents ?? 0));
}

/** Daily totals of reward credits for the chart. `days = null` means all time. */
export function earningsSeries(ledger, days, now) {
  const credits = ledger.filter((row) => row.direction === "credit" && row.status === "completed");
  const dayKey = (ms) => new Date(ms).toISOString().slice(0, 10);
  const end = toMs(now);
  const earliest = credits.length ? Math.min(...credits.map((row) => toMs(row.at))) : end;
  const start = days == null ? earliest : end - (days - 1) * DAY_MS;
  const buckets = new Map();
  for (let at = start; dayKey(at) <= dayKey(end); at += DAY_MS) buckets.set(dayKey(at), 0);
  credits.forEach((row) => {
    const key = dayKey(toMs(row.at));
    if (buckets.has(key)) buckets.set(key, buckets.get(key) + row.amountCents);
  });
  return [...buckets.entries()].map(([date, amountCents]) => ({ date, amountCents }));
}
