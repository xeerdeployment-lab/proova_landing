import { planConfig } from "../data/planConfig";
import { formatCents } from "../lib/money";
import {
  DAY_MS,
  HOUR_MS,
  capabilitySummary,
  claimWindow,
  countsAgainstCap,
  dailyIncomeRows,
  directRewardCents,
  evaluateRanks,
  restakeBounds,
  stakeBreakdown,
  sumCents,
  upDownPoolCents,
  upDownTierFor,
  validateStakeCents,
  validateWithdrawal,
  withdrawalBreakdown,
} from "../lib/plan";
import { ApiError } from "./errors";

/**
 * Development ledger: an in-browser stand-in for the member API, loaded only by development builds
 * that have no `VITE_API_URL`. It behaves like the server contract — it owns the clock, validates
 * every request with the plan engine, applies idempotency keys, settles pending records over time,
 * and never trusts amounts computed by the page. Every figure it returns is demo data.
 */

const storageKey = "axora.devLedger.v1";
const stakeConfirmMs = 3_500;
const withdrawalSettleMs = 6_000;
const latencyMs = 420;

export const scenarios = [
  { id: "active", label: "Active member" },
  { id: "capped", label: "Capability reached" },
  { id: "new", label: "New member" },
];

const iso = (ms) => new Date(ms).toISOString();
const ms = (value) => new Date(value).getTime();
const delay = (wait) => new Promise((resolve) => setTimeout(resolve, wait));

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    if (parsed?.version === 1) return parsed;
  } catch {
    // Unreadable or blocked storage falls through to a fresh seed.
  }
  return seed("active");
}

function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // The ledger still works for this session without persistence.
  }
}

const now = () => Date.now() + (state.clockOffsetMs ?? 0);

function nextId(target, prefix) {
  target.seq += 1;
  return `${prefix}-${target.seq}`;
}

function addRow(target, row) {
  const id = nextId(target, "AXR");
  target.ledger.push({ id, allocations: [], ...row });
  return id;
}

function notify(target, type, title, body, at) {
  target.notifications.push({ id: nextId(target, "NT"), type, title, body, at });
}

/* ───────── Seed ───────── */

const directSpecs = [
  { alias: "riya.s", joined: -(5 * DAY_MS + 22 * HOUR_MS), staked: -(5 * DAY_MS + 20 * HOUR_MS), cents: 12_000, children: 4 },
  { alias: "marco.d", joined: -(5 * DAY_MS + 8 * HOUR_MS), staked: -(5 * DAY_MS + 6 * HOUR_MS), cents: 6_000, children: 3 },
  { alias: "daniel.o", joined: -(3 * DAY_MS + HOUR_MS), staked: -3 * DAY_MS, cents: 6_000, children: 2 },
  { alias: "aiko.t", joined: -(2 * DAY_MS + 22 * HOUR_MS), staked: -(2 * DAY_MS + 20 * HOUR_MS), cents: 30_000, children: 3 },
  { alias: "lena.k", joined: -(2 * DAY_MS + HOUR_MS), staked: -2 * DAY_MS, cents: 3_000, children: 3 },
  { alias: "samuel.a", joined: -(DAY_MS + 2 * HOUR_MS), staked: -DAY_MS, cents: 60_000, children: 2 },
  // Joined recently; the stake confirms a minute or two after the ledger is seeded.
  { alias: "priya.n", joined: -3 * HOUR_MS, staked: 90_000, cents: 6_000, children: 0, pending: true },
];

const upDownSpecs = [
  [-(5 * DAY_MS + 19 * HOUR_MS), 60, "downline", 12_000],
  [-(5 * DAY_MS + 5 * HOUR_MS), 30, "downline", 6_000],
  [-(4 * DAY_MS + 9 * HOUR_MS), 45, "upline", 9_000],
  [-(3 * DAY_MS + 23 * HOUR_MS), 30, "downline", 6_000],
  [-(2 * DAY_MS + 19 * HOUR_MS), 150, "downline", 30_000],
  [-(2 * DAY_MS + 6 * HOUR_MS), 60, "upline", 12_000],
  [-(DAY_MS + 23 * HOUR_MS), 15, "downline", 3_000],
  [-(DAY_MS - HOUR_MS), 300, "downline", 60_000],
  [-9 * HOUR_MS, 120, "upline", 24_000],
];

