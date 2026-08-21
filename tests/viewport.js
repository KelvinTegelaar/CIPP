/**
 * Resizes the story iframe, for stories that measure layout or drive a breakpoint.
 *
 * Three things this exists to get right:
 *  - The VIEWPORT has to shrink, not a wrapper element. MUI breakpoints are media queries,
 *    so a 390px-wide Box inside a desktop-width iframe still renders every `md` branch.
 *  - The import has to be lazy. At module scope `@vitest/browser/context` throws
 *    "can be imported only inside the Browser Mode", which breaks the story for anyone who
 *    opens it in the Storybook app rather than the test runner.
 *  - Every story shares one page. A story that shrinks the viewport and never restores it
 *    leaves the next story running at phone width — which is an ordering-dependent failure,
 *    so a desktop story must claim its width rather than assume it.
 *
 * Returns false when there is no runner driving the iframe, so a play function can skip
 * measurements that would otherwise assert against whatever width Storybook happens to use.
 *
 * NOTE: resizing does not synchronously re-render. `useMediaQuery` updates from a matchMedia
 * change listener, i.e. a tick later — so the first assertion that depends on the new
 * breakpoint must be a `findBy*` or wrapped in `waitFor`, never a bare `getBy*`. Verified by
 * probe: right after this resolves, the mobile branch is not in the DOM yet. A preceding
 * `await` on something present in BOTH branches does not settle it — it only makes the race
 * usually go your way, which is how CippWizardPage passed locally and failed in CI.
 */
const resize = async (width, height) => {
  try {
    const { page } = await import("@vitest/browser/context");
    await page.viewport(width, height);
    // Measured: window.innerWidth is ALREADY the new value when this resolves — the width is
    // not what lags. What lags is React: matchMedia listeners fire, useMediaQuery setStates,
    // and the breakpoint branch renders a tick later. A frame here covers the common case; it
    // is not a guarantee, which is why callers must still findBy/waitFor (see below).
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return true;
  } catch {
    return false;
  }
};

export const shrinkToPhoneViewport = async (width = 390, height = 844) => resize(width, height);

export const growToDesktopViewport = async (width = 1280, height = 900) => resize(width, height);
