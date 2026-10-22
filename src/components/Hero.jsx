import { ArrowRight, BadgeCheck, CircleDashed, FileText, GitBranch, ShieldCheck, Tag } from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useMemo, useRef } from "react";
import { Link } from "react-router";
import { heroAssurances } from "../data/content";
import { getDemoModel } from "../data/demoData";
import { dashboardNav } from "../data/navigation";
import { ease } from "../lib/motion";
import Button from "./Button";
import { GrowthBars, LedgerRows, MiniTree, MockStat, WindowFrame } from "./landing/MockupParts";
import Magnetic from "./ui/Magnetic";
import ParticleField from "./ui/ParticleField";
import StatusBadge from "./ui/StatusBadge";
import TextReveal from "./ui/TextReveal";

const assuranceIcons = { ShieldCheck, FileText, Tag };

const headline = [
  [{ text: "Build" }, { text: "beyond", className: "serif-accent text-spectrum pr-[0.04em]" }, { text: "limits," }],
  [{ text: "with every term" }, { text: "in view.", keep: true, className: "serif-accent text-snow/90" }],
];

export default function Hero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const model = useMemo(() => getDemoModel(), []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const pointerX = useSpring(useMotionValue(0), { stiffness: 90, damping: 20 });
  const pointerY = useSpring(useMotionValue(0), { stiffness: 90, damping: 20 });

  // The preview starts tilted back and settles flat as the visitor scrolls into it.
  const scrollTilt = useTransform(scrollYProgress, [0, 0.45], [reduce ? 0 : 16, 0]);
  const rotateX = useTransform([scrollTilt, pointerY], ([tilt, py]) => tilt - py * 4);
  const rotateY = useTransform(pointerX, (px) => px * 5);
  const scale = useTransform(scrollYProgress, [0, 0.45], [reduce ? 1 : 0.94, 1]);
  const floatNear = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -120]);
  const floatFar = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 160]);

  const onPointerMove = (event) => {
    if (reduce || event.pointerType !== "mouse") return;
    const node = sectionRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    node.style.setProperty("--mx", `${x}px`);
    node.style.setProperty("--my", `${y}px`);
    pointerX.set(x / rect.width - 0.5);
    pointerY.set(y / rect.height - 0.5);
  };

  const onPointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const { snapshot } = model;
  const pending = model.breakdown.find((item) => !item.calculated);

  return (
    <section
      id="top"
      ref={sectionRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative isolate scroll-mt-28 overflow-hidden bg-ink pt-32 pb-20 sm:pt-40 md:pb-28"
    >
      {/* Ambient layers */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 opacity-70" />
        <motion.div
          style={{ y: glowY }}
          className="orb absolute top-[-14rem] left-1/2 h-[46rem] w-[46rem] -translate-x-1/2 opacity-80 sm:h-[60rem] sm:w-[60rem]"
        />
        <div className="cursor-light absolute inset-0 hidden md:block" />
        <ParticleField />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-navy" />
        <div className="bg-noise absolute inset-0" />
      </div>

      <div className="container-page relative text-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <Link
            to="/dashboard"
            className="group inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pr-3 pl-1.5 text-xs text-mist backdrop-blur transition-colors duration-300 hover:border-iris/40 hover:text-snow"
          >
            <span className="rounded-full bg-gradient-to-r from-royal to-electric px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.14em] text-white uppercase">
              Preview
            </span>
            Explore the member dashboard
            <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
          </Link>
        </motion.div>

        <TextReveal
          lines={headline}
          delay={0.15}
          className="mx-auto mt-8 max-w-6xl text-[clamp(2.6rem,7.4vw,6.4rem)] leading-[0.95] font-semibold tracking-[-0.055em] text-snow"
        />

        <motion.p
          className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-mist sm:text-lg"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.75 }}
        >
          PROOVA is a community business platform built around clarity — a precise member
          dashboard for your stake, network, and ledger, and a plan you can read before you
          participate. Progress depends on your activity. Income is never guaranteed.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.9 }}
        >
          <Magnetic className="justify-center">
            <Button to="/get-started" variant="lux" size="lg" className="group w-full sm:w-auto">
              Get Started
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
            </Button>
          </Magnetic>
          <Magnetic className="justify-center">
            <Button to="/#platform" variant="glass" size="lg" className="w-full sm:w-auto">
              Explore Platform
            </Button>
          </Magnetic>
        </motion.div>

        <motion.ul
          className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease, delay: 1.1 }}
          aria-label="Platform commitments"
        >
          {heroAssurances.map((item) => {
            const Icon = assuranceIcons[item.icon] ?? ShieldCheck;
            return (
              <li key={item.label} className="flex items-center gap-2 text-sm text-mist">
                <Icon size={15} strokeWidth={1.7} className="text-iris" aria-hidden="true" />
                {item.label}
              </li>
            );
          })}
        </motion.ul>
      </div>

      {/* Product preview */}
      <div className="container-page relative mt-16 sm:mt-20" style={{ perspective: "1600px" }}>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease, delay: 0.55 }}
        >
          <motion.div
            style={reduce ? undefined : { rotateX, rotateY, scale, transformStyle: "preserve-3d" }}
            className="relative mx-auto max-w-5xl will-change-transform"
          >
            <div aria-hidden="true" className="absolute -inset-x-10 -top-10 -bottom-16 -z-10 rounded-[3rem] bg-royal/20 blur-3xl" />
            <div className="beam rounded-[1.4rem] shadow-float">
              <DashboardPreview model={model} />
            </div>
          </motion.div>

          {/* Floating cards */}
          <motion.div
            style={{ y: floatNear }}
            className="absolute -top-10 left-0 z-10 hidden w-56 lg:block xl:-left-6"
          >
            <FloatCard delay={1.2} icon={BadgeCheck} kicker="Verification">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-snow">REF-4410</span>
                <StatusBadge status="verified" />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-mist">Every record shows its verification state.</p>
            </FloatCard>
          </motion.div>

          <motion.div
            style={{ y: floatFar }}
            className="absolute right-0 -bottom-6 z-10 hidden w-60 lg:block xl:-right-6"
          >
            <FloatCard delay={1.35} icon={GitBranch} kicker="Network">
              <p className="text-sm font-medium text-snow">
                {snapshot.directReferrals} directs · {snapshot.downlineCount} in downline
              </p>
              <p className="mt-2 text-xs leading-relaxed text-mist">Relationships, not payouts.</p>
            </FloatCard>
          </motion.div>

          {pending ? (
            <motion.div
              style={{ y: floatNear }}
              className="absolute -bottom-8 left-[6%] z-10 hidden w-64 md:block lg:left-[10%]"
            >
              <FloatCard delay={1.5} icon={CircleDashed} kicker="Transparency">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-snow">Unconfirmed rules</span>
                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[0.66rem] font-semibold text-mist">
                    Not calculated
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-mist">Waiting on a confirmed rule — never estimated.</p>
              </FloatCard>
            </motion.div>
          ) : null}
        </motion.div>

        <p className="mx-auto mt-8 max-w-md text-center text-xs leading-relaxed text-mist/80 md:mt-20">
          Interface preview built from the dashboard’s sample records. Not member activity and
          not an example of earnings.
        </p>
      </div>
    </section>
  );
}

