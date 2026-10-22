import { useDashboard } from "./useDashboard";

export default function useCopy() {
  const { pushToast } = useDashboard();

  return async (text, label = "Copied to the clipboard.") => {
    try {
      await navigator.clipboard.writeText(text);
      pushToast({ title: "Copied", body: label });
      return true;
    } catch {
      pushToast({
        title: "Could not copy",
        body: "Select the text and copy it manually.",
        tone: "error",
      });
      return false;
    }
  };
}
