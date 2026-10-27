import { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import { DashboardNotFound, DashboardShell, dashboardPages, NotFound, publicPages } from "./routes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="dashboard"
          element={
            <Suspense fallback={<div className="dash-canvas h-dvh" />}>
              <DashboardShell />
            </Suspense>
          }
        >
          {Object.entries(dashboardPages).map(([path, Page]) =>
            path ? <Route key={path} path={path} element={<Page />} /> : <Route key="index" index element={<Page />} />,
          )}
          <Route path="network" element={<Navigate to="/dashboard/team" replace />} />
          <Route path="*" element={<DashboardNotFound />} />
        </Route>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          {Object.entries(publicPages).map(([path, Page]) => (
            <Route key={path} path={path} element={<Page />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
