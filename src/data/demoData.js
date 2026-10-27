import { planConfig } from "./planConfig";
import { inMonth } from "../lib/dates";
import { formatCents, percentOf } from "../lib/money";
import { stakeBreakdown } from "../lib/plan";

/** Copy for the illustrative landing mockups. The dashboard reads rules from planConfig instead. */
const notes = {
  direct: "The direct reward is 10% of the referred stake amount.",
  upDown: "Each stake funds a 40% up/down pool shared across eligible upline and downline positions by tier.",
  level: "Daily income is a fixed amount per eligible active user at each of 10 levels.",
  rank: "Rank pools are funded from withdrawal deductions and distributed during withdrawal processing.",
  withdrawal: "A 10% deduction applies; the remainder is split between the member and up/down income.",
  reentry: "A restake is required once the reward capability is reached.",
};

export const demoMember = {
  id: "PRV-20418",
  displayName: "Demo Member",
  createdAt: "2026-09-12T10:00:00.000Z",
  referralId: "PRV-20418",
};

/**
 * Sample stake amounts used only to illustrate the member's own reward math.
 * Team surfaces do not render these figures.
 */
const sampleStakeCentsById = {
  "REF-4410": 5_000,
  "REF-4412": 3_000,
  "REF-4422": 3_000,
};

const sampleDirects = [
  {
    id: "REF-4410",
    alias: "Sample direct A",
    joinedAt: "2026-10-02",
    verification: "verified",
    stakeEligibility: "Sample stake on file",
    rank: "Not confirmed",
    children: [
      {
        id: "REF-4418",
        alias: "Sample member A1",
        joinedAt: "2026-10-09",
        verification: "pending",
        stakeEligibility: "No sample stake",
        rank: "Not confirmed",
        children: [],
      },
      {
        id: "REF-4422",
        alias: "Sample member A2",
        joinedAt: "2026-10-11",
        verification: "verified",
        stakeEligibility: "Sample stake on file",
        rank: "Not confirmed",
        children: [],
      },
    ],
  },
  {
    id: "REF-4412",
    alias: "Sample direct B",
    joinedAt: "2026-10-05",
    verification: "pending",
    stakeEligibility: "Sample stake on file",
    rank: "Not confirmed",
    children: [
      {
        id: "REF-4430",
        alias: "Sample member B1",
        joinedAt: "2026-10-14",
        verification: "verified",
        stakeEligibility: "No sample stake",
        rank: "Not confirmed",
        children: [],
      },
    ],
  },
  {
    id: "REF-4414",
    alias: "Sample direct C",
    joinedAt: "2026-10-08",
    verification: "verified",
    stakeEligibility: "No sample stake",
    rank: "Not confirmed",
    children: [],
  },
  {
    id: "REF-4416",
    alias: "Sample direct D",
    joinedAt: "2026-10-16",
    verification: "pending",
    stakeEligibility: "No sample stake",
    rank: "Not confirmed",
    children: [],
  },
];

const sampleUpline = [
  {
    id: "UPL-1001",
    alias: "Sample upline",
    joinedAt: "2026-08-02",
    verification: "verified",
    stakeEligibility: "Not shown",
    rank: "Not confirmed",
    children: [],
  },
];

function findPerson(id, nodes = sampleDirects) {
  for (const node of nodes) {
    if (node.id === id) return node;
    const nested = findPerson(id, node.children ?? []);
    if (nested) return nested;
  }
  return sampleUpline.find((node) => node.id === id) ?? null;
}

function publicNode(node) {
  return {
    id: node.id,
    alias: node.alias,
    joinedAt: node.joinedAt,
    verification: node.verification,
    stakeEligibility: node.stakeEligibility,
    rank: node.rank,
    children: (node.children ?? []).map(publicNode),
  };
}