function FloatCard({ icon: Icon, kicker, children, delay }) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease, delay }}
    >
      <div className="glass float-b rounded-2xl p-4 text-left">
        <p className="flex items-center gap-2 text-[0.62rem] font-semibold tracking-[0.18em] text-gold uppercase">
          <Icon size={13} strokeWidth={1.8} aria-hidden="true" />
          {kicker}
        </p>
        <div className="mt-3">{children}</div>
      </div>
    </motion.article>
  );
}

function DashboardPreview({ model }) {
  const { snapshot } = model;
  const sideItems = dashboardNav.slice(0, 8);

  return (
    <WindowFrame path="Member dashboard · Overview" className="text-left">
      <div className="flex">
        <aside className="hidden w-14 shrink-0 flex-col items-center gap-2 border-r border-white/[0.06] py-4 sm:flex" aria-hidden="true">
          {sideItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <span
                key={item.to}
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  index === 0 ? "bg-royal/20 text-iris shadow-[inset_0_0_0_1px_rgba(165,160,255,0.25)]" : "text-mist/70"
                }`}
              >
                <Icon size={16} strokeWidth={1.7} />
              </span>
            );
          })}
        </aside>

        <div className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[0.62rem] font-semibold tracking-[0.2em] text-electric uppercase">Member overview</p>
              <p className="font-display mt-1.5 text-2xl text-snow sm:text-3xl">
                Welcome back, <span className="italic">{model.member.displayName}</span>
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[0.68rem] text-mist">
              Referral ID <span className="ml-1 font-medium text-snow">{model.member.referralId}</span>
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-3">
            <MockStat label="Directs" value={snapshot.directReferrals} hint="Sample records" />
            <MockStat label="Team" value={snapshot.teamMembers} hint="Upline + downline" />
            <MockStat label="Verified" value={snapshot.verifiedRecords} hint="Of sample records" accent="text-success" />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-5">
            <div className="tile p-4 md:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-snow">Network tree</p>
                <span className="text-[0.62rem] text-mist">{snapshot.downlineCount + 1} nodes</span>
              </div>
              <MiniTree root={model.networkRoot} delay={1.1} className="mt-3" />
            </div>
            <div className="tile hidden p-4 sm:block md:col-span-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-snow">Recent ledger</p>
                <span className="text-[0.62rem] text-mist">Category · status</span>
              </div>
              <div className="mt-1">
                <LedgerRows rows={model.transactions.slice(0, 3)} delay={1.2} />
              </div>
            </div>
          </div>

          <div className="tile mt-3 hidden p-4 md:block">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-snow">Team growth by week</p>
              <span className="text-[0.62rem] text-mist">Joins in the sample network</span>
            </div>
            <div className="mt-3">
              <GrowthBars growth={model.growth} delay={1.3} />
            </div>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}
