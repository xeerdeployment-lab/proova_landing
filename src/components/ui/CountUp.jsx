import { useCountUp } from "../../hooks/useCountUp";

export default function CountUp({ value, className = "" }) {
  const [ref, shown] = useCountUp(value, { duration: 700 });
  return (
    <span ref={ref} className={`num ${className}`}>
      {shown ?? "—"}
    </span>
  );
}