function flatten(nodes, depth, acc = []) {
  nodes.forEach((node) => {
    acc.push({ ...node, depth, children: undefined });
    if (node.children?.length) flatten(node.children, depth + 1, acc);
  });
  return acc;
}

function weekStart(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const offset = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - offset);
  return date.toISOString().slice(0, 10);
}

function buildSeries(days, now) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const rows = [];
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() - index);
    const wave = Math.sin((days - index) / 3.15);
    const amountCents = 160 + Math.round((wave + 1) * 210);
    rows.push({
      date: date.toISOString().slice(0, 10),
      amountCents,
    });
  }
  return rows;
}

function buildTransactions() {
  const stakeCents = 10_000;
  const breakdown = stakeBreakdown(stakeCents);
  const directSpecs = [
    {
      id: "TX-1014",
      referralId: "REF-4410",
      status: "completed",
      at: "2026-10-19T11:05:00.000Z",
    },
    {
      id: "TX-1018",
      referralId: "REF-4412",
      status: "pending",
      at: "2026-10-20T16:40:00.000Z",
    },
  ];

  const directRows = directSpecs.map((spec) => {
    const basis = sampleStakeCentsById[spec.referralId];
    const amountCents = percentOf(basis, planConfig.directReward.rateBps);
    const person = findPerson(spec.referralId);
    return {
      id: spec.id,
      at: spec.at,
      category: "direct_reward",
      label: "Direct reward",
      amountCents,
      status: spec.status,
      referralId: spec.referralId,
      referralAlias: person?.alias ?? spec.referralId,
      detail: "Illustrative direct reward from the stated 10% rule. Not a confirmed or withdrawable payout.",
      rule: notes.direct,
      calculation: `10% of the sample stake ${formatCents(basis)} on this reward record (${spec.referralId}) = ${formatCents(amountCents)}.`,
    };
  });

  return [
    {
      id: "TX-1008",
      at: "2026-10-18T09:24:00.000Z",
      category: "stake",
      label: "Stake",
      amountCents: stakeCents,
      status: "completed",
      detail: "Sample active stake. This preview did not collect a payment.",
      rule: `Stakes are ${formatCents(planConfig.stake.minCents)} to ${formatCents(planConfig.stake.maxCents)}, in $10 steps. One active stake is stated per account.`,
      calculation: `Sample amount ${formatCents(stakeCents)}. Platform fee ${breakdown.feeLabel} = ${formatCents(breakdown.feeCents)}. Remaining allocation = ${formatCents(breakdown.allocationCents)}. The fee row restates that component. It is not a second charge.`,
    },
    {
      id: "TX-1009",
      at: "2026-10-18T09:24:00.000Z",
      category: "platform_fee",
      label: "Platform fee",
      amountCents: breakdown.feeCents,
      status: "completed",
      detail: "Component of sample stake TX-1008. Not an additional settled charge.",
      rule: `Stated platform fee is ${breakdown.feeLabel} of the stake amount.`,
      calculation: `${breakdown.feeLabel} of ${formatCents(stakeCents)} = ${formatCents(breakdown.feeCents)}, in integer cents.`,
      relatedId: "TX-1008",
    },
    ...directRows,
    {
      id: "TX-1022",
      at: "2026-10-20T18:12:00.000Z",
      category: "updown_reward",
      label: "Up/Down reward",
      amountCents: null,
      status: "pending",
      detail: "Sample structure event. No amount is assigned because the 40% allocation scope is unconfirmed.",
      rule: notes.upDown,
      calculation: "Not calculated.",
    },
    {
      id: "TX-1026",
      at: "2026-10-17T08:15:00.000Z",
      category: "level_reward",
      label: "Level reward",
      amountCents: null,
      status: "pending",
      detail: "No level earning event is confirmed. Stated amounts are on the rewards page.",
      rule: notes.level,
      calculation: "Not calculated.",
    },
    {
      id: "TX-1030",
      at: "2026-10-16T12:00:00.000Z",
      category: "rank_reward",
      label: "Rank reward",
      amountCents: null,
      status: "pending",
      detail: "No rank eligibility is confirmed, so no distribution is calculated.",
      rule: notes.rank,
      calculation: "Not calculated.",
    },
    {
      id: "TX-1034",
      at: "2026-10-15T15:45:00.000Z",
      category: "withdrawal",
      label: "Withdrawal",
      amountCents: 2_000,
      status: "pending",
      detail: "Sample withdrawal row. It was not submitted to a backend, and no funds moved.",
      rule: notes.withdrawal,
      calculation: "Requested $20.00 in the sample ledger. Net payout is not calculated.",
    },
    {
      id: "TX-1038",
      at: "2026-10-12T10:20:00.000Z",
      category: "withdrawal",
      label: "Withdrawal",
      amountCents: 1_500,
      status: "rejected",
      detail: "Sample rejected status for the interface. No request was processed.",
      rule: `Minimum withdrawal is ${formatCents(planConfig.withdrawal.minCents)}.`,
      calculation: "No payout.",
    },
    {
      id: "TX-1042",
      at: "2026-10-11T09:05:00.000Z",
      category: "withdrawal",
      label: "Withdrawal",
      amountCents: 2_500,
      status: "failed",
      detail: "Sample failed status for the interface. No transfer was attempted.",
      rule: "A withdrawal is not successful until the backend confirms it.",
      calculation: "No payout.",
    },
    {
      id: "TX-1046",
      at: "2026-10-15T15:46:00.000Z",
      category: "community_fund",
      label: "Community fund",
      amountCents: null,
      status: "pending",
      detail: "The 10% community fund deduction is stated for withdrawals. It is not applied, because the formula is unconfirmed.",
      rule: notes.withdrawal,
      calculation: "Not calculated.",
      relatedId: "TX-1034",
    },
    {
      id: "TX-1050",
      at: "2026-10-01T13:10:00.000Z",
      category: "reentry",
      label: "Re-entry",
      amountCents: null,
      status: "pending",
      detail: "No re-entry event has occurred. This row reserves the category in the preview ledger.",
      rule: notes.reentry,
      calculation: "Not calculated.",
    },
  ];
}

