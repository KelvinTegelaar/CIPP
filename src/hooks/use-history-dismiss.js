import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import {
  installOverlayHistory,
  pushOverlayEntry,
  releaseOverlayEntry,
} from "../utils/overlay-history";

/**
 * Gives an overlay a history entry of its own, so a phone's back gesture dismisses it
 * instead of navigating the page away.
 *
 *   useHistoryDismiss(visible, onClose, isMobile);
 *
 * The entry is pushed while the overlay is open and popped when it closes for any other
 * reason, so the history stack is only ever as deep as what is actually on screen.
 *
 * Currently used by full-screen mobile surfaces (CippOffCanvas), not bottom sheets: the
 * release pops synchronously, and the FAB sheet closes itself in the same tick as the
 * drawer its child opens, which would let the queued back() take the drawer's entry with
 * it. Registering sheets means deferring the pop so the incoming overlay can reuse the
 * outgoing one's entry.
 */
export const useHistoryDismiss = (open, onClose, enabled = true) => {
  const router = useRouter();
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    // Nothing to hand the gesture to — an overlay with no onClose can't be dismissed, and
    // claiming a history entry for it would only eat a back press.
    if (!enabled || !open || typeof closeRef.current !== "function") return undefined;
    installOverlayHistory(router);
    const entry = pushOverlayEntry(() => closeRef.current?.());
    return () => releaseOverlayEntry(entry);
  }, [enabled, open, router]);
};