const rankSpecs = [
  [-4 * DAY_MS, 184, "initiator"],
  [-(2 * DAY_MS + 12 * HOUR_MS), 92, "explorer"],
  [-20 * HOUR_MS, 210, "initiator"],
];

const eligibleByLevel = [6, 14, 22, 31, 18, 9, 4, 0, 0, 0];
const membersByLevel = [7, 17, 26, 35, 21, 11, 5, 1, 0, 0];
const claimSpecs = [
  [-(5 * DAY_MS + 2 * HOUR_MS), 0.15],
  [-(4 * DAY_MS + HOUR_MS), 0.3],
  [-3 * DAY_MS, 0.5],
  [-(2 * DAY_MS + HOUR_MS), 0.7],
  [-26 * HOUR_MS, 0.9],
];

function seed(scenario) {
  const t0 = Date.now();
  const at = (offset) => iso(t0 + offset);
  const s = {
    version: 1,
    scenario,
    clockOffsetMs: 0,
    seq: 100_400,
    member: {
      id: "AXR-20418",
      displayName: "Alex Morgan",
      referralCode: "AXR20418",
      walletAddress: "0xA0a0000000000000000000000000000000De7000",
      joinedAt: at(scenario === "new" ? -2 * HOUR_MS : -(6 * DAY_MS + 2 * HOUR_MS)),
      firstStakeAt: null,
      firstStakeCents: null,
    },
    stakes: [],
    directs: [],
    team: { eligibleByLevel: Array(10).fill(0), membersByLevel: Array(10).fill(0), upline: { count: 1, active: 1 } },
    ledger: [],
    lastClaimAt: null,
    idempotency: {},
    notifications: [],
  };

  notify(s, "announcement", "Welcome to Axora", "Your dashboard is running on the development ledger. Every figure is demo data.", at(-HOUR_MS));
  if (scenario === "new") return s;

  const stakeCents = scenario === "capped" ? 3_000 : 12_000;
  const firstStakeAt = -6 * DAY_MS;
  const stakeId = nextId(s, "STK");
  s.stakes.push({ id: stakeId, kind: "stake", amountCents: stakeCents, status: "active", createdAt: at(firstStakeAt - 60_000), confirmedAt: at(firstStakeAt) });
  s.member.firstStakeAt = at(firstStakeAt);
  s.member.firstStakeCents = stakeCents;
  recordStakeRows(s, s.stakes[0], "completed");
  s.team = { eligibleByLevel: [...eligibleByLevel], membersByLevel: [...membersByLevel], upline: { count: 12, active: 11 } };

  const cap = stakeCents * planConfig.capability.baseMultiple;
  let counted = 0;
  const credit = (row) => {
    const allowed = Math.max(0, Math.min(row.amountCents, cap - counted));
    if (allowed === 0) return;
    counted += allowed;
    const clipped = allowed < row.amountCents;
    addRow(s, {
      ...row,
      amountCents: allowed,
      meta: row.meta?.levels && clipped ? { ...row.meta, levels: clipLevels(row.meta.levels, allowed) } : row.meta,
      detail: clipped ? `${row.detail} Clipped to the remaining reward capability (${formatCents(allowed)} of ${formatCents(row.amountCents)}).` : row.detail,
    });
  };

  const rewards = [];
  directSpecs.forEach((spec) => {
    const id = nextId(s, "MBR");
    const direct = {
      id,
      alias: spec.alias,
      joinedAt: at(spec.joined),
      stakedAt: spec.pending ? null : at(spec.staked),
      stakeCents: spec.cents,
      status: spec.pending ? "pending" : "active",
      settleAt: spec.pending ? t0 + spec.staked : null,
      children: spec.children,
    };
    s.directs.push(direct);
    if (!spec.pending) {
      rewards.push({
        at: at(spec.staked + 60_000),
        category: "direct_reward",
        label: "Direct reward",
        direction: "credit",
        amountCents: directRewardCents(spec.cents),
        status: "completed",
        sourceId: id,
        detail: `10% of ${spec.alias}'s confirmed ${formatCents(spec.cents)} stake.`,
        allocations: [{ label: "Source stake", cents: spec.cents }],
      });
    }
  });
  upDownSpecs.forEach(([offset, cents, side, sourceCents]) =>
    rewards.push({
      at: at(offset),
      category: "updown_reward",
      label: "Up/Down reward",
      direction: "credit",
      amountCents: cents,
      status: "completed",
      detail: `Your position's share of the 40% pool from a ${formatCents(sourceCents)} ${side} stake, as settled by the backend.`,
      allocations: [
        { label: "Source stake", cents: sourceCents },
        { label: "Pool funded (40%)", cents: upDownPoolCents(sourceCents) },
      ],
      meta: { side },
    }),
  );
  rankSpecs.forEach(([offset, cents, rankId]) => {
    const rank = planConfig.ranks.find((item) => item.id === rankId);
    rewards.push({
      at: at(offset),
      category: "rank_reward",
      label: `${rank.name} rank reward`,
      direction: "credit",
      amountCents: cents,
      status: "completed",
      detail: `Your share of the ${rank.name} pool (${rank.deductionBps / 100}% of withdrawal deductions), distributed during withdrawal processing.`,
      meta: { rankId },
    });
  });
  claimSpecs.forEach(([offset, fraction]) => {
    const counts = eligibleByLevel.map((count) => Math.floor(count * fraction));
    const { rows, totalCents } = dailyIncomeRows(counts);
    rewards.push(dailyClaimRow(at(offset), totalCents, rows));
  });
  rewards.sort((a, b) => ms(a.at) - ms(b.at)).forEach(credit);
  s.lastClaimAt = at(claimSpecs.at(-1)[0]);

  const pendingDirect = s.directs.find((direct) => direct.status === "pending");
  addRow(s, {
    at: at(-3 * HOUR_MS + 600_000),
    category: "direct_reward",
    label: "Direct reward",
    direction: "credit",
    amountCents: directRewardCents(pendingDirect.stakeCents),
    status: "pending",
    sourceId: pendingDirect.id,
    detail: `10% of ${pendingDirect.alias}'s ${formatCents(pendingDirect.stakeCents)} stake. Pending until that stake is confirmed.`,
    allocations: [{ label: "Source stake", cents: pendingDirect.stakeCents }],
  });

  recordWithdrawal(s, 4_000, at(-2 * DAY_MS + 3 * HOUR_MS), "completed");

  notify(s, "stake", "Stake confirmed", `Your ${formatCents(stakeCents)} stake is active.`, at(firstStakeAt));
  const rankName = scenario === "capped" ? "Initiator" : "Explorer";
  notify(s, "rank", `Rank achieved: ${rankName}`, `You met the ${rankName} requirements inside the 72-hour window.`, at(-(5 * DAY_MS + 6 * HOUR_MS)));
  notify(s, "withdrawal", "Withdrawal completed", "Your $40.00 withdrawal was processed.", at(-2 * DAY_MS + 3 * HOUR_MS + withdrawalSettleMs));
  notify(s, "referral", "New direct referral", "priya.n joined with your link. Their stake is awaiting confirmation.", at(-3 * HOUR_MS));
  if (scenario === "capped") {
    notify(s, "reward", "Reward capability reached", "Restake to keep earning and withdrawing.", at(-HOUR_MS));
  }
  return s;
}

