import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@mui/material";
import { renderWithProviders } from "../test-utils";

// jsdom has no width-based matchMedia, so the mobile branch is driven by mocking the hook
const layoutState = vi.hoisted(() => ({ isMobile: false, viewMode: "table" }));
// partial mock: real module spread first, so new exports keep working here
vi.mock("../../src/hooks/use-breakpoint", async (importOriginal) => ({
  ...(await importOriginal()),
  useIsMobileLayout: () => layoutState.isMobile,
  useIsTabletLayout: () => false,
  useTableViewMode: () => layoutState.viewMode,
}));

const routerState = vi.hoisted(() => ({ push: vi.fn(), pathname: "/dashboardv2" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerState.push }),
  usePathname: () => routerState.pathname,
  useSearchParams: () => new URLSearchParams(""),
}));

// Stable identities: a fresh object per call re-renders forever (tests/mocks/api-call.js)
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

import { TabbedLayout } from "../../src/layouts/TabbedLayout";
import { CippPageActionsFab } from "../../src/components/CippComponents/CippPageActionsFab";
import { CippDataTable } from "../../src/components/CippTable/CippDataTable";

const tabOptions = [
  { label: "Overview", path: "/dashboardv2", icon: "Dashboard" },
  { label: "Identity", path: "/dashboardv2/identity", icon: "Person" },
  { label: "Devices", path: "/dashboardv2/devices", icon: "Devices" },
];

const picker = () => screen.getByRole("button", { name: /switch view/i });
const queryPickers = () => screen.queryAllByRole("button", { name: /switch view/i });

// The trigger names the current view and so does its row in the sheet — scope sheet
// assertions to the sheet, or every current-tab query matches twice.
const openPicker = async (user) => {
  await user.click(picker());
  const sheet = await screen.findByText("Views");
  return within(sheet.closest(".MuiDrawer-paper"));
};

