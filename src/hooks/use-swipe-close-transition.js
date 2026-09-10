import { useCallback, useEffect, useRef } from "react";

// Slide probes the paper's untranslated position when the exit starts (Slide.js
// getTranslateValue), so a paper carrying a drag transform snaps wide open and animates the
// full width out. Re-seed the start position with where the finger let go.
export const useSwipeCloseTransition = (open, onClose) => {
  const paperRef = useRef(null);
  const dragFrom = useRef(null);

  // fires as the open transition starts, so a drag that begins mid-animation still has the node
  const handleEnter = useCallback((node) => {
    paperRef.current = node;
  }, []);

  const handleClose = useCallback(
    (...args) => {
      const transform = paperRef.current?.style.transform;
      dragFrom.current = transform && transform !== "none" ? transform : null;
      onClose?.(...args);
    },
    [onClose]
  );

  // Effects flush child-first, so this lands after Slide's own exit effect, which runs the same
  // probe again. Repairing from the transition's onExit callback gets overwritten by it.
  useEffect(() => {
    const node = paperRef.current;
    const from = dragFrom.current;
    dragFrom.current = null;
    if (open || !node || !from) {
      return;
    }
    const target = node.style.transform;
    const transition = node.style.transition;
    node.style.transition = "none";
    node.style.transform = from;
    node.getBoundingClientRect();
    node.style.transition = transition;
    node.style.transform = target;
  }, [open]);

  return {
    onClose: handleClose,
    transitionProps: { onEnter: handleEnter },
  };
};
