import React from "react";
import { describe, it, expect } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { Tooltip, Button } from "@mui/material";
import { createTheme } from "../../src/theme";
import { renderWithTheme } from "../test-utils";

// MUI's Tooltip attaches no touchmove and no scroll listener: handleTouchStart arms a 700ms
// timer that opens the tooltip, and only handleTouchEnd schedules the close. A press held
// through a scroll therefore opens one and nothing closes it while the finger is down.
describe("tooltips on touch", () => {
  it("is disabled by default across the app", () => {
    const theme = createTheme({ colorPreset: "orange", contrast: "high", paletteMode: "light" });
    expect(theme.components.MuiTooltip.defaultProps.disableTouchListener).toBe(true);
  });

  // Real timers: MUI arms enterDelay inside the enterTouchDelay callback, and the nested
  // pair does not advance reliably under fake ones — a faked version of this test passed
  // with the fix removed, which is worse than no test.
  it("does not open from a long press", async () => {
    renderWithTheme(
      <Tooltip title="Users in this tenant" enterTouchDelay={50}>
        <Button>Users</Button>
      </Tooltip>
    );

    fireEvent.touchStart(screen.getByRole("button"));
    await new Promise((resolve) => setTimeout(resolve, 400));

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("still opens on hover, where a tooltip belongs", async () => {
    renderWithTheme(
      <Tooltip title="Users in this tenant">
        <Button>Users</Button>
      </Tooltip>
    );

    fireEvent.mouseOver(screen.getByRole("button"));

    expect(await screen.findByRole("tooltip")).toHaveTextContent("Users in this tenant");
  });

  it("lets a site opt back in", async () => {
    renderWithTheme(
      <Tooltip title="What this field does" disableTouchListener={false} enterTouchDelay={0}>
        <Button>Field</Button>
      </Tooltip>
    );

    fireEvent.touchStart(screen.getByRole("button"));

    await waitFor(() => expect(screen.getByRole("tooltip")).toBeInTheDocument());
  });
});
