import React, { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test-utils";
import { useHistoryDismiss } from "../../src/hooks/use-history-dismiss";
import { resetOverlayHistory } from "../../src/utils/overlay-history";

const nextPop = () =>
  new Promise((resolve) => window.addEventListener("popstate", resolve, { once: true }));

// The back gesture is history navigation; jsdom traverses asynchronously, and the resulting
// state update belongs inside act().
const swipeBack = async () => {
  await act(async () => {
    const settled = nextPop();
    window.history.back();
    await settled;
  });
};

const Harness = ({ enabled = true, onClose }) => {
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
    onClose?.();
  };
  useHistoryDismiss(open, close, enabled);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open details
      </button>
      {open && (
        <>
          <div data-testid="overlay">Row details</div>
          <button type="button" onClick={close}>
            Close details
          </button>
        </>
      )}
    </>
  );
};

afterEach(() => {
  resetOverlayHistory();
});

describe("useHistoryDismiss", () => {
  it("dismisses the overlay on a back press instead of navigating the page", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);

    await user.click(screen.getByRole("button", { name: "Open details" }));
    expect(screen.getByTestId("overlay")).toBeInTheDocument();

    await swipeBack();

    expect(screen.queryByTestId("overlay")).not.toBeInTheDocument();
  });

  it("gives the entry back when the overlay closes on its own", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(<Harness onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Open details" }));
    await act(async () => {
      const settled = nextPop();
      await user.click(screen.getByRole("button", { name: "Close details" }));
      await settled;
    });

    // Closed once, by the button — and the history entry went with it, so the next back
    // press is the page's again rather than a dead tap.
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(window.history.state?.__cippOverlay).toBeUndefined();
  });

  it("stays out of history when disabled", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness enabled={false} />);

    await user.click(screen.getByRole("button", { name: "Open details" }));
    // Somewhere to go back to, so the gesture is a real navigation attempt.
    window.history.pushState({}, "");
    await swipeBack();

    // Desktop keeps today's behaviour: back belongs to the router, not the overlay.
    expect(screen.getByTestId("overlay")).toBeInTheDocument();
  });
});
