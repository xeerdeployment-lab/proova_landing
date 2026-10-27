import lazyRoute from "./lib/lazyRoute";
import { primeAccount } from "./services/api";

// The landing page ships only what it renders; the dashboard and secondary pages load on demand.
export const DashboardShell = lazyRoute(() => import("./components/layout/DashboardShell"));

export const publicPages = {
  "sign-in": lazyRoute(() => import("./pages/SignIn")),
  "get-started": lazyRoute(() => import("./pages/GetStarted")),
  privacy: lazyRoute(() => import("./pages/Privacy")),
  terms: lazyRoute(() => import("./pages/Terms")),
};
export const NotFound = lazyRoute(() => import("./pages/NotFound"));

export const dashboardPages = {
  "": lazyRoute(() => import("./pages/dashboard/Overview")),
  stake: lazyRoute(() => import("./pages/dashboard/MyStake")),
  rewards: lazyRoute(() => import("./pages/dashboard/Rewards")),
  team: lazyRoute(() => import("./pages/dashboard/MyTeam")),
  referrals: lazyRoute(() => import("./pages/dashboard/DirectReferrals")),
  "daily-income": lazyRoute(() => import("./pages/dashboard/DailyIncome")),
  ranks: lazyRoute(() => import("./pages/dashboard/RankAchievements")),
  withdrawals: lazyRoute(() => import("./pages/dashboard/Withdrawals")),
  transactions: lazyRoute(() => import("./pages/dashboard/Transactions")),
  restake: lazyRoute(() => import("./pages/dashboard/Restake")),
  "community-fund": lazyRoute(() => import("./pages/dashboard/CommunityFund")),
  notifications: lazyRoute(() => import("./pages/dashboard/Notifications")),
  profile: lazyRoute(() => import("./pages/dashboard/Profile")),
  help: lazyRoute(() => import("./pages/dashboard/Help")),
};
export const DashboardNotFound = lazyRoute(() => import("./pages/dashboard/NotFound"));

/**
 * Starts everything the first route needs at once: its chunks, and on the dashboard the account
 * request, which would otherwise wait for the shell to mount. Resolves when the first render can
 * happen without suspending.
 */
export function preloadEntry(pathname) {
  const [, first = "", second = ""] = pathname.replace(/\/+$/, "").split("/");
  if (first === "dashboard") {
    primeAccount();
    dashboardPages[second]?.preload().catch(() => {});
    return DashboardShell.preload();
  }
  return publicPages[first]?.preload() ?? Promise.resolve();
}
