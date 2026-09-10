import { useCallback, useRef } from "react";

/**
 * Hands a bottom sheet off to the overlay it launches.
 *
 * A sheet row that closes the sheet and opens a drawer/dialog in the same tick puts two
 * MUI Modals in flight at once: the new one registers with the modal manager while the
 * outgoing Drawer is still transitioning, and when that Drawer finally unmounts it
 * restores scroll lock, focus and aria-hidden on top of the overlay that just opened —
 * which reads as the overlay refusing to open, or opening dead.
 *
 * Instead, park the callback and run it from the sheet's exit transition:
 *
 *   const sheet = useSheetHandoff(() => setOpen(false));
 *   <ListItemButton onClick={() => sheet.run(() => setDrawerOpen(true))} />
 *   <CippBottomSheet open={open} onClose={sheet.close} onExited={sheet.handleExited} />
 *
 * `run` still closes the sheet immediately, so the tap feels the same.
 */
// Drawer's exit is ~195ms; well past it the sheet is gone whether or not the transition
// reported in. Running late beats never running, and flush() is idempotent.
const EXIT_FALLBACK_MS = 400;

export const useSheetHandoff = (close) => {
  const pendingRef = useRef(null);
  const fallbackRef = useRef(null);

  const flush = useCallback(() => {
    if (fallbackRef.current) {
      clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }
    const pending = pendingRef.current;
    pendingRef.current = null;
    pending?.();
  }, []);

  const run = useCallback(
    (fn) => {
      pendingRef.current = typeof fn === "function" ? fn : null;
      if (fallbackRef.current) clearTimeout(fallbackRef.current);
      fallbackRef.current = setTimeout(flush, EXIT_FALLBACK_MS);
      close?.();
    },
    [close, flush]
  );

  // Dismissed without picking anything — drop whatever was parked.
  const cancel = useCallback(() => {
    pendingRef.current = null;
    if (fallbackRef.current) {
      clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }
    close?.();
  }, [close]);

  return { run, handleExited: flush, cancel };
};