export const demoNotifications = [
  {
    id: "NT-1",
    type: "announcement",
    title: "Payout formulas are not final",
    body: "Up/down allocation, level reward triggers, withdrawal deductions, and income limits still need a confirmed rule before any amount can be calculated.",
    at: "2026-10-20T09:00:00.000Z",
  },
  {
    id: "NT-2",
    type: "stake",
    title: "Sample stake is on file",
    body: "A sample active stake of $100.00 is shown so the stake screen can be reviewed. No payment was collected.",
    at: "2026-10-18T09:24:00.000Z",
  },
  {
    id: "NT-3",
    type: "reward",
    title: "Sample direct reward is pending",
    body: "An illustrative direct reward is pending in the preview ledger. It is not settled and it is not available to withdraw.",
    at: "2026-10-20T16:40:00.000Z",
  },
  {
    id: "NT-4",
    type: "withdrawal",
    title: "Sample withdrawal is still pending",
    body: "The pending withdrawal row is a sample status. It was not submitted, and no funds moved.",
    at: "2026-10-15T15:45:00.000Z",
  },
  {
    id: "NT-5",
    type: "rank",
    title: "No rank is confirmed",
    body: "Initiator, Explorer, and Builder stay unconfirmed until a backend checks eligibility against a verified first-stake time.",
    at: "2026-10-19T08:30:00.000Z",
  },
  {
    id: "NT-6",
    type: "referral",
    title: "Referral rows are simulated",
    body: "Direct referral rows in this preview are sample records. They do not mean someone joined with your link.",
    at: "2026-10-11T12:15:00.000Z",
  },
];