function dailyClaimRow(atIso, totalCents, rows) {
  return {
    at: atIso,
    category: "daily_income",
    label: "Daily income claim",
    direction: "credit",
    amountCents: totalCents,
    status: "completed",
    detail: "Fixed amount per eligible active user at each level, claimed once per 24 hours.",
    allocations: rows.filter((row) => row.dailyCents > 0).map((row) => ({ label: `Level ${row.level} · ${row.eligible} × ${formatCents(row.rateCents)}`, cents: row.dailyCents })),
    meta: { levels: rows.map((row) => row.dailyCents) },
  };
}

/** Spreads a capability-clipped claim across levels from level 1 so per-level totals still add up. */
function clipLevels(levels, cents) {
  let left = cents;
  return levels.map((amount) => {
    const take = Math.min(amount, left);
    left -= take;
    return take;
  });
}

function recordStakeRows(target, stake, status) {
  const breakdown = stakeBreakdown(stake.amountCents);
  const tier = upDownTierFor(stake.amountCents);
  const stakeRow = addRow(target, {
    at: stake.createdAt,
    category: stake.kind,
    label: stake.kind === "restake" ? "Restake" : "Stake",
    direction: "external",
    amountCents: stake.amountCents,
    status,
    relatedId: stake.id,
    detail: `${stake.kind === "restake" ? "Restake" : "Stake"} of ${formatCents(stake.amountCents)} from the connected wallet. ${tier?.name ?? ""} up/down eligibility.`,
    allocations: [
      { label: `Platform fee (${breakdown.feeLabel})`, cents: breakdown.feeCents },
      { label: `Net allocation (${breakdown.allocationLabel})`, cents: breakdown.allocationCents },
      { label: "Up/Down pool funded (40%)", cents: upDownPoolCents(stake.amountCents) },
    ],
  });
  addRow(target, {
    at: stake.createdAt,
    category: "platform_fee",
    label: "Stake platform fee",
    direction: "allocation",
    amountCents: breakdown.feeCents,
    status,
    relatedId: stakeRow,
    detail: `${breakdown.feeLabel} platform fee, part of ${stakeRow}. Not an additional charge.`,
  });
}

