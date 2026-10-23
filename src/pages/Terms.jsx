import LegalDocument from "../components/LegalDocument";
import usePageTitle from "../lib/usePageTitle";

export default function Terms() {
  usePageTitle("Terms");

  return (
    <LegalDocument title="Terms and Conditions">
      <section>
        <h2 className="text-xl font-semibold text-snow">Status of these terms</h2>
        <p className="mt-3">
          This is a draft layout for counsel to replace. It is not a contract, and using the
          preview does not create an account, a distributorship, or any right to a reward.
          Governing law and the operating entity will be named before launch.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-snow">What the site is</h2>
        <p className="mt-3">
          Axora’s public site introduces a community business opportunity. It is information.
          It is not an offer of employment, an investment, or a promise of income. Products,
          services, fees, and the compensation plan will be published before participation opens.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-snow">Earnings</h2>
        <p className="mt-3">
          Earnings are not guaranteed. Any future reward depends on individual effort, customer
          demand, the official plan, and applicable law. Examples of income are not shown because
          none have been verified for publication.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-snow">Acceptable use</h2>
        <p className="mt-3">
          Do not present this preview as a live enrollment system, do not invent compensation
          terms, and do not claim results the site does not state. A future member agreement
          should set the rules for how the opportunity may be described.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-snow">Contact</h2>
        <p className="mt-3">
          Legal notices cannot be served through hello@axora.example. That address is a
          placeholder and is not monitored.
        </p>
      </section>
    </LegalDocument>
  );
}
