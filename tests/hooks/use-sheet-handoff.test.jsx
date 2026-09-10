import React from "react";
import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListItemButton, ListItemText } from "@mui/material";
import { renderWithProviders } from "../test-utils";
import { CippBottomSheet } from "../../src/components/CippComponents/CippBottomSheet";
import { useSheetHandoff } from "../../src/hooks/use-sheet-handoff";

// A sheet row that closes the sheet and opens another Modal in the same tick leaves two
// Modals in flight; the outgoing Drawer restores scroll lock and aria-hidden on top of the
// overlay that just opened. The handoff waits for the exit before running the action.
const Harness = ({ onAction }) => {
  const [open, setOpen] = React.useState(false);
  const sheet = useSheetHandoff(() => setOpen(false));
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open sheet
      </button>
      <CippBottomSheet
        open={open}
        onClose={sheet.cancel}
        onExited={sheet.handleExited}
        title="Actions"
      >
        <ListItemButton onClick={() => sheet.run(onAction)}>
          <ListItemText primary="Do the thing" />
        </ListItemButton>
      </CippBottomSheet>
    </>
  );
};

describe("useSheetHandoff", () => {
  it("runs the action only after the sheet has finished closing", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderWithProviders(<Harness onAction={onAction} />);

    await user.click(screen.getByRole("button", { name: "Open sheet" }));
    await user.click(await screen.findByText("Do the thing"));

    // the tap closes the sheet immediately, but the action is still parked
    expect(onAction).not.toHaveBeenCalled();

    await waitFor(() => expect(onAction).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("Do the thing")).not.toBeInTheDocument();
  });

  it("drops the parked action when the sheet is dismissed instead", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderWithProviders(<Harness onAction={onAction} />);

    await user.click(screen.getByRole("button", { name: "Open sheet" }));
    await screen.findByText("Do the thing");
    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByText("Do the thing")).not.toBeInTheDocument());
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(onAction).not.toHaveBeenCalled();
  });
});