describe("TabbedLayout", () => {
  beforeEach(() => {
    layoutState.isMobile = false;
    layoutState.viewMode = "table";
    routerState.push = vi.fn();
    routerState.pathname = "/dashboardv2";
  });

  it("renders a tab bar on desktop and no picker", () => {
    renderWithProviders(
      <TabbedLayout tabOptions={tabOptions}>
        <div>page content</div>
      </TabbedLayout>
    );

    expect(screen.getByRole("tab", { name: /Overview/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Devices/ })).toBeInTheDocument();
    expect(queryPickers()).toHaveLength(0);
  });

  it("replaces the tab bar with a picker in the content flow on mobile", async () => {
    layoutState.isMobile = true;
    const user = userEvent.setup();
    renderWithProviders(
      <TabbedLayout tabOptions={tabOptions}>
        <div>page content</div>
      </TabbedLayout>
    );

    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    // the trigger names where you are; the sheet is where the rest live
    expect(picker()).toHaveAccessibleName("Overview switch view");

    const sheet = await openPicker(user);
    tabOptions.forEach((tab) => expect(sheet.getByText(tab.label)).toBeInTheDocument());
  });

  // pages/index.js re-exports the dashboard, so it renders at "/" while every tab path is
  // /dashboardv2/... — no match meant the trigger fell back to "Views" and the sheet had no
  // check. An aliased route belongs to the tab whose page it re-exports: the first one.
  it("treats an aliased route as the first tab instead of showing no selection", async () => {
    layoutState.isMobile = true;
    routerState.pathname = "/";
    const user = userEvent.setup();
    renderWithProviders(
      <TabbedLayout tabOptions={tabOptions}>
        <div>page content</div>
      </TabbedLayout>
    );

    expect(picker()).toHaveAccessibleName("Overview switch view");

    const sheet = await openPicker(user);
    expect(sheet.getByText("Overview").closest('[role="button"]')).toHaveClass("Mui-selected");

    // and tapping the aliased tab is still a no-op, not a navigation loop
    await user.click(sheet.getByText("Overview"));
    expect(routerState.push).not.toHaveBeenCalled();
  });

  it("navigates when a tab row is tapped, and does nothing for the current tab", async () => {
    layoutState.isMobile = true;
    const user = userEvent.setup();
    renderWithProviders(
      <TabbedLayout tabOptions={tabOptions}>
        <div>page content</div>
      </TabbedLayout>
    );

    let sheet = await openPicker(user);
    await user.click(sheet.getByText("Devices"));
    expect(routerState.push).toHaveBeenCalledWith("/dashboardv2/devices");

    routerState.push = vi.fn();
    sheet = await openPicker(user);
    await user.click(sheet.getByText("Overview"));
    expect(routerState.push).not.toHaveBeenCalled();
  });

  // A single destination is not navigation — View Group and View Device have one tab each and
  // used to get a FAB whose sheet offered the page you were already on.
  it("renders no picker when there is only one destination", () => {
    layoutState.isMobile = true;
    renderWithProviders(
      <TabbedLayout tabOptions={[tabOptions[0]]}>
        <div>page content</div>
      </TabbedLayout>
    );

    expect(queryPickers()).toHaveLength(0);
  });

  it("counts visible tabs, not configured ones, when deciding to render", async () => {
    layoutState.isMobile = true;
    const user = userEvent.setup();
    const gated = [tabOptions[0], { label: "Diagnostics", path: "/x", advanced: true }];

    // one real tab plus one the user's advanced setting hides — nothing to switch between
    const { unmount } = renderWithProviders(
      <TabbedLayout tabOptions={gated}>
        <div>page content</div>
      </TabbedLayout>
    );
    expect(queryPickers()).toHaveLength(0);
    unmount();

    renderWithProviders(
      <TabbedLayout tabOptions={[...tabOptions, { label: "Diagnostics", path: "/x", advanced: true }]}>
        <div>page content</div>
      </TabbedLayout>
    );
    const sheet = await openPicker(user);
    expect(sheet.getByText("Overview")).toBeInTheDocument();
    expect(sheet.queryByText("Diagnostics")).not.toBeInTheDocument();
  });

  // One control, one place, on every tabbed page — never annexing a heading that happens to
  // be nearby on some page types and not others.
  it("draws exactly one picker, in its own row, whatever the page renders", async () => {
    layoutState.isMobile = true;
    layoutState.viewMode = "cards";
    renderWithProviders(
      <TabbedLayout tabOptions={tabOptions}>
        <CippDataTable
          viewMode="cards"
          title="Relationships"
          data={[{ displayName: "Fabrikam Inc" }]}
          simpleColumns={["displayName"]}
        />
      </TabbedLayout>
    );

    await waitFor(() => expect(screen.getByText("Relationships")).toBeInTheDocument());
    expect(queryPickers()).toHaveLength(1);
    // the page's own heading is still a heading, not a control
    expect(picker()).not.toHaveTextContent("Relationships");
  });

  // Destinations used to ride in this sheet. A FAB is for a screen's primary action.
  it("no longer puts destinations in the page FAB", async () => {
    layoutState.isMobile = true;
    const user = userEvent.setup();
    renderWithProviders(
      <TabbedLayout tabOptions={tabOptions}>
        <CippPageActionsFab>
          <Button>Add Variable</Button>
        </CippPageActionsFab>
      </TabbedLayout>
    );

    // the layout adds no FAB of its own any more — this one is the page's, and navigation
    // sits in the content flow beside it
    const fabs = screen.getAllByRole("button", { name: /Page actions/ });
    expect(fabs).toHaveLength(1);
    expect(picker()).toBeInTheDocument();

    // the sheet is a modal, so it aria-hides the page behind it — assert on its contents only
    await user.click(fabs[0]);
    expect(await screen.findByRole("button", { name: "Add Variable" })).toBeInTheDocument();
    expect(screen.queryByText("Identity")).not.toBeInTheDocument();
    expect(screen.queryByText("Devices")).not.toBeInTheDocument();
    expect(screen.queryByText("Views")).not.toBeInTheDocument();
  });

  // The defect the FAB placement caused: the card list claimed the corner during select mode
  // but drew no FAB there, and the layout stood down because the corner was claimed — leaving
  // no way at all to reach the other views until selection ended.
  it("keeps navigation reachable while a card list is in select mode", async () => {
    layoutState.isMobile = true;
    layoutState.viewMode = "cards";
    const user = userEvent.setup();
    renderWithProviders(
      <TabbedLayout tabOptions={tabOptions}>
        <CippDataTable
          viewMode="cards"
          title="Relationships"
          data={[
            { displayName: "Fabrikam Inc", mail: "fabrikam@contoso.com" },
            { displayName: "Northwind Traders", mail: "northwind@contoso.com" },
          ]}
          simpleColumns={["displayName", "mail"]}
          actions={[{ label: "Remove", type: "POST", url: "/api/Exec" }]}
        />
      </TabbedLayout>
    );

    await waitFor(() => expect(queryPickers()).toHaveLength(1));

    await user.click(screen.getByRole("button", { name: /^Select$/ }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^Cancel$/ })).toBeInTheDocument()
    );

    // this is the assertion the FAB placement could not satisfy
    expect(queryPickers()).toHaveLength(1);
    const sheet = await openPicker(user);
    expect(sheet.getByText("Devices")).toBeInTheDocument();
  });
});
