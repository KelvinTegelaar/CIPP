import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test-utils";

// jsdom has no width-based matchMedia, so the mobile branch is driven by mocking the hook
const layoutState = vi.hoisted(() => ({ mdDown: true }));
vi.mock("../../src/hooks/use-breakpoint", () => ({
  useIsMobileLayout: () => layoutState.mdDown,
  useIsTabletLayout: () => false,
  useTableViewMode: () => "table",
}));

vi.mock("next/router", () => ({
  useRouter: () => ({ query: {}, push: vi.fn(), pathname: "/tenant/manage/edit" }),
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/tenant/manage/edit" }));

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
vi.mock("../../src/api/ApiCall", () => ({
  ApiGetCall: () => idle,
  ApiPostCall: () => idle,
  ApiGetCallWithPagination: () => ({ ...idle, fetchNextPage: () => {} }),
}));

import { HeaderedTabbedLayout } from "../../src/layouts/HeaderedTabbedLayout";

const tabOptions = [
  { label: "Edit Tenant", path: "/tenant/manage/edit", icon: "Settings" },
  { label: "Manage Drift", path: "/tenant/manage/drift", icon: "Sync" },
];

const actions = [
  {
    label: "Reset Password",
    type: "POST",
    url: "/api/ExecResetPass",
    confirmText: "Reset the password?",
  },
];

const renderLayout = (props = {}) =>
  renderWithProviders(
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title="Adele Vance"
      actions={actions}
      actionsData={{ id: "u-1", userPrincipalName: "adele@contoso.com" }}
      {...props}
    >
      <div>page content</div>
    </HeaderedTabbedLayout>
  );

describe("HeaderedTabbedLayout mobile header", () => {
  beforeEach(() => {
    layoutState.mdDown = true;
  });

  it("keeps the header Actions menu on desktop and drops it on mobile", async () => {
    renderLayout();
    expect(screen.queryByRole("button", { name: "Actions" })).not.toBeInTheDocument();

    layoutState.mdDown = false;
    renderLayout();
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: "Actions" }).length).toBeGreaterThan(0)
    );
  });

  // The title row's right half is empty below md — that is the slot the picker takes, so
  // navigation costs no vertical space and does not depend on a FAB being on screen.
  it("puts the tab picker in the title row on mobile, and tabs on desktop", async () => {
    renderLayout();
    const picker = screen.getByRole("button", { name: /switch view/i });
    expect(picker).toHaveAccessibleName("Edit Tenant switch view");
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(picker);
    const sheet = within((await screen.findByText("Views")).closest(".MuiDrawer-paper"));
    expect(sheet.getByText("Manage Drift")).toBeInTheDocument();

    layoutState.mdDown = false;
    renderLayout();
    await waitFor(() =>
      expect(screen.getByRole("tab", { name: /Manage Drift/ })).toBeInTheDocument()
    );
  });

  // A FAB is for actions. With none to carry there is nothing to put in the corner.
  it("renders no FAB when the page has no actions", () => {
    renderLayout({ actions: [] });
    expect(screen.queryByRole("button", { name: /Page actions/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /switch view/i })).toBeInTheDocument();
  });

  // The sheet closing and the overlay opening happen in one tick; MUI's modal manager has
  // to settle the unmounting Drawer before the new one registers, or the overlay never
  // becomes interactive.
  it("opens the action's overlay from the sheet and leaves it open", async () => {
    const user = userEvent.setup();
    renderLayout();

    await user.click(screen.getByRole("button", { name: "Page actions" }));
    await user.click(await screen.findByText("Reset Password"));

    // sheet goes away — keepMounted keeps its rows in the DOM, so closed means hidden
    await waitFor(() => expect(screen.getByText("Reset Password")).not.toBeVisible());

    // and the confirmation overlay is present and stays present
    const confirm = await screen.findByText(/Reset the password\?/i, {}, { timeout: 3000 });
    expect(confirm).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(screen.getByText(/Reset the password\?/i)).toBeInTheDocument();
  });
});
