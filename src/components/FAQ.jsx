import { ArrowRight, MessageCircleQuestion } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { faqs } from "../data/content";
import { ease, fadeUp, stagger, viewport } from "../lib/motion";
import Button from "./Button";
import SectionHeading from "./SectionHeading";

export default function FAQ() {
  const reduce = useReducedMotion();
  const [openId, setOpenId] = useState(faqs[0].id);
  const baseId = useId();

  return (
    <section id="faq" data-act="details" className="section">
      <div className="container-page grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionHeading
              eyebrow="Questions"
              title={
                <>
                  Ask this before you join <span className="serif-accent text-iris">anything.</span>
                </>
              }
              description="Straight answers about registration, the offer, compensation, withdrawals, and support. Where a detail is unpublished, it stays unpublished."
            />
            <motion.div
              className="panel mt-8 hidden p-6 lg:block"
              variants={fadeUp}
              initial={reduce ? "visible" : "hidden"}
              whileInView="visible"
              viewport={viewport}
            >
              <MessageCircleQuestion size={20} className="text-iris" aria-hidden="true" />
              <p className="mt-4 text-sm leading-relaxed text-mist">
                Have a question that isn’t here? Start with a conversation, not a commitment.
                Nothing on the Get Started page enrolls you.
              </p>
              <Button to="/get-started" variant="glass" className="group mt-5">
                Get Started
                <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
              </Button>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="lg:col-span-7"
          variants={stagger}
          initial={reduce ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {faqs.map((item, index) => (
            <AccordionItem
              key={item.id}
              item={item}
              index={index}
              open={openId === item.id}
              baseId={`${baseId}-${item.id}`}
              onToggle={() => setOpenId((current) => (current === item.id ? "" : item.id))}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function AccordionItem({ item, index, open, baseId, onToggle }) {
  const reduce = useReducedMotion();
  const buttonId = `${baseId}-button`;
  const panelId = `${baseId}-panel`;

  return (
    <motion.div
      variants={fadeUp}
      className={`mb-3 rounded-[1.25rem] border transition-colors duration-300 ${
        open ? "border-iris/30 bg-white/[0.035]" : "border-white/[0.07] bg-white/[0.015] hover:border-white/15"
      }`}
    >
      <h3>
        <button
          id={buttonId}
          type="button"
          className="flex w-full items-center gap-5 px-5 py-5 text-left sm:px-6"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className={`num text-xs font-semibold transition-colors ${open ? "text-iris" : "text-mist"}`}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="flex-1 text-base font-medium tracking-[-0.02em] text-snow sm:text-lg">{item.question}</span>
          <span
            className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
              open ? "border-iris/50 bg-royal/20" : "border-white/10"
            }`}
            aria-hidden="true"
          >
            <span className="absolute h-px w-3 bg-snow" />
            <span
              className={`absolute h-3 w-px bg-snow transition-transform duration-300 motion-reduce:transition-none ${open ? "scale-y-0" : ""}`}
            />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { height: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.4, ease }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl px-5 pb-6 pl-[3.6rem] text-sm leading-relaxed text-mist sm:px-6 sm:pl-[3.85rem] sm:text-base">
              {item.answer}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
