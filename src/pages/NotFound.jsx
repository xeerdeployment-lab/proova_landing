import Button from "../components/Button";
import PageEnter from "../components/PageEnter";
import usePageTitle from "../lib/usePageTitle";

export default function NotFound() {
  usePageTitle("Page not found");

  return (
    <PageEnter>
      <div className="container-page flex min-h-[70svh] flex-col justify-center py-32">
        <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">404</p>
        <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
          This page is not part of PROOVA.
        </h1>
        <p className="mt-5 max-w-md text-mist">The link may be outdated. The introduction is still on the homepage.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button to="/#top">Back home</Button>
          <Button to="/get-started" variant="secondary">
            Get started
          </Button>
        </div>
      </div>
    </PageEnter>
  );
}
