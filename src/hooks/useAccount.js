import { useCallback, useEffect, useRef, useState } from "react";
import { newIdempotencyKey } from "../services/api";
import { useDashboard } from "./useDashboard";

/** The loaded member account. Pages render inside the shell's gate, so it is always present. */
export function useAccount() {
  return useDashboard().account;
}

/** Server-aligned clock for countdowns. The server still decides; this only drives the display. */
export function useServerNow(tickMs = 1_000) {
  const { serverNow } = useDashboard();
  const [now, setNow] = useState(serverNow);
  useEffect(() => {
    const id = window.setInterval(() => setNow(serverNow()), tickMs);
    return () => window.clearInterval(id);
  }, [serverNow, tickMs]);
  return now;
}

/**
 * Runs a money-moving request. One idempotency key is held for an attempt — including retries after
 * a network failure — so a double click or a resend can never create a second record.
 */
export function useMutation(request) {
  const { applyAccount } = useDashboard();
  const [state, setState] = useState({ status: "idle", result: null, error: null });
  const key = useRef(null);
  const busy = useRef(false);

  const submit = useCallback(
    async (args = {}) => {
      if (busy.current) return null;
      busy.current = true;
      key.current ??= newIdempotencyKey();
      setState({ status: "submitting", result: null, error: null });
      try {
        const result = await request({ ...args, idempotencyKey: key.current });
        applyAccount(result.account);
        setState({ status: "success", result, error: null });
        key.current = null;
        return result;
      } catch (error) {
        if (error.code !== "network") key.current = null;
        setState({ status: "error", result: null, error });
        return null;
      } finally {
        busy.current = false;
      }
    },
    [applyAccount, request],
  );

  const reset = useCallback(() => {
    key.current = null;
    setState({ status: "idle", result: null, error: null });
  }, []);

  return { ...state, submit, reset, submitting: state.status === "submitting" };
}
