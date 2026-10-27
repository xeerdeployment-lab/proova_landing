/**
 * The axora compensation plan as configuration. All money is integer cents and all rates are basis
 * points (1% = 100 bps), so no financial figure ever passes through a binary float.
 *
 * This file and `lib/plan.js` are the single calculation source. They have no browser dependencies,
 * so a backend can import them unchanged and stay the authority for every settled figure.
 *
 * Where the written plan is ambiguous, the basis chosen here is explicit and `confirmed: false`
 * marks it for sign-off. Change the basis here, never inline in a component.
 */
export const planConfig = {
  version: "2026.10",

  stake: {
    minCents: 3_000,
    maxCents: 120_000,
    incrementCents: 1_000,
    platformFeeBps: 1_000,
    allocationBps: 9_000,
    oneActivePerAddress: true,
    presetsCents: [3_000, 6_000, 12_000, 30_000, 60_000, 120_000],
  },

  directReward: {
    rateBps: 1_000,
    // "gross" = the referral's confirmed stake amount before the platform fee.
    basis: "gross",
    // One payout per referred stake event; the backend keys rewards on the source stake id.
    oncePerSourceStake: true,
  },

  upDown: {
    poolBps: 4_000,
    basis: "gross",
    tiers: [
      { id: "tier-1", name: "Tier 1", minCents: 3_000, maxCents: 5_900, upline: 20, downline: 20 },
      { id: "tier-2", name: "Tier 2", minCents: 6_000, maxCents: 11_900, upline: 30, downline: 30 },
      { id: "tier-3", name: "Tier 3", minCents: 12_000, maxCents: 120_000, upline: 40, downline: 40 },
    ],
    // How the pool is divided between positions is owned by the backend. The interface never
    // assumes an equal split; individual amounts come only from settled ledger records.
    splitRule: "backend",
    confirmed: false,
  },

  dailyIncome: {
    claimIntervalHours: 24,
    requiresActiveStake: true,
    levels: [
      { level: 1, rateCents: 1 },
      { level: 2, rateCents: 2 },
      { level: 3, rateCents: 3 },
      { level: 4, rateCents: 4 },
      { level: 5, rateCents: 5 },
      { level: 6, rateCents: 5 },
      { level: 7, rateCents: 5 },
      { level: 8, rateCents: 5 },
      { level: 9, rateCents: 5 },
      { level: 10, rateCents: 5 },
    ],
  },

  ranks: [
    { id: "initiator", name: "Initiator", selfStakeCents: 3_000, directCount: 2, directStakeCents: 3_000, windowHours: 72, deductionBps: 400 },
    { id: "explorer", name: "Explorer", selfStakeCents: 6_000, directCount: 2, directStakeCents: 6_000, windowHours: 72, deductionBps: 300 },
    { id: "builder", name: "Builder", selfStakeCents: 12_000, directCount: 2, directStakeCents: 12_000, windowHours: 72, deductionBps: 300 },
  ],

  withdrawal: {
    minCents: 100,
    deductionBps: 1_000,
    // Applied to the amount left after the deduction. Member + up/down must total 10,000 bps.
    memberShareBps: 5_000,
    upDownShareBps: 5_000,
    // Carved out of the deduction (not the gross), so nothing is double-counted. Whatever the
    // deduction lines do not allocate stays with the platform.
    deductionSplit: {
      communityFundBps: 1_000,
      rankPoolBps: { initiator: 400, explorer: 300, builder: 300 },
    },
    blockWhilePending: true,
    blockWhenCapabilityReached: true,
    confirmed: false,
    basisNote:
      "Provisional basis: the 10% deduction is taken from the requested amount first; the rest is split 50/50 between you and up/down income. The community fund (10%) and rank pools (4%, 3%, 3%) are portions of the deduction, and the platform keeps the remainder of the deduction. Every line adds back to the requested amount.",
  },

  capability: {
    baseMultiple: 3,
    // "applicable stake" = the stake of the current cycle. Rewards are counted from that stake's start.
    basis: "current-stake",
    enhanced: [
      { directs: 15, withinDays: 10, multiple: 5 },
      { directs: 10, withinDays: 10, multiple: 4 },
    ],
    countedCategories: ["direct_reward", "updown_reward", "daily_income", "rank_reward"],
    restakeRequiredAtCap: true,
  },
};

export const transactionCategories = [
  { id: "stake", label: "Stake" },
  { id: "restake", label: "Restake" },
  { id: "platform_fee", label: "Platform fee" },
  { id: "direct_reward", label: "Direct reward" },
  { id: "updown_reward", label: "Up/Down reward" },
  { id: "daily_income", label: "Daily income" },
  { id: "rank_reward", label: "Rank reward" },
  { id: "withdrawal", label: "Withdrawal" },
  { id: "community_fund", label: "Community fund" },
];

export const rewardCategories = transactionCategories.filter((item) =>
  ["direct_reward", "updown_reward", "daily_income", "rank_reward"].includes(item.id),
);

export const ledgerStatuses = [
  { id: "pending", label: "Pending" },
  { id: "completed", label: "Completed" },
  { id: "failed", label: "Failed" },
  { id: "rejected", label: "Rejected" },
];

export function categoryLabel(id) {
  return transactionCategories.find((item) => item.id === id)?.label ?? id;
}
