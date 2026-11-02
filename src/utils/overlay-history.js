/**
 * Makes the phone's back gesture dismiss the topmost overlay instead of leaving the page.
 *
 * A back swipe IS history navigation, so the only way to intercept it is to own a history
 * entry. An overlay that opts in pushes one entry at the SAME url — nothing visible
 * changes — carrying a depth marker; swiping back pops that entry and we close the overlay
 * rather than letting the router move.
 *
 * Two details keep this safe next to Next's pages router:
 *
 *   1. The pushed state CLONES the router's current state (__N/url/as/key) and only adds
 *      the marker. If the user navigates away with an overlay open, our entry is still a
 *      valid route entry, so returning to it renders that page instead of dead-ending on a
 *      state Next refuses to recognise.
 *   2. router.beforePopState() suppresses Next's same-url re-render for pops that are ours.
 *      Without it, closing a drawer would emit route events and reset the scroll position —
 *      a long list would jump back to the top every time you dismissed a row.
 *
 * Module-level rather than per-component because the stack has to be shared: a back press
 * must close the deepest open overlay, whoever rendered it.
 */

const MARKER = "__cippOverlay";

// Entries mirror the history entries we pushed, deepest last.
let stack = [];
// The marker depth of the entry the browser is currently sitting on. Tracked here because
// beforePopState runs after window.history has already moved, so the previous depth is
// otherwise unknowable.
let depth = 0;
// history.back() calls WE made. The resulting popstate must not be mistaken for the user's.
let selfPops = 0;
let installed = false;

const hasWindow = () => typeof window !== "undefined" && typeof window.history !== "undefined";

const readDepth = () => {
  if (!hasWindow()) return 0;
  const value = window.history.state?.[MARKER];
  return typeof value === "number" ? value : 0;
};

const handlePopState = () => {
  const next = readDepth();
  const wasSelfPop = selfPops > 0;
  if (wasSelfPop) selfPops -= 1;
  depth = next;

  // Pop deepest-first: closing bottom-up would briefly leave an overlay covering one that
  // is still open. Entries released by their own component are already gone from the stack,
  // so a self-pop normally finds nothing here.
  const dismissed = [];
  while (stack.length > 0 && stack[stack.length - 1].depth > next) {
    dismissed.push(stack.pop());
  }
  dismissed.forEach((entry) => {
    if (entry.released) return;
    entry.released = true;
    entry.close?.();
  });
};

/**
 * Next calls this from its own popstate listener, before ours. Returning false means "the
 * app handled this" and Next skips the route change entirely.
 */
const shouldNextHandle = (state) => {
  if (selfPops > 0) return false;
  if (stack.length === 0) return true;
  // Not a pop out of an overlay entry — a forward move or an unrelated traversal.
  if (readDepth() >= depth) return true;
  // A real navigation that happens to jump past our entries still belongs to Next.
  const top = stack[stack.length - 1];
  if (state?.as && top.as && state.as !== top.as) return true;
  return false;
};

export const installOverlayHistory = (router) => {
  if (installed || !hasWindow()) return;
  installed = true;
  depth = readDepth();
  window.addEventListener("popstate", handlePopState);
  router?.beforePopState?.(shouldNextHandle);
};

export const pushOverlayEntry = (close) => {
  if (!hasWindow()) return null;
  const entry = {
    depth: readDepth() + 1,
    as: window.history.state?.as,
    close,
    released: false,
  };
  stack.push(entry);
  depth = entry.depth;
  window.history.pushState({ ...window.history.state, [MARKER]: entry.depth }, "");
  return entry;
};

export const releaseOverlayEntry = (entry) => {
  if (!entry || entry.released) return;
  entry.released = true;
  const index = stack.indexOf(entry);
  if (index === -1) return;
  const isTop = index === stack.length - 1;
  stack.splice(index, 1);
  // Only the entry the browser is actually sitting on can be popped. If something was
  // pushed over ours — another overlay, or a route change while we were open — ours is
  // buried: drop it and leave history alone rather than yanking the user backwards.
  if (!isTop || !hasWindow() || readDepth() !== entry.depth) return;
  selfPops += 1;
  depth = entry.depth - 1;
  window.history.back();
};

// Module state outlives a render tree, so tests need a way back to zero.
export const resetOverlayHistory = () => {
  if (hasWindow()) window.removeEventListener("popstate", handlePopState);
  stack = [];
  depth = 0;
  selfPops = 0;
  installed = false;
};
