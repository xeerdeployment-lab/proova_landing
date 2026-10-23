/**
 * Stated proova plan values used by the dashboard preview.
 * Unconfirmed relationships stay flagged and are not turned into payouts.
 * A future backend owns eligibility, calculation, and settlement.
 */
export const planConfig = {
  version: "stated-plan-preview",
  stake: {
    minCents: 3_000,
    maxCents: 120_000,
    incrementCents: 1_000,
    platformFeeBps: 1_000,
    allocationBps: 9_000,
    oneActivePerAccount: true,
    quickAmountsCents: [3_000, 5_000, 10_000, 25_000, 50_000, 100_000, 120_000],
  },
  directReward: {
    rateBps: 1_000,
    basis: "stake amount",
    note: "The stated direct reward is 10% of stake amount.",
  },
  upDown: {
    allocationBps: 4_000,
    scopeConfirmed: false,
    scopeNote:
      "The stated plan assigns a 40% reward allocation together with a count of upline and downline users. It does not say whether that 40% is the combined allocation for both directions or applies separately to each direction. This preview does not invent a split and does not calculate payouts.",
    tiers: [
      { id: "tier-30", minCents: 3_000, maxCents: 5_900, upline: 20, downline: 20 },
      { id: "tier-60", minCents: 6_000, maxCents: 11_900, upline: 30, downline: 30 },
      { id: "tier-120", minCents: 12_000, maxCents: 120_000, upline: 40, downline: 40 },
    ],
  },
  levels: [
    { level: 1, amountCents: 1 },
    { level: 2, amountCents: 2 },
    { level: 3, amountCents: 3 },
    { level: 4, amountCents: 4 },
    { level: 5, amountCents: 5 },
    { level: 6, amountCents: 5 },
    { level: 7, amountCents: 5 },
    { level: 8, amountCents: 5 },
    { level: 9, amountCents: 5 },
    { level: 10, amountCents: 5 },
  ],
  levelTriggerNote:
    "These are stated reward amounts. The plan does not yet specify the earning event or the frequency for each level, so no level payout is calculated.",
  ranks: [
    {
      id: "initiator",
      name: "Initiator",
      selfStakeCents: 3_000,
      directCount: 2,
      directStakeCents: 3_000,
      windowHours: 72,
      deductionBps: 400,
      accent: "violet",
    },
    {
      id: "explorer",
      name: "Explorer",
      selfStakeCents: 6_000,
      directCount: 2,
      directStakeCents: 6_000,
      windowHours: 72,
      deductionBps: 300,
      accent: "electric",
    },
    {
      id: "builder",
      name: "Builder",
      selfStakeCents: 12_000,
      directCount: 2,
      directStakeCents: 12_000,
      windowHours: 72,
      deductionBps: 300,
      accent: "gold",
    },
  ],
  rankNote:
    "Rank distributions are described as coming from withdrawal deductions. A rank is not shown as achieved until a backend confirms eligibility. These deduction rates are not stacked into the withdrawal preview, because their relationship to the other withdrawal lines is unconfirmed.",
  withdrawal: {
    minCents: 100,
    statedMemberShareBps: 5_000,
    statedUpDownBps: 5_000,
    statedFeeBps: 1_000,
    statedCommunityBps: 1_000,
    formulaConfirmed: false,
    formulaNote:
      "The stated plan says a member receives 50% of a withdrawal and 50% goes toward upline and downline income. It also states a 10% withdrawal fee, a 10% community fund deduction, and rank rewards distributed from withdrawal deductions. How those lines relate — and whether any of them overlap — is not confirmed. This preview lists each stated line on its own and does not calculate a net payout.",
  },
  reentry: {
    compulsoryMultiple: 3,
    maxCents: 120_000,
    enhanced: [
      { directs: 10, withinDays: 10, multiple: 4 },
      { directs: 15, withinDays: 10, multiple: 5 },
    ],
    rulesConfirmed: false,
    note: "Re-entry is stated as compulsory once a member reaches a 3X income withdrawal threshold. Re-entry can use the last stake amount or a higher amount, up to $1,200. Ten direct referrals within 10 days of joining are stated to qualify for a 4X lifetime income limit, and fifteen for a 5X limit. The meaning of cumulative income, the base used for those multiples, and how the limit interacts with withdrawals are unconfirmed. A higher limit does not guarantee earnings.",
  },
};

export const transactionCategories = [
  { id: "stake", label: "Stake" },
  { id: "direct_reward", label: "Direct reward" },
  { id: "updown_reward", label: "Up/Down reward" },
  { id: "level_reward", label: "Level reward" },
  { id: "rank_reward", label: "Rank reward" },
  { id: "withdrawal", label: "Withdrawal" },
  { id: "platform_fee", label: "Platform fee" },
  { id: "community_fund", label: "Community fund" },
  { id: "reentry", label: "Re-entry" },
];

export const rewardCategories = transactionCategories.filter((item) =>
  ["direct_reward", "updown_reward", "level_reward", "rank_reward"].includes(item.id),
);

export const ledgerStatuses = [
  { id: "pending", label: "Pending" },
  { id: "completed", label: "Completed" },
  { id: "rejected", label: "Rejected" },
  { id: "failed", label: "Failed" },
];
