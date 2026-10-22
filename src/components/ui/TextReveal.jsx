import { motion, useReducedMotion } from "motion/react";
import { ease } from "../../lib/motion";

/**
 * Word-by-word masked reveal for display headings.
 * `lines` is an array of lines; each line is an array of `{ text, className }` segments.
 */
export default function TextReveal({ lines, as = "h1", className = "", delay = 0, stagger = 0.06 }) {
  const reduce = useReducedMotion();
  const Tag = as;
  let order = 0;

  return (
    <Tag className={className}>
      {lines.map((line, lineIndex) => {
        // A segment marked `keep` reveals as one unit so its words never wrap apart.
        const words = line.flatMap((segment) =>
          (segment.keep ? [segment.text.replace(/ /g, " ")] : segment.text.split(" ")).map((word) => ({
            word,
            className: segment.className ?? "",
          })),
        );
        return (
          <span key={lineIndex} className="block">
            {words.map((item, wordIndex) => {
              const step = order++;
              return (
                <span key={`${item.word}-${wordIndex}`}>
                  <span className="-mx-[0.06em] -mb-[0.14em] inline-block overflow-hidden px-[0.06em] pb-[0.14em] align-bottom">
                    <motion.span
                      className={`inline-block will-change-transform ${item.className}`}
                      initial={reduce ? false : { y: "105%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      transition={{ duration: 0.95, ease, delay: delay + step * stagger }}
                    >
                      {item.word}
                    </motion.span>
                  </span>
                  {wordIndex < words.length - 1 ? " " : null}
                </span>
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
}