function recordWithdrawal(target, grossCents, atIso, status) {
  const split = withdrawalBreakdown(grossCents);
  const withdrawalId = addRow(target, {
    at: atIso,
    category: "withdrawal",
    label: "Withdrawal",
    direction: "debit",
    amountCents: grossCents,
    status,
    settleAt: status === "pending" ? ms(atIso) + withdrawalSettleMs : null,
    detail: `Withdrawal of ${formatCents(grossCents)}. You receive ${formatCents(split.memberCents)}.`,
    allocations: [
      { label: `You receive (${split.labels.member} after deduction)`, cents: split.memberCents },
      { label: `Up/Down income (${split.labels.upDown} after deduction)`, cents: split.upDownCents },
      { label: `Community fund (${split.labels.community} of deduction)`, cents: split.communityCents },
      ...split.rankPools.map((pool) => ({ label: `${pool.name} pool (${pool.bps / 100}% of deduction)`, cents: pool.cents })),
      { label: "Platform (rest of deduction)", cents: split.platformCents },
    ],
  });
  addRow(target, {
    at: atIso,
    category: "platform_fee",
    label: "Withdrawal deduction",
    direction: "allocation",
    amountCents: split.deductionCents,
    status,
    relatedId: withdrawalId,
    detail: `${split.labels.deduction} deduction on ${withdrawalId}. Funds the community fund, rank pools and platform.`,
  });
  addRow(target, {
    at: atIso,
    category: "community_fund",
    label: "Community fund allocation",
    direction: "allocation",
    amountCents: split.communityCents,
    status,
    relatedId: withdrawalId,
    detail: `${split.labels.community} of the deduction on ${withdrawalId}.`,
  });
  return withdrawalId;
}

let state = load();

/* ───────── Settlement ───────── */

