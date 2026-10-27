import { useCountUp } from "../../hooks/useCountUp";
import { formatCents } from "../../lib/money";

export default function MoneyFigure({ cents, className = "" }) {
  const [ref, value] = useCountUp(cents);
  return (
    <span ref={ref} className={`num ${className}`}>
      {formatCents(value)}
    </span>
  );
}
