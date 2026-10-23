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
      <motion.header
        data-scrolled={condensed}
        className="nav-shell fixed inset-x-0 top-0 z-50"
        initial={reduce ? false : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.1 }}
      >
        <div className="mx-auto flex h-16 w-full max-w-[86rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/#top" aria-label="PROOVA home" className="relative z-10 shrink-0">
            <Logo tagline="Community Network" />
          </Link>

          <nav className="hidden h-full items-center xl:flex" aria-label="Primary">
            {navLinks.map((link) => {
              const current = active === link.id;
              return (
                <Link
                  key={link.id}
                  to={link.to}
                  aria-current={current ? "true" : undefined}
                  className={`hud-label relative flex h-full items-center px-3.5 text-[0.68rem] whitespace-nowrap transition-colors duration-300 ${
                    current ? "text-cyan" : "text-mist hover:text-snow"
                  }`}
                >
                  {current ? (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-3 bottom-0 h-[2px] bg-gradient-to-r from-cyan to-lime shadow-[0_0_12px_rgba(0,229,242,0.8)]"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 whitespace-nowrap xl:flex">
            <span className="hud-label mr-2 hidden items-center gap-2 text-[0.6rem] text-mist 2xl:flex">
              <span className="status-dot pulse-dot" aria-hidden="true" />
              Preview build
            </span>
            <Link to="/sign-in" className="hud-label px-3 py-2 text-[0.68rem] text-mist transition-colors hover:text-cyan">
              Sign In
            </Link>
            <Button to="/get-started" variant="lux" className="group">
              Get Started
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
            </Button>
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <span className="hidden min-[440px]:inline-flex">
              <Button to="/get-started" variant="lux" className="btn-sm whitespace-nowrap">
                Get Started
              </Button>
            </span>
            <button
              type="button"
              className="relative z-10 inline-flex h-11 w-11 items-center justify-center border border-cyan/30 bg-cyan/[0.05] text-cyan xl:hidden"
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
        </div>
      </motion.header>

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
            <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
            <nav className="relative flex flex-col" aria-label="Mobile">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.id}
                  initial={reduce ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: reduce ? 0 : 0.05 + index * 0.05, ease }}
                  className="border-b border-cyan/10"
                >
                  <Link
                    to={link.to}
                    className="flex items-center justify-between py-4 font-head text-[1.6rem] font-semibold tracking-[-0.01em] text-snow uppercase transition-colors hover:text-cyan"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="hud-label text-cyan">0{index + 1}</span>
                      {link.label}
                    </span>
                    <ArrowUpRight size={18} className="text-cyan/70" aria-hidden="true" />
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