function settle() {
  const t = now();
  let changed = false;

  state.stakes
    .filter((stake) => stake.status === "pending" && stake.settleAt <= t)
    .forEach((stake) => {
      const confirmedAt = iso(stake.settleAt);
      state.stakes.forEach((other) => {
        if (other.status === "active") {
          other.status = "closed";
          other.closedAt = confirmedAt;
        }
      });
      stake.status = "active";
      stake.confirmedAt = confirmedAt;
      if (!state.member.firstStakeAt) {
        state.member.firstStakeAt = confirmedAt;
        state.member.firstStakeCents = stake.amountCents;
      }
      state.ledger.forEach((row) => {
        if (row.status === "pending" && (row.relatedId === stake.id || state.ledger.some((parent) => parent.id === row.relatedId && parent.relatedId === stake.id))) {
          row.status = "completed";
        }
      });
      notify(state, "stake", `${stake.kind === "restake" ? "Restake" : "Stake"} confirmed`, `Your ${formatCents(stake.amountCents)} ${stake.kind} is now active.`, confirmedAt);
      changed = true;
    });

  state.ledger
    .filter((row) => row.category === "withdrawal" && row.status === "pending" && row.settleAt <= t)
    .forEach((row) => {
      row.status = "completed";
      state.ledger.forEach((child) => {
        if (child.relatedId === row.id) child.status = "completed";
      });
      notify(state, "withdrawal", "Withdrawal completed", `${row.id} for ${formatCents(row.amountCents)} was processed.`, iso(row.settleAt));
      changed = true;
    });

  state.directs
    .filter((direct) => direct.status === "pending" && direct.settleAt <= t)
    .forEach((direct) => {
      direct.status = "active";
      direct.stakedAt = iso(direct.settleAt);
      state.team.eligibleByLevel[0] += 1;
      const reward = state.ledger.find((row) => row.category === "direct_reward" && row.sourceId === direct.id && row.status === "pending");
      if (reward) {
        const allowed = Math.min(reward.amountCents, snapshot().capability.remainingCents);
        reward.detail =
          allowed === reward.amountCents
            ? `10% of ${direct.alias}'s confirmed ${formatCents(direct.stakeCents)} stake.`
            : `10% of ${direct.alias}'s ${formatCents(direct.stakeCents)} stake, clipped to the remaining reward capability.`;
        reward.status = allowed > 0 ? "completed" : "rejected";
        reward.amountCents = allowed;
      }
      notify(state, "referral", "Direct referral confirmed", `${direct.alias} confirmed a ${formatCents(direct.stakeCents)} stake.`, direct.stakedAt);
      changed = true;
    });

  if (changed) save();
}

/* ───────── Account snapshot (the authoritative calculation) ───────── */

