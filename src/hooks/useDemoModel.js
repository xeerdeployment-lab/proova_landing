import { useMemo } from "react";
import { useDashboard } from "./useDashboard";
import { getDemoModel } from "../data/demoData";

const blankSnapshot = {
  totalRewardsCents: null,
  availableCents: null,
  pendingCents: null,
  totalWithdrawalsCents: null,
  currentStakeCents: null,
  lifetimeLimitCents: null,
  directReferrals: 0,
  teamMembers: 0,
  uplineCount: 0,
  downlineCount: 0,
  verifiedRecords: 0,
  rankLabel: "Not confirmed",
  rewardsThisMonthCents: null,
  withdrawalRequests: 0,
};

export default function useDemoModel() {
  const { dataMode, setDataMode } = useDashboard();
  const model = useMemo(() => getDemoModel(), []);
  const view = useMemo(() => {
    if (dataMode !== "empty") return model;
    return {
      ...model,
      transactions: [],
      stakes: [],
      activeStake: null,
      directs: [],
      upline: [],
      downline: [],
      networkRoot: { ...model.networkRoot, children: [] },
      rankDirects: [],
      growth: [],
      earnings: { 7: [], 30: [], 90: [] },
      breakdown: model.breakdown.map((item) => ({ ...item, amountCents: null, calculated: false })),
      snapshot: blankSnapshot,
      activity: [],
    };
  }, [dataMode, model]);

  return {
    model: view,
    dataMode,
    empty: dataMode === "empty",
    retry: () => setDataMode("sample"),
  };
}