export function referralLink(code = demoMember.referralId) {
  const origin = typeof window === "undefined" ? "https://axora.example" : window.location.origin;
  return `${origin}/get-started?ref=${encodeURIComponent(code)}`;
}

export function getDemoModel(now = new Date()) {
  const transactions = buildTransactions().sort((a, b) => new Date(b.at) - new Date(a.at));
  const directs = sampleDirects.map(publicNode);
  const upline = sampleUpline.map(publicNode);
  const downline = flatten(directs, 1);
  const uniqueIds = new Set([...upline, ...downline].map((person) => person.id));
  const stakes = [
    {
      id: "STK-1008",
      amountCents: 10_000,
      startedAt: "2026-10-18T09:24:00.000Z",
      status: "active",
      transactionId: "TX-1008",
      note: "Sample active stake. Rewards are not attributed to it by a verified ledger.",
    },
    {
      id: "STK-0902",
      amountCents: 5_000,
      startedAt: "2026-09-02T11:00:00.000Z",
      closedAt: "2026-09-20T11:00:00.000Z",
      status: "closed",
      transactionId: null,
      note: "Earlier sample record. Not a verified historical stake.",
    },
  ];
  const activeStake = stakes.find((stake) => stake.status === "active") ?? null;
  const directRows = transactions.filter((row) => row.category === "direct_reward" && row.amountCents != null);
  const sum = (rows) => rows.reduce((total, row) => total + row.amountCents, 0);
  const people = [...upline, ...downline];
  const growthMap = new Map();
  people.forEach((person) => {
    const key = weekStart(person.joinedAt);
    growthMap.set(key, (growthMap.get(key) ?? 0) + 1);
  });
  const growth = [...growthMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, count]) => ({ week, count }));

  return {
    member: demoMember,
    transactions,
    stakes,
    activeStake,
    directs,
    upline,
    downline,
    networkRoot: {
      id: demoMember.id,
      alias: "You",
      joinedAt: demoMember.createdAt.slice(0, 10),
      verification: "self",
      stakeEligibility: "Shown on My Stake",
      rank: "Not confirmed",
      children: directs,
    },
    rankDirects: sampleDirects.map((person) => ({
      id: person.id,
      sampleStakeCents: sampleStakeCentsById[person.id] ?? 0,
    })),
    growth,
    earnings: {
      7: buildSeries(7, now),
      30: buildSeries(30, now),
      90: buildSeries(90, now),
    },
    breakdown: [
      {
        key: "direct",
        label: "Direct rewards",
        amountCents: sum(directRows),
        calculated: true,
      },
      { key: "updown", label: "Up/Down rewards", amountCents: null, calculated: false },
      { key: "level", label: "Level rewards", amountCents: null, calculated: false },
      { key: "rank", label: "Rank rewards", amountCents: null, calculated: false },
    ],
    snapshot: {
      totalRewardsCents: sum(directRows),
      availableCents: sum(directRows.filter((row) => row.status === "completed")),
      pendingCents: sum(directRows.filter((row) => row.status === "pending")),
      totalWithdrawalsCents: sum(
        transactions.filter((row) => row.category === "withdrawal" && row.status === "completed" && row.amountCents != null),
      ),
      currentStakeCents: activeStake?.amountCents ?? 0,
      lifetimeLimitCents: null,
      directReferrals: directs.length,
      teamMembers: uniqueIds.size,
      uplineCount: upline.length,
      downlineCount: downline.length,
      verifiedRecords: people.filter((person) => person.verification === "verified").length,
      rankLabel: "Not confirmed",
      rewardsThisMonthCents: sum(directRows.filter((row) => inMonth(row.at, now))),
      withdrawalRequests: transactions.filter((row) => row.category === "withdrawal").length,
    },
    activity: [
      "Sample record REF-4410 is marked verified in this preview.",
      "Sample record REF-4412 is still pending verification.",
      "No confirmed enrollment is attached to the referral link.",
    ],
  };
}