function snapshot() {
  const t = now();
  const { member, stakes, directs, team } = state;
  const ledger = [...state.ledger].sort((a, b) => ms(b.at) - ms(a.at));
  const active = stakes.find((stake) => stake.status === "active") ?? null;
  const pending = stakes.find((stake) => stake.status === "pending") ?? null;
  const last = [...stakes].filter((stake) => stake.status !== "failed").sort((a, b) => ms(b.createdAt) - ms(a.createdAt))[0] ?? null;
  const cycleStart = active ? ms(active.confirmedAt) : null;
  const counted = cycleStart == null ? 0 : sumCents(ledger.filter((row) => countsAgainstCap(row) && ms(row.at) >= cycleStart));

  const capability = capabilitySummary({
    stakeCents: active?.amountCents ?? 0,
    firstStakeAt: member.firstStakeAt,
    directs,
    countedCents: counted,
    now: t,
  });

  const credits = ledger.filter((row) => row.direction === "credit");
  const debits = ledger.filter((row) => row.direction === "debit" && row.status !== "failed" && row.status !== "rejected");
  const completedCredits = sumCents(credits.filter((row) => row.status === "completed"));
  const balances = {
    availableCents: Math.max(0, completedCredits - sumCents(debits)),
    totalEarnedCents: completedCredits,
    pendingRewardsCents: sumCents(credits.filter((row) => row.status === "pending")),
    withdrawnCents: sumCents(debits.filter((row) => row.status === "completed")),
    pendingWithdrawalCents: sumCents(debits.filter((row) => row.status === "pending")),
  };

  const claimedByLevel = Array(10).fill(0);
  ledger
    .filter((row) => row.category === "daily_income" && row.status === "completed")
    .forEach((row) => row.meta?.levels?.forEach((cents, index) => (claimedByLevel[index] += cents)));
  const income = dailyIncomeRows(active ? team.eligibleByLevel : [], claimedByLevel);
  const window = claimWindow(state.lastClaimAt, t);
  const claimableCents = Math.min(income.totalCents, capability.remainingCents);
  const dailyBlocker = !active
    ? "An active stake is required to earn daily income."
    : capability.reached
      ? "Reward capability is reached. Restake to resume daily income."
      : income.totalCents === 0
        ? "No eligible active users in your levels yet."
        : !window.open
          ? "The next claim opens 24 hours after your last claim."
          : null;

  const tier = upDownTierFor(active?.amountCents);
  const upDownRows = ledger.filter((row) => row.category === "updown_reward");

  const rankEval = evaluateRanks({
    firstStakeAt: member.firstStakeAt,
    firstStakeCents: member.firstStakeCents,
    directs,
    now: t,
  });

  const directRewards = ledger.filter((row) => row.category === "direct_reward");
  const bounds = restakeBounds(last?.amountCents);
  const hasPendingWithdrawal = balances.pendingWithdrawalCents > 0;
  const restakeAllowed = Boolean(active) && !pending && (capability.reached || !planConfig.capability.restakeRequiredAtCap);

  return {
    source: "demo",
    scenario: state.scenario,
    serverTime: iso(t),
    planVersion: planConfig.version,
    member,
    stake: {
      active,
      pending,
      lastAmountCents: last?.amountCents ?? null,
      history: [...stakes].sort((a, b) => ms(b.createdAt) - ms(a.createdAt)),
      canStake: !active && !pending,
      restake: {
        allowed: restakeAllowed,
        required: Boolean(active) && capability.reached,
        minCents: bounds.minCents,
        maxCents: bounds.maxCents,
        reason: !active
          ? "Restaking needs an existing stake."
          : pending
            ? "A stake is already awaiting confirmation."
            : !capability.reached && planConfig.capability.restakeRequiredAtCap
              ? `Restaking opens when your ${capability.multiple}x reward capability is reached.`
              : null,
      },
    },
    balances,
    capability,
    upDown: {
      tier,
      poolCents: active ? upDownPoolCents(active.amountCents) : 0,
      upline: { positions: tier?.upline ?? 0, available: team.upline.count, eligible: Math.min(team.upline.active, tier?.upline ?? 0) },
      downline: {
        positions: tier?.downline ?? 0,
        available: team.membersByLevel.reduce((a, b) => a + b, 0),
        eligible: Math.min(team.eligibleByLevel.reduce((a, b) => a + b, 0), tier?.downline ?? 0),
      },
      receivedCents: sumCents(upDownRows.filter((row) => row.status === "completed")),
      payouts: upDownRows,
    },
    daily: {
      rows: income.rows,
      totalCents: income.totalCents,
      claimableCents,
      lastClaimAt: state.lastClaimAt,
      nextClaimAt: window.nextAt == null ? null : iso(window.nextAt),
      windowOpen: window.open,
      canClaim: dailyBlocker == null && claimableCents > 0,
      blocker: dailyBlocker,
      claimedTotalCents: claimedByLevel.reduce((a, b) => a + b, 0),
    },
    ranks: {
      list: rankEval.ranks,
      current: rankEval.current?.id ?? null,
      next: rankEval.next?.id ?? null,
      history: ledger.filter((row) => row.category === "rank_reward"),
    },
    referrals: {
      directs: directs.map((direct) => {
        const reward = directRewards.find((row) => row.sourceId === direct.id) ?? null;
        return {
          id: direct.id,
          alias: direct.alias,
          joinedAt: direct.joinedAt,
          stakedAt: direct.stakedAt,
          stakeCents: direct.stakeCents,
          status: direct.status,
          reward: reward ? { id: reward.id, cents: reward.amountCents, status: reward.status } : null,
        };
      }),
      total: directs.length,
      active: directs.filter((direct) => direct.status === "active").length,
      completedRewardsCents: sumCents(directRewards.filter((row) => row.status === "completed")),
      pendingRewardsCents: sumCents(directRewards.filter((row) => row.status === "pending")),
    },
    team: {
      levels: team.membersByLevel.map((members, index) => ({ level: index + 1, members, active: team.eligibleByLevel[index] })),
      totalMembers: team.membersByLevel.reduce((a, b) => a + b, 0),
      activeMembers: team.eligibleByLevel.reduce((a, b) => a + b, 0),
      upline: team.upline,
      tree: buildTree(member, directs, active, rankEval.current?.name),
    },
    withdrawal: {
      hasPending: hasPendingWithdrawal,
      blocker:
        planConfig.withdrawal.blockWhilePending && hasPendingWithdrawal
          ? "A withdrawal is already processing."
          : planConfig.withdrawal.blockWhenCapabilityReached && capability.reached
            ? "Reward capability is reached. Restake to continue withdrawing."
            : balances.availableCents < planConfig.withdrawal.minCents
              ? `At least ${formatCents(planConfig.withdrawal.minCents)} must be available to withdraw.`
              : null,
    },
    communityFund: {
      contributedCents: sumCents(ledger.filter((row) => row.category === "community_fund" && row.status !== "failed")),
      rows: ledger.filter((row) => row.category === "community_fund"),
    },
    ledger,
    notifications: [...state.notifications].sort((a, b) => ms(b.at) - ms(a.at)),
  };
}

