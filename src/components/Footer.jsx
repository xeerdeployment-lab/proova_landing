import { Link } from "react-router";
import { navLinks } from "../data/content";
import { dashboardNav } from "../data/navigation";
import Logo from "./Logo";

const socials = ["LinkedIn", "Instagram", "X", "YouTube"];
const year = new Date().getFullYear();
const platformLinks = dashboardNav.filter((item) =>
  ["/dashboard", "/dashboard/network", "/dashboard/transactions", "/dashboard/withdrawals", "/dashboard/help"].includes(item.to),
);

export default function Footer() {
  return (
    <footer className="relative z-10 overflow-hidden border-t border-cyan/15 bg-ink">
      <div aria-hidden="true" className="hairline absolute inset-x-0 top-0" />
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 pt-20 pb-12 sm:px-8 md:grid-cols-12">
        <div className="md:col-span-4">
          <Link to="/#top" aria-label="PROOVA home" className="inline-flex">
            <Logo tagline="Community Network" />
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-mist">
            A premium introduction to a community business opportunity. Read the model
            before you participate. Earnings are not guaranteed.
          </p>
          <p className="mt-8 hud-label text-cyan">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-mist">
            <li>Email: hello@proova.example</li>
            <li>Phone: to be announced</li>
            <li>Address: to be announced</li>
          </ul>
        </div>

        <FooterColumn title="Explore" className="md:col-span-2 md:col-start-6">
          {navLinks.map((link) => (
            <FooterLink key={link.id} to={link.to}>
              {link.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Platform" className="md:col-span-2">
          {platformLinks.map((item) => (
            <FooterLink key={item.to} to={item.to}>
              {item.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Account" className="md:col-span-2">
          <FooterLink to="/get-started">Get Started</FooterLink>
          <FooterLink to="/sign-in">Sign In</FooterLink>
          <FooterLink to="/privacy">Privacy Policy</FooterLink>
          <FooterLink to="/terms">Terms and Conditions</FooterLink>
        </FooterColumn>

        <div className="md:col-span-12">
          <p className="hud-label text-cyan">Social</p>
          <ul className="mt-3 flex flex-wrap items-center gap-2">
            {socials.map((name) => (
              <li key={name}>
                <span className="hud-label inline-flex border border-cyan/15 px-3 py-1.5 text-[0.6rem] text-mist">
                  {name}
                  <span className="sr-only"> — profile link pending launch</span>
                </span>
              </li>
            ))}
            <li className="text-xs text-mist/80 sm:ml-2">Profile links will be added at launch.</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cyan/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-6 sm:px-8 md:flex-row md:items-start md:justify-between">
          <p className="max-w-3xl text-xs leading-relaxed text-mist">
            PROOVA presents a community-based business opportunity. Earnings are not guaranteed
            and depend on individual effort, market conditions, and the official plan terms.
            This website is an introduction. It is not an offer of employment, an investment,
            or a promise of income. Products, compensation, and legal details will be published
            before participation opens. Contact details using the .example domain are placeholders.
          </p>
          <p className="shrink-0 text-xs text-mist/80">© {year} PROOVA. All rights reserved.</p>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="wordmark pointer-events-none -mb-[0.18em] text-center text-[clamp(5rem,22vw,19rem)] select-none"
      >
        PROOVA
      </p>
    </footer>
  );
}

function FooterColumn({ title, className = "", children }) {
  return (
    <nav aria-label={title} className={className}>
      <p className="hud-label text-cyan">{title}</p>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </nav>
  );
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="group inline-flex items-center text-sm text-mist transition-colors duration-300 hover:text-cyan"
      >
        <span className="h-px w-0 bg-lime transition-all duration-300 group-hover:mr-1.5 group-hover:w-3 motion-reduce:transition-none" aria-hidden="true" />
        {children}
      </Link>
    </li>
  );
}
