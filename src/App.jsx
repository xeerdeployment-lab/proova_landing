import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import Layout from "./components/Layout";
import DashboardShell from "./components/layout/DashboardShell";
import GetStarted from "./pages/GetStarted";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import SignIn from "./pages/SignIn";
import Terms from "./pages/Terms";

const Overview = lazy(() => import("./pages/dashboard/Overview"));
const MyStake = lazy(() => import("./pages/dashboard/MyStake"));
const Rewards = lazy(() => import("./pages/dashboard/Rewards"));
const MyTeam = lazy(() => import("./pages/dashboard/MyTeam"));
const DirectReferrals = lazy(() => import("./pages/dashboard/DirectReferrals"));
const NetworkStructure = lazy(() => import("./pages/dashboard/NetworkStructure"));
const RankAchievements = lazy(() => import("./pages/dashboard/RankAchievements"));
const Withdrawals = lazy(() => import("./pages/dashboard/Withdrawals"));
const Transactions = lazy(() => import("./pages/dashboard/Transactions"));
const Notifications = lazy(() => import("./pages/dashboard/Notifications"));
const Profile = lazy(() => import("./pages/dashboard/Profile"));
const Help = lazy(() => import("./pages/dashboard/Help"));
const DashboardNotFound = lazy(() => import("./pages/dashboard/NotFound"));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="dashboard" element={<DashboardShell />}>
          <Route index element={<Overview />} />
          <Route path="stake" element={<MyStake />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="team" element={<MyTeam />} />
          <Route path="referrals" element={<DirectReferrals />} />
          <Route path="network" element={<NetworkStructure />} />
          <Route path="ranks" element={<RankAchievements />} />
          <Route path="withdrawals" element={<Withdrawals />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="help" element={<Help />} />
          <Route path="*" element={<DashboardNotFound />} />
        </Route>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="sign-in" element={<SignIn />} />
          <Route path="get-started" element={<GetStarted />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
