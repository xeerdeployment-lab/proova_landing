import { AlertCircle, Check, ClipboardList, Package, Scale } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { checklist } from "../data/content";
import { ease, fadeUp, stagger, viewport } from "../lib/motion";
import SectionHeading from "./SectionHeading";
import SpotlightCard from "./ui/SpotlightCard";

const flow = [
  { title: "Activity", body: "Work a person actually does." },
  { title: "Value", body: "A real offer, once it is published." },
  { title: "Possible reward", body: "Only if the plan and the work qualify." },
];

export default function Opportunity() {
  const reduce = useReducedMotion();

  return (
    <section id="opportunity" data-act="details" className="section">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SectionHeading
                eyebrow="The opportunity"
                title={
                  <>
                    The business, stated <span className="serif-accent text-iris">before</span> you participate.
                  </>
                }
                description="axora will explain the offer, the requirements, and the earning structure in public. Those details are not invented here."
              />
              <motion.aside
                className="mt-8 flex gap-3 border border-amber-300/30 bg-amber-300/[0.06] p-5 text-sm leading-relaxed text-snow"
                variants={fadeUp}
                initial={reduce ? "visible" : "hidden"}
                whileInView="visible"
                viewport={viewport}
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-300" aria-hidden="true" />
                <span>
                  Earnings are not guaranteed. They depend on actual business activity, customer
                  demand, and the applicable plan terms. A person may participate and earn nothing.
                </span>
              </motion.aside>
            </div>
          </div>

          <motion.div
            className="grid gap-4 lg:col-span-7"
            variants={stagger}
            initial={reduce ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <SpotlightCard as="article" variants={fadeUp} className="panel p-6 sm:p-8">
              <CardKicker icon={Package}>Products and services</CardKicker>
              <h3 className="mt-4 text-2xl font-head font-bold tracking-[-0.01em] text-snow uppercase">To be published</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist sm:text-base">
                Specific products or services have not been named on this site. When they are,
                each one will be described: what it is, who it is for, and what a participant
                receives. Nothing on this page is a product claim.
              </p>
            </SpotlightCard>

            <SpotlightCard as="article" variants={fadeUp} className="panel p-6 sm:p-8">
              <CardKicker icon={ClipboardList}>Participation</CardKicker>
              <h3 className="mt-4 text-2xl font-head font-bold tracking-[-0.01em] text-snow uppercase">Requirements come first</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist sm:text-base">
                Enrollment steps, eligibility, and any fees will be listed in full before a
                person is asked to join. This page is not an offer to enroll.
              </p>
              <motion.ul
                className="mt-6 grid gap-2.5 sm:grid-cols-2"
                variants={stagger}
                initial={reduce ? "visible" : "hidden"}
                whileInView="visible"
                viewport={viewport}
              >
                {checklist.map((item) => (
                  <motion.li
                    key={item}
                    variants={fadeUp}
                    className="flex items-start gap-3 border border-cyan/10 bg-white/[0.02] px-3.5 py-3 text-sm text-snow"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                      <Check size={12} strokeWidth={2.6} aria-hidden="true" />
                    </span>
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </SpotlightCard>

            <SpotlightCard
              as="article"
              id="compensation"
              variants={fadeUp}
              className="panel scroll-mt-32 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(0,229,242,0.16),transparent_60%),#070d13] p-6 sm:p-8"
            >
              <CardKicker icon={Scale}>Compensation plan</CardKicker>
              <h3 className="mt-4 text-2xl font-head font-bold tracking-[-0.01em] text-snow uppercase">
                A schedule, <span className="serif-accent text-iris">not a story.</span>
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-mist sm:text-base">
                The compensation structure will be published as a clear schedule of qualifying
                activity and possible rewards. Until that document exists, axora does not
                describe ranks, percentages, or example payouts. Recruitment alone is not income.
              </p>

              <ol className="mt-7 grid gap-3 md:grid-cols-[1fr_2.5rem_1fr_2.5rem_1fr] md:items-stretch">
                {flow.map((item, index) => (
                  <li key={item.title} className="contents">
                    <motion.div
                      className=" border border-cyan/15 bg-navy/70 p-4"
                      initial={reduce ? false : { opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={viewport}
                      transition={{ duration: 0.6, ease, delay: 0.15 + index * 0.25 }}
                    >
                      <p className="hud-label text-lime">0{index + 1}</p>
                      <p className="mt-1 text-sm font-semibold text-snow">{item.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-mist">{item.body}</p>
                    </motion.div>
                    {index < flow.length - 1 ? (
                      <div className="flex items-center justify-center" aria-hidden="true">
                        <motion.span
                          className="h-6 w-px origin-top bg-gradient-to-b from-iris to-cyan md:h-px md:w-full md:origin-left md:bg-gradient-to-r"
                          initial={reduce ? false : { scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={viewport}
                          transition={{ duration: 0.5, ease, delay: 0.35 + index * 0.25 }}
                        />
                      </div>
                    ) : null}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs leading-relaxed text-mist">
                Illustrative sequence only. This is not a compensation schedule and not an example of earnings.
              </p>
            </SpotlightCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CardKicker({ icon: Icon, children }) {
  return (
    <p className="flex items-center gap-2.5 hud-label text-cyan">
      <span className="flex h-7 w-7 items-center justify-center border border-cyan/15 bg-cyan/[0.03] text-iris">
        <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
      </span>
      {children}
    </p>
  );
}
