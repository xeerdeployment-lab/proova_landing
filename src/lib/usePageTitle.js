import { useEffect } from "react";

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · PROOVA` : "PROOVA — Build Beyond Limits";
  }, [title]);
}
