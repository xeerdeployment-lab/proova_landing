import { Link } from "react-router";

const variants = {
  primary: "btn btn-primary",
  secondary: "btn btn-secondary",
  gold: "btn btn-gold",
  ghost: "btn btn-ghost",
  lux: "btn btn-lux",
  glass: "btn btn-glass",
};

const sizes = {
  md: "",
  lg: "btn-lg",
};

export default function Button({
  to,
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const classes = `${variants[variant] ?? variants.primary} ${sizes[size] ?? ""} ${className}`
    .replace(/\s+/g, " ")
    .trim();

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
