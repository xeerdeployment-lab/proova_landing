import { useState } from "react";
import { Link } from "react-router";
import Button from "../components/Button";
import PageEnter from "../components/PageEnter";
import usePageTitle from "../lib/usePageTitle";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignIn() {
  usePageTitle("Sign in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");

  const onSubmit = (event) => {
    event.preventDefault();
    const next = {};
    if (!emailPattern.test(email.trim())) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    setNotice(
      Object.keys(next).length
        ? ""
        : "This preview does not sign anyone in. Your details were not sent. Authentication will be connected when accounts open.",
    );
  };

  return (
    <PageEnter>
      <div className="container-page grid items-center gap-12 pt-32 pb-24 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">Account</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Sign in.</h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-mist sm:text-lg">
            A quiet place for members, once access exists. This screen checks the form only.
            It does not authenticate, and it does not create a session.
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className="glass rounded-[1.75rem] p-6 sm:p-8">
          <div>
            <label htmlFor="sign-in-email" className="text-sm font-medium text-snow">
              Email
            </label>
            <input
              id="sign-in-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "sign-in-email-error" : undefined}
              className="field mt-2"
              placeholder="you@example.com"
            />
            {errors.email ? (
              <p id="sign-in-email-error" role="alert" className="mt-2 text-sm text-[#f3b4b4]">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className="mt-5">
            <label htmlFor="sign-in-password" className="text-sm font-medium text-snow">
              Password
            </label>
            <input
              id="sign-in-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "sign-in-password-error" : undefined}
              className="field mt-2"
              placeholder="At least 8 characters"
            />
            {errors.password ? (
              <p id="sign-in-password-error" role="alert" className="mt-2 text-sm text-[#f3b4b4]">
                {errors.password}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            className="mt-4 text-sm text-mist underline-offset-4 hover:text-snow hover:underline"
            aria-pressed={showPassword}
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? "Hide password" : "Show password"}
          </button>

          {notice ? (
            <p role="status" className="mt-5 rounded-2xl border border-white/10 bg-navy/60 px-4 py-3 text-sm leading-relaxed text-snow">
              {notice}
            </p>
          ) : null}

          <Button type="submit" className="mt-6 w-full">
            Sign in
          </Button>
          <p className="mt-4 text-sm text-mist">
            New to PROOVA?{" "}
            <Link to="/get-started" className="text-snow underline-offset-4 hover:underline">
              Get started
            </Link>
          </p>
          <p className="mt-3 text-sm text-mist">
            <Link to="/dashboard" className="text-snow underline-offset-4 hover:underline">
              Open the member dashboard preview
            </Link>
            . It uses sample records and does not sign you in.
          </p>
        </form>
      </div>
    </PageEnter>
  );
}
