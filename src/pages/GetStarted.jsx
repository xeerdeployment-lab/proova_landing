import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import Button from "../components/Button";
import PageEnter from "../components/PageEnter";
import usePageTitle from "../lib/usePageTitle";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const interests = [
  "Learning the model",
  "The community",
  "Future participation",
  "Something else",
];

const initial = { name: "", email: "", interest: "", note: "" };

export default function GetStarted() {
  usePageTitle("Get started");
  const [params] = useSearchParams();
  const referralCode = params.get("ref") ?? "";
  const referralPreview = /^[A-Za-z0-9-]{1,32}$/.test(referralCode) ? referralCode : "";
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  const update = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const next = {};
    if (values.name.trim().length < 2) next.name = "Enter your name.";
    if (!emailPattern.test(values.email.trim())) next.email = "Enter a valid email address.";
    if (!values.interest) next.interest = "Choose what you want to explore.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setDone(true);
  };

  return (
    <PageEnter>
      <div className="container-page grid items-center gap-12 pt-32 pb-24 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Introduction</p>
          <h1 className="heading-hud mt-6 text-4xl leading-[0.95] sm:text-6xl">
            Start with a conversation, not a commitment.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-mist sm:text-lg">
            Tell us what you want to understand. This preview keeps everything in the browser.
            Nothing is transmitted, and submitting it does not enroll you.
          </p>
          {referralPreview ? (
            <p className="mt-6 max-w-md border border-amber-300/30 bg-amber-300/[0.06] px-4 py-3 text-sm leading-relaxed text-snow">
              Referral preview code <span className="font-semibold">{referralPreview}</span>. This page still does not submit or enroll anyone.
            </p>
          ) : null}
          <p className="mt-6 text-sm text-mist">
            Prefer to read first?{" "}
            <Link to="/#opportunity" className="text-snow underline-offset-4 hover:underline">
              Explore the opportunity
            </Link>
          </p>
        </div>

        {done ? (
          <div role="status" className="glass p-6 sm:p-8">
            <p className="hud-label text-cyan">Preview only</p>
            <h2 className="heading-hud mt-3 text-3xl">Nothing was sent.</h2>
            <p className="mt-4 text-sm leading-relaxed text-mist sm:text-base">
              The form accepted your entries locally so you can see the path. PROOVA did not
              receive them, and no account was created. When registration opens, this step will
              say so plainly — including any cost — before you join.
            </p>
            <Button
              className="mt-6"
              onClick={() => {
                setValues(initial);
                setDone(false);
              }}
            >
              Start again
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="glass p-6 sm:p-8">
            <div>
              <label htmlFor="start-name" className="text-sm font-medium text-snow">
                Full name
              </label>
              <input
                id="start-name"
                name="name"
                autoComplete="name"
                value={values.name}
                onChange={update("name")}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "start-name-error" : undefined}
                className="field mt-2"
                placeholder="Your name"
              />
              {errors.name ? (
                <p id="start-name-error" role="alert" className="mt-2 text-sm text-[#f3b4b4]">
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div className="mt-5">
              <label htmlFor="start-email" className="text-sm font-medium text-snow">
                Email
              </label>
              <input
                id="start-email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={update("email")}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "start-email-error" : undefined}
                className="field mt-2"
                placeholder="you@example.com"
              />
              {errors.email ? (
                <p id="start-email-error" role="alert" className="mt-2 text-sm text-[#f3b4b4]">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="mt-5">
              <label htmlFor="start-interest" className="text-sm font-medium text-snow">
                What do you want to explore?
              </label>
              <select
                id="start-interest"
                name="interest"
                value={values.interest}
                onChange={update("interest")}
                aria-invalid={Boolean(errors.interest)}
                aria-describedby={errors.interest ? "start-interest-error" : undefined}
                className="field mt-2"
              >
                <option value="">Select one</option>
                {interests.map((interest) => (
                  <option key={interest} value={interest}>
                    {interest}
                  </option>
                ))}
              </select>
              {errors.interest ? (
                <p id="start-interest-error" role="alert" className="mt-2 text-sm text-[#f3b4b4]">
                  {errors.interest}
                </p>
              ) : null}
            </div>

            <div className="mt-5">
              <label htmlFor="start-note" className="text-sm font-medium text-snow">
                Note <span className="text-mist">(optional)</span>
              </label>
              <textarea
                id="start-note"
                name="note"
                rows={4}
                value={values.note}
                onChange={update("note")}
                className="field mt-2 resize-y"
                placeholder="A question you want answered before you decide"
              />
            </div>

            <Button type="submit" className="mt-6 w-full">
              Continue
            </Button>
            <p className="mt-4 text-xs leading-relaxed text-mist">
              Preview only. This does not create an account, collect a fee, or promise income.
            </p>
          </form>
        )}
      </div>
    </PageEnter>
  );
}
