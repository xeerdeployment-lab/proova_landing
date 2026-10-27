import { motion, useReducedMotion } from "motion/react";
import { features } from "../data/content";
import { stagger } from "../lib/motion";
import FeatureCard from "./FeatureCard";
import SectionHeading from "./SectionHeading";

export default function WhyAxora() {
  const reduce = useReducedMotion();

  return (
    <section id="features" data-act="features" className="section">
      <div className="container-page">
        <SectionHeading
          eyebrow="Why Axora"
          title={
            <>
              Designed for people who want the <span className="serif-accent text-iris">full picture.</span>
            </>
          }
          description="Four commitments shape the experience. They describe how Axora intends to behave — not what a participant will earn."
        />
        <motion.div
          className="mt-14 grid gap-4 lg:grid-cols-6"
          variants={stagger}
          initial={reduce ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              {...feature}
              index={index}
              className={feature.featured || feature.wide ? "lg:col-span-4" : "lg:col-span-2"}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
