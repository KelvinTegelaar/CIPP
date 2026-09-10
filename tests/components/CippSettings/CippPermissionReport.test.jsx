import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test-utils";

// jsdom has no width-based matchMedia, so the mobile branch is driven by mocking the hook
const layoutState = vi.hoisted(() => ({ isMobile: false }));
vi.mock("../../../src/hooks/use-breakpoint", async (importOriginal) => ({
  ...(await importOriginal()),
  useIsMobileLayout: () => layoutState.isMobile,
}));

// Stable identities — a fresh object per call re-renders forever
const idle = vi.hoisted(() => ({
  isSuccess: false,
  isFetching: false,
  isPending: false,
  isError: false,
  data: undefined,
  mutate: () => {},
  reset: () => {},
  refetch: () => {},
}));
vi.mock("../../../src/api/ApiCall", () => ({
  ApiGetCall: () => idle,
  ApiPostCall: () => idle,
  ApiGetCallWithPagination: () => ({ ...idle, fetchNextPage: () => {} }),
}));

import { CippPermissionReport } from "../../../src/components/CippSettings/CippPermissionReport";

const renderReport = () =>
  renderWithProviders(<CippPermissionReport importReport={false} setImportReport={() => {}} />);

describe("CippPermissionReport report actions", () => {
  beforeEach(() => {
    layoutState.isMobile = false;
  });

  it("keeps the button row inline on desktop, with no FAB", () => {
    renderReport();
    expect(screen.getByRole("button", { name: /export report/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /page actions/i })).not.toBeInTheDocument();
  });

  // Three contained buttons stacked full-width at 390px read as a banner wall before any
  // content — page-level utilities belong in the page-actions FAB sheet on mobile.
  it("moves the buttons into the FAB sheet on mobile", async () => {
    layoutState.isMobile = true;
    const user = userEvent.setup();
    renderReport();

    const fab = screen.getByRole("button", { name: /page actions/i });
    // not on the page until the sheet opens
    expect(screen.queryByRole("button", { name: /export report/i })).not.toBeInTheDocument();

    await user.click(fab);
    expect(await screen.findByText("Report")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /export report/i })).toBeInTheDocument();
    expect(screen.getByText(/import report/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /paste report/i })).toBeInTheDocument();

    // uniform with every other sheet action: list rows, not contained buttons in a sheet
    expect(document.querySelector(".MuiDrawer-paper .MuiButton-contained")).toBeNull();
    expect(
      screen.getByRole("button", { name: /export report/i }).classList.contains("MuiListItemButton-root")
    ).toBe(true);
  });

  // The sheet sits at modal + 1 — if a row tap didn't close it, the export dialog would
  // open UNDERNEATH it. ListItemButton is a div[role=button], which the close selector
  // originally missed.
  it("closes the sheet when a row opens its dialog", async () => {
    layoutState.isMobile = true;
    const user = userEvent.setup();
    renderReport();

    await user.click(screen.getByRole("button", { name: /page actions/i }));
    const exportRow = await screen.findByRole("button", { name: /export report/i });
    await user.click(exportRow);

    // keepMounted keeps rows in the DOM; closed means hidden
    await vi.waitFor(() => expect(screen.getByText(/paste report/i)).not.toBeVisible());
  });
});
