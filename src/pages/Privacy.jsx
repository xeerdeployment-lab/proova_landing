import LegalDocument from "../components/LegalDocument";
import usePageTitle from "../lib/usePageTitle";

export default function Privacy() {
  usePageTitle("Privacy");

  return (
    <LegalDocument title="Privacy Policy">
      <section>
        <h2 className="text-xl font-semibold text-snow">What this draft covers</h2>
        <p className="mt-3">
          This page is a structure for a future privacy notice. It is not the notice of a live
          service. The operating entity, contact for privacy requests, and retention rules will
          be added after legal review.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-snow">This preview site</h2>
        <p className="mt-3">
          The sign-in and get-started forms run in your browser. They do not transmit what you
          type to Axora. Closing or refreshing the page clears those entries. This marketing
          site is not set up to drop advertising or analytics cookies.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-snow">If an account platform launches</h2>
        <p className="mt-3">
          A future notice should say, in plain language, what is collected, why, who receives it,
          how long it is kept, and how a person can access or delete it. That includes account
          details, support messages, and any information required to pay a published reward.
          Those practices are not in effect on this website.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-snow">Contact</h2>
        <p className="mt-3">
          A privacy contact has not been appointed. The address hello@axora.example is a
          placeholder and is not monitored.
        </p>
      </section>
    </LegalDocument>
  );
}