function buildTree(member, directs, active, rankName) {
  let child = 0;
  const node = (id, alias, joinedAt, status, detail, rank, children = []) => ({ id, alias, joinedAt, verification: status, stakeEligibility: detail, rank, children });
  return {
    root: node(
      member.id,
      "You",
      member.joinedAt,
      "self",
      active ? `${formatCents(active.amountCents)} active stake` : "No active stake",
      rankName ?? "No rank yet",
      directs.map((direct) =>
        node(
          direct.id,
          direct.alias,
          direct.joinedAt,
          direct.status,
          direct.status === "active" ? `${formatCents(direct.stakeCents)} stake` : "Stake awaiting confirmation",
          "Level 1",
          Array.from({ length: direct.children }, () => {
            child += 1;
            const id = `MBR-${200 + child}`;
            return node(id, `member-${200 + child}`, direct.joinedAt, child % 5 === 0 ? "pending" : "active", child % 5 === 0 ? "Not yet staked" : "Active stake", "Level 2");
          }),
        ),
      ),
    ),
    upline: [node("AXR-19077", "Your sponsor", "2026-08-02T10:00:00.000Z", "active", "Active stake", "Sponsor")],
  };
}

/* ───────── Requests ───────── */

function idempotent(key, fingerprint, run) {
  if (!key) throw new ApiError("idempotency_required", "This request needs an idempotency key.", 400);
  const prior = state.idempotency[key];
  if (prior) {
    if (prior.fingerprint !== fingerprint) throw new ApiError("idempotency_conflict", "This request key was already used for a different request.", 409);
    return { ...prior.result, replayed: true };
  }
  const result = run();
  state.idempotency[key] = { fingerprint, result };
  return result;
}

function requireCents(body) {
  const cents = body?.amountCents;
  if (!Number.isSafeInteger(cents) || cents <= 0) throw new ApiError("invalid_amount", "Enter a valid amount.", 422);
  return cents;
}

function createStake(kind, cents) {
  const t = now();
  const stake = { id: nextId(state, "STK"), kind, amountCents: cents, status: "pending", createdAt: iso(t), settleAt: t + stakeConfirmMs };
  state.stakes.push(stake);
  recordStakeRows(state, stake, "pending");
  return { transactionId: stake.id, status: "pending", amountCents: cents };
}

