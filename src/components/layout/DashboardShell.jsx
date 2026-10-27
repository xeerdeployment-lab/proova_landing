import { FlaskConical } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Suspense, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router";
import { DashboardProvider } from "../../context/DashboardContext";
import { useDashboard } from "../../hooks/useDashboard";
import { ease } from "../../lib/motion";
import MobileNav from "../navigation/MobileNav";
import SearchDialog from "../navigation/SearchDialog";
import Sidebar from "../navigation/Sidebar";
import Topbar from "../navigation/Topbar";
import { ErrorState, OfflineState, PageSkeleton } from "../ui/States";
import ToastRegion from "../ui/Toast";

function DemoBanner() {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-warning/25 bg-warning/[0.06] px-4 py-3 text-sm" role="note">
      <FlaskConical size={16} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
      <p className="leading-relaxed text-mist">
        <span className="font-semibold text-warning">Demo data · development build.</span> No member API is configured, so this dashboard runs on a local
        development ledger. Every balance, reward and transaction is generated test data. Production builds never show it.
      </p>
    </div>
  );
}

function Frame() {
  const { pathname } = useLocation();
  const { status, error, retry, source } = useDashboard();
  const reduce = useReducedMotion();
  const scroller = useRef(null);
  const bar = useRef(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return undefined;
    // Written straight to the bar so scrolling never re-renders the shell.
    let frame = 0;
    const paint = () => {
      frame = 0;
      const max = node.scrollHeight - node.clientHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? node.scrollTop / max : 0})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      node.removeEventListener("scroll", onScroll);
    };
  }, []);

  let body;
  if (status === "loading") body = <PageSkeleton />;
  else if (status === "offline") body = <OfflineState />;
  else if (status === "error") body = <ErrorState body={error?.message} onRetry={retry} />;
  else {
    body = (
      <motion.div key={pathname} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
        <Outlet />
      </motion.div>
    );
  }

  return (
    <div className="dash-canvas flex h-dvh overflow-hidden text-snow">
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-snow focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-navy"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="relative z-50 h-0.5 bg-white/5" aria-hidden="true">
          <div className="h-full origin-left bg-gradient-to-r from-teal via-accent to-mint" ref={bar} style={{ transform: "scaleX(0)" }} />
        </div>
        <Topbar />
        <main
          id="dashboard-main"
          ref={scroller}
          className="dash-scroll relative z-10 min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pt-5 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-6 sm:pt-6 lg:px-10 lg:pt-8 lg:pb-12"
        >
          <div className="mx-auto w-full max-w-7xl">
            {source === "demo" && status === "ready" ? <DemoBanner /> : null}
            <Suspense fallback={<PageSkeleton />}>{body}</Suspense>
            <p className="mt-16 max-w-3xl text-xs leading-relaxed text-mist/80">
              Staking involves risk and rewards are not guaranteed. Every amount is settled by the Axora backend; previews on this dashboard use the
              same configured plan rules but are not a commitment until the server confirms them.
            </p>
          </div>
        </main>
      </div>
      <MobileNav />
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
