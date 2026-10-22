import { motion, useReducedMotion } from "motion/react";
import { Suspense, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { DashboardProvider } from "../../context/DashboardContext";
import { useDashboard } from "../../hooks/useDashboard";
import { ease } from "../../lib/motion";
import SearchDialog from "../navigation/SearchDialog";
import Sidebar from "../navigation/Sidebar";
import Topbar from "../navigation/Topbar";
import { ErrorState, PageSkeleton } from "../ui/States";
import ToastRegion from "../ui/Toast";

function Frame() {
  const { pathname, search } = useLocation();
  const { dataMode, setDataMode } = useDashboard();
  const reduce = useReducedMotion();
  const scroller = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    node.scrollTo({ top: 0 });
    setProgress(0);
  }, [pathname, search]);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return undefined;
    const onScroll = () => {
      const max = node.scrollHeight - node.clientHeight;
      setProgress(max > 0 ? node.scrollTop / max : 0);
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="dash-canvas flex h-screen overflow-hidden text-snow">
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-snow focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-navy"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        {reduce ? null : (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -top-28 right-[-6rem] z-0 h-[26rem] w-[26rem] rounded-full bg-[#7667FF]/10 blur-3xl"
            animate={{ x: [0, -28, 0], y: [0, 32, 0] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <div className="relative z-10 h-0.5 bg-white/5" aria-hidden="true">
          <div className="h-full origin-left bg-gradient-to-r from-royal via-electric to-gold" style={{ transform: `scaleX(${progress})` }} />
        </div>
        <Topbar />
        <main id="dashboard-main" ref={scroller} className="dash-scroll relative z-10 min-h-0 flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-7xl">
            <Suspense fallback={<PageSkeleton />}>
              {dataMode === "loading" ? (
                <PageSkeleton />
              ) : dataMode === "error" ? (
                <ErrorState onRetry={() => setDataMode("sample")} />
              ) : (
                <motion.div
                  key={`${pathname}${search}${dataMode}`}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease }}
                >
                  <Outlet />
                </motion.div>
              )}
            </Suspense>
            <p className="mt-16 max-w-3xl text-xs leading-relaxed text-mist">
              Demo data only. Figures on this dashboard are sample records for the interface. They are not balances, payouts, or confirmed ranks. Earnings are not guaranteed. Stake, withdrawal, and reward outcomes have to be calculated and settled by a backend after the compensation rules are confirmed.
            </p>
          </div>
        </main>
      </div>
      <SearchDialog />
      <ToastRegion />
    </div>
  );
}

export default function DashboardShell() {
  return (
    <DashboardProvider>
      <Frame />
    </DashboardProvider>
  );
}