const routes = {
  account: () => snapshot(),

  stake: ({ body, idempotencyKey }) =>
    idempotent(idempotencyKey, `stake:${body?.amountCents}`, () => {
      const cents = requireCents(body);
      const errors = validateStakeCents(cents);
      if (errors.length) throw new ApiError("invalid_amount", errors[0], 422);
      if (state.stakes.some((stake) => stake.status === "active" || stake.status === "pending")) {
        throw new ApiError("stake_exists", "This address already has an active stake. Use restake when it becomes available.", 409);
      }
      return createStake("stake", cents);
    }),

  restake: ({ body, idempotencyKey }) =>
    idempotent(idempotencyKey, `restake:${body?.amountCents}`, () => {
      const cents = requireCents(body);
      const account = snapshot();
      if (!account.stake.restake.allowed) throw new ApiError("restake_unavailable", account.stake.restake.reason ?? "Restaking is not available.", 409);
      const errors = validateStakeCents(cents, { minCents: account.stake.restake.minCents });
      if (errors.length) throw new ApiError("invalid_amount", errors[0], 422);
      return createStake("restake", cents);
    }),

  claim: ({ idempotencyKey }) =>
    idempotent(idempotencyKey, "claim", () => {
      const account = snapshot();
      if (!account.daily.canClaim) throw new ApiError("claim_unavailable", account.daily.blocker ?? "Nothing to claim right now.", 409);
      const t = now();
      const id = addRow(state, dailyClaimRow(iso(t), account.daily.claimableCents, account.daily.rows));
      if (account.daily.claimableCents < account.daily.totalCents) {
        const row = state.ledger.find((item) => item.id === id);
        row.detail += " Clipped to the remaining reward capability.";
        row.meta.levels = clipLevels(row.meta.levels, account.daily.claimableCents);
      }
      state.lastClaimAt = iso(t);
      notify(state, "reward", "Daily income claimed", `${formatCents(account.daily.claimableCents)} was added to your balance.`, iso(t));
      return { transactionId: id, status: "completed", amountCents: account.daily.claimableCents, nextClaimAt: iso(t + planConfig.dailyIncome.claimIntervalHours * HOUR_MS) };
    }),

  withdraw: ({ body, idempotencyKey }) =>
    idempotent(idempotencyKey, `withdraw:${body?.amountCents}`, () => {
      const cents = requireCents(body);
      const account = snapshot();
      const errors = validateWithdrawal(cents, {
        availableCents: account.balances.availableCents,
        hasPending: account.withdrawal.hasPending,
        capabilityReached: account.capability.reached,
      });
      if (errors.length) throw new ApiError("withdrawal_rejected", errors[0], 422);
      const id = recordWithdrawal(state, cents, iso(now()), "pending");
      notify(state, "withdrawal", "Withdrawal requested", `${id} for ${formatCents(cents)} is processing.`, iso(now()));
      return { transactionId: id, status: "pending", amountCents: cents, breakdown: withdrawalBreakdown(cents) };
    }),

  profile: ({ body }) => {
    const name = String(body?.displayName ?? "").trim();
    if (name.length < 2 || name.length > 48) throw new ApiError("invalid_name", "Use 2 to 48 characters.", 422);
    state.member.displayName = name;
    return { ok: true };
  },
};

export async function handle(route, args = {}) {
  await delay(latencyMs);
  const handler = routes[route.name];
  if (!handler) throw new ApiError("not_found", "Unknown request.", 404);
  settle();
  const result = handler(args);
  save();
  return structuredClone(route.name === "account" ? result : { ...result, account: snapshot() });
}

export async function reset(scenario = "active") {
  state = seed(scenario);
  save();
  return snapshot();
}

export async function advanceClock(hours) {
  state.clockOffsetMs = (state.clockOffsetMs ?? 0) + hours * HOUR_MS;
  settle();
  save();
  return snapshot();
}
