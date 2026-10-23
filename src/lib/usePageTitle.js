import { useEffect } from "react";

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · proova` : "proova — Build Beyond Limits";
  }, [title]);
}
