import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useState } from "react";
import { Link, useLocation } from "react-router";
import { navLinks } from "../data/content";
import { ease } from "../lib/motion";
import Button from "./Button";
import Logo from "./Logo";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(() => window.scrollY > 24);
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState("top");
  const reduce = useReducedMotion();
  const location = useLocation();
  const menuId = useId();
  const routeKey = `${location.pathname}${location.hash}`;
  const [routeSeen, setRouteSeen] = useState(routeKey);
  const active = location.pathname === "/" ? section : "";
  const condensed = scrolled || open;

  if (routeSeen !== routeKey) {
    setRouteSeen(routeKey);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 24;
      setScrolled((current) => (current === next ? current : next));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (location.pathname !== "/") return undefined;

    const ids = ["top", ...navLinks.map((link) => link.id)];
    const nodes = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!nodes.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setSection(visible.target.id);
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0, 0.15, 0.4] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
        <motion.div
          className={`mx-auto flex h-14 w-full max-w-6xl items-center justify-between rounded-full border pr-2 pl-4 transition-[background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:h-16 sm:pl-5 ${
            condensed
              ? "border-white/10 bg-ink/70 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
              : "border-transparent bg-transparent"
          }`}
          initial={reduce ? false : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <Link to="/#top" aria-label="PROOVA home" className="relative z-10 rounded-full">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
            {navLinks.map((link) => {
              const current = active === link.id;
              return (
                <Link
                  key={link.id}
                  to={link.to}
                  aria-current={current ? "true" : undefined}
                  className={`relative isolate rounded-full px-3.5 py-2 text-sm whitespace-nowrap transition-colors duration-300 ${
                    current ? "text-snow" : "text-mist hover:text-snow"
                  }`}
                >
                  {current ? (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full border border-white/10 bg-white/[0.06]"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-1 whitespace-nowrap xl:flex">
            <Button to="/dashboard" variant="ghost" className="hidden text-mist 2xl:inline-flex" aria-label="Open the member dashboard preview">
              Preview
            </Button>
            <Button to="/sign-in" variant="ghost" className="text-mist">
              Sign In
            </Button>
            <Button to="/get-started" variant="lux" className="group">
              Get Started
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
            </Button>
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <Button to="/get-started" variant="lux" className="btn-sm hidden whitespace-nowrap sm:inline-flex">
              Get Started
            </Button>
            <button
              type="button"
              className="relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-snow xl:hidden"
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((value) => !value)}
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={open ? "close" : "open"}
                  initial={reduce ? false : { opacity: 0, rotate: -45, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, rotate: 45, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex"
                >
                  {open ? <X size={18} /> : <Menu size={18} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </motion.div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={menuId}
            className="fixed inset-0 z-40 overflow-y-auto bg-ink/95 px-5 pt-24 pb-10 backdrop-blur-xl xl:hidden"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease }}
          >
            <div aria-hidden="true" className="orb pointer-events-none absolute -top-40 -right-40 h-96 w-96 opacity-40" />
            <nav className="relative flex flex-col" aria-label="Mobile">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.id}
                  initial={reduce ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: reduce ? 0 : 0.05 + index * 0.05, ease }}
                  className="border-b border-white/[0.07]"
                >
                  <Link
                    to={link.to}
                    className="flex items-center justify-between py-4 text-[1.75rem] font-medium tracking-[-0.04em] text-snow"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="text-xs font-semibold tracking-[0.18em] text-mist">0{index + 1}</span>
                      {link.label}
                    </span>
                    <ArrowUpRight size={18} className="text-mist" aria-hidden="true" />
                  </Link>
                </motion.div>
              ))}
            </nav>
            <motion.div
              className="relative mt-8 grid gap-3"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: reduce ? 0 : 0.35, ease }}
            >
              <Button to="/get-started" variant="lux" size="lg">
                Get Started
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button to="/sign-in" variant="glass">
                  Sign In
                </Button>
                <Button to="/dashboard" variant="glass">
                  Dashboard preview
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
