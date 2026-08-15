import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  installOverlayHistory,
  pushOverlayEntry,
  releaseOverlayEntry,
  resetOverlayHistory,
} from "../../src/utils/overlay-history";

// The shape Next's pages router keeps in history.state for the current route.
const routeState = (as) => ({ __N: true, url: as, as, key: `key-${as}`, options: {} });

// jsdom traverses asynchronously, same as a browser: back() queues the task and popstate
// lands later. Every assertion about a back press has to wait for it.
const nextPop = () =>
  new Promise((resolve) => window.addEventListener("popstate", resolve, { once: true }));

const goBack = async () => {
  const settled = nextPop();
  window.history.back();
  await settled;
};

// A browser fires a single popstate for a multi-entry jump, e.g. the long-press back menu.
const goTo = async (delta) => {
  const settled = nextPop();
  window.history.go(delta);
  await settled;
};

beforeEach(() => {
  window.history.replaceState(routeState("/identity/users"), "");
});

afterEach(() => {
  resetOverlayHistory();
});

describe("overlay history", () => {
  it("closes the overlay on a back press instead of letting the page navigate", async () => {
    const close = vi.fn();
    const url = window.location.href;
    installOverlayHistory();
    pushOverlayEntry(close);

    // The entry sits at the same url — nothing about the page changed.
    expect(window.location.href).toBe(url);
    await goBack();

    expect(close).toHaveBeenCalledTimes(1);
  });

  it("keeps the pushed entry recognisable to Next's router", () => {
    installOverlayHistory();
    pushOverlayEntry(vi.fn());

    // Cloning the router's own state is what makes this entry survive a navigation away and
    // back: Next ignores any history entry without __N, and would leave the app on a blank
    // route if it landed on one.
    expect(window.history.state.__N).toBe(true);
    expect(window.history.state.as).toBe("/identity/users");
  });

  it("dismisses one overlay per back press, deepest first", async () => {
    const closeOuter = vi.fn();
    const closeInner = vi.fn();
    installOverlayHistory();
    pushOverlayEntry(closeOuter);
    pushOverlayEntry(closeInner);

    await goBack();
    expect(closeInner).toHaveBeenCalledTimes(1);
    expect(closeOuter).not.toHaveBeenCalled();

    await goBack();
    expect(closeOuter).toHaveBeenCalledTimes(1);
  });

  it("takes its history entry back when the overlay is closed by hand", async () => {
    const close = vi.fn();
    installOverlayHistory();
    const entry = pushOverlayEntry(close);

    const settled = nextPop();
    releaseOverlayEntry(entry);
    await settled;

    // The component closed itself, so the callback must not fire again — and the entry is
    // gone, so the user's next back press belongs to the page.
    expect(close).not.toHaveBeenCalled();
    expect(window.history.state.__cippOverlay).toBeUndefined();
  });

  it("leaves history alone when its entry has been buried by a navigation", () => {
    const back = vi.spyOn(window.history, "back");
    const close = vi.fn();
    installOverlayHistory();
    const entry = pushOverlayEntry(close);

    // A link inside the overlay navigated: Next pushed a route entry over ours.
    window.history.pushState(routeState("/identity/users/user"), "");
    releaseOverlayEntry(entry);

    // Popping here would drag the user back off the page they just opened.
    expect(back).not.toHaveBeenCalled();
    back.mockRestore();
  });
});

describe("overlay history / Next router handoff", () => {
  // Next's own popstate listener is registered at app boot, before ours, and calls
  // beforePopState from inside it. Registering this listener before installOverlayHistory
  // reproduces that ordering — which matters, because the answer depends on state our
  // listener is about to overwrite.
  const withRouter = () => {
    const answers = [];
    let handler = null;
    const listener = (event) => {
      if (handler) answers.push(handler(event.state));
    };
    window.addEventListener("popstate", listener);
    installOverlayHistory({
      beforePopState: (cb) => {
        handler = cb;
      },
    });
    return {
      answers,
      teardown: () => window.removeEventListener("popstate", listener),
    };
  };

  it("stops Next from re-rendering the route when the pop was ours", async () => {
    const router = withRouter();
    pushOverlayEntry(vi.fn());

    await goBack();

    // false means "handled downstream". Letting Next through would emit route events and
    // reset scroll — a long list would jump to the top every time a row was dismissed.
    expect(router.answers).toEqual([false]);
    router.teardown();
  });

  it("leaves ordinary back presses to Next", async () => {
    const router = withRouter();
    window.history.pushState(routeState("/identity/users"), "");

    await goBack();

    expect(router.answers).toEqual([true]);
    router.teardown();
  });

  it("leaves a real navigation to Next even with an overlay open", async () => {
    window.history.replaceState(routeState("/identity/devices"), "");
    window.history.pushState(routeState("/identity/users"), "");
    const router = withRouter();
    const close = vi.fn();
    pushOverlayEntry(close);

    // The long-press back menu jumps straight past our entry to another route. That pop
    // lands on a different page, so Next has to run — and the overlay closes with the page
    // it belonged to.
    await goTo(-2);

    expect(router.answers).toEqual([true]);
    expect(close).toHaveBeenCalledTimes(1);
    router.teardown();
  });
});
