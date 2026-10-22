import { Link } from "react-router";
import usePageTitle from "../../lib/usePageTitle";

export default function DashboardNotFound() {
  usePageTitle("Page not found");
  return (
    <div className="dash-card p-8">
      <p className="text-xs font-semibold tracking-[0.16em] text-gold uppercase">Dashboard</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">That page is not in the preview.</h2>
      <Link to="/dashboard" className="btn btn-primary mt-6">
        Back to overview
      </Link>
    </div>
  );
}
