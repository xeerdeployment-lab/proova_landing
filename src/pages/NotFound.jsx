import Button from "../components/Button";
import PageEnter from "../components/PageEnter";
import usePageTitle from "../lib/usePageTitle";

export default function NotFound() {
  usePageTitle("Page not found");

  return (
    <PageEnter>
      <div className="container-page flex min-h-[70svh] flex-col justify-center py-32">
        <p className="eyebrow">404</p>
        <h1 className="heading-hud mt-6 max-w-xl text-4xl leading-[0.95] sm:text-6xl">
          This page is not part of Axora.
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
