import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import Footer from "./Footer";
import Navbar from "./Navbar";
import ScrollProgress from "./ScrollProgress";
import StageBackdrop from "./stage/StageBackdrop";

export default function Layout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = reduce ? "auto" : "smooth";

    if (hash) {
      const id = hash.slice(1);
      const scrollToHash = () => {
        const target = document.getElementById(id);
        if (!target) return false;
        target.scrollIntoView({ behavior, block: "start" });
        return true;
      };
      if (!scrollToHash()) {
        requestAnimationFrame(() => {
          if (!scrollToHash()) window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        });
      }
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-navy text-snow">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-full focus:bg-snow focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-navy"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Navbar />
      {pathname === "/" ? <StageBackdrop /> : null}
      <main id="main" className="relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
