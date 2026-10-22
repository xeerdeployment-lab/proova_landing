import { planConfig } from "../data/planConfig";
import { formatBps, formatCents, percentOf } from "./money";

export function validateStakeCents(cents) {
  if (cents == null) return ["Enter a stake amount."];
  const errors = [];
  const { minCents, maxCents, incrementCents } = planConfig.stake;
  if (cents < minCents) errors.push(`Minimum stake is ${formatCents(minCents)}.`);
  if (cents > maxCents) errors.push(`Maximum stake is ${formatCents(maxCents)}.`);
  if (cents % incrementCents !== 0) errors.push("Stake amounts must be in multiples of $10.");
  return errors;
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

export function upDownTierFor(cents) {
  if (cents == null) return null;
  return planConfig.upDown.tiers.find((tier) => cents >= tier.minCents && cents <= tier.maxCents) ?? null;
}

export function validateWithdrawalCents(cents) {
  if (cents == null) return ["Enter a withdrawal amount."];
  if (cents < planConfig.withdrawal.minCents) {
    return [`Minimum withdrawal is ${formatCents(planConfig.withdrawal.minCents)}.`];
  }
  return [];
}

export function withdrawalPreview(cents) {
  const rules = planConfig.withdrawal;
  return {
    requestedCents: cents,
    feeCents: percentOf(cents, rules.statedFeeBps),
    communityCents: percentOf(cents, rules.statedCommunityBps),
    upDownCents: percentOf(cents, rules.statedUpDownBps),
    netCents: null,
  };
}

export function directsWithinDays(createdAt, people, days) {
  const start = new Date(createdAt).getTime();
  const end = start + days * 24 * 60 * 60 * 1000;
  return people.filter((person) => {
    const joined = new Date(person.joinedAt).getTime();
    return joined >= start && joined <= end;
  });
}

export function evaluateRanks({ selfStakeCents, directs, now = new Date(), illustrativeDeadline = null }) {
  return planConfig.ranks.map((rank) => {
    const qualifiedDirects = directs.filter(
      (person) => (person.sampleStakeCents ?? 0) >= rank.directStakeCents,
    ).length;
    const selfMet = selfStakeCents >= rank.selfStakeCents;
    const directsMet = qualifiedDirects >= rank.directCount;
    const windowElapsed = illustrativeDeadline ? now.getTime() > illustrativeDeadline.getTime() : false;
    return {
      ...rank,
      confirmed: false,
      checks: [
        {
          id: "self",
          label: `Self stake of ${formatCents(rank.selfStakeCents)}`,
          state: selfMet ? "met-in-sample" : "not-met",
          detail: selfMet
            ? "The sample active stake meets this stated amount. That is not backend confirmation."
            : "The sample active stake is below this stated amount.",
        },
        {
          id: "directs",
          label: `${rank.directCount} direct referrals, each with a stake of at least ${formatCents(rank.directStakeCents)}`,
          state: directsMet ? "met-in-sample" : "not-met",
          detail: `${qualifiedDirects} of ${rank.directCount} sample direct records meet this threshold. Individual stake amounts are not listed.`,
        },
        {
          id: "window",
          label: `Completed within ${rank.windowHours} hours of the first stake`,
          state: "unverified",
          detail: windowElapsed
            ? "The illustrative 72-hour clock in this preview has elapsed. A verified first-stake timestamp is still required."
            : "The clock on this page is illustrative. It is not a verified first-stake timestamp.",
        },
      ],
    };
  });
}
