import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test-utils";

// jsdom has no width-based matchMedia, so the mobile branch is driven by mocking the hook
const layoutState = vi.hoisted(() => ({ isMobile: false }));
vi.mock("../../../src/hooks/use-breakpoint", () => ({
  useIsMobileLayout: () => layoutState.isMobile,
  useIsTabletLayout: () => false,
  useTableViewMode: () => "table",
}));

// One registration only — ApiCall and ApiCall.jsx resolve to the same module, so a second
// vi.mock for the extensioned path would silently replace this one.
const apiState = vi.hoisted(() => ({ reports: [], refetch: () => {}, reportsResult: null }));
const idlePaginated = vi.hoisted(() => ({
  isSuccess: false,
  isFetching: false,
  isLoading: false,
  isError: false,
  data: undefined,
  fetchNextPage: () => {},
  refetch: () => {},
}));
const idlePost = vi.hoisted(() => ({
  mutate: () => {},
  isPending: false,
  isSuccess: false,
  isError: false,
  reset: () => {},
}));
const idleGet = vi.hoisted(() => ({
  isSuccess: false,
  isFetching: false,
  isLoading: false,
  isError: false,
  data: undefined,
  refetch: () => {},
}));
vi.mock("../../../src/api/ApiCall", () => ({
  // Stable result identity per test: a fresh literal each call loops the autocomplete's
  // option-mapping effect (see tests/mocks/api-call.js).
  ApiGetCall: ({ url }) =>
    url === "/api/ListTestReports" ? apiState.reportsResult : idleGet,
  ApiGetCallWithPagination: () => idlePaginated,
  ApiPostCall: () => idlePost,
}));

const routerState = vi.hoisted(() => ({ push: vi.fn(), query: {} }));
vi.mock("next/router", () => ({
  useRouter: () => ({
    isReady: true,
    pathname: "/dashboardv2",
    query: routerState.query,
    push: routerState.push,
  }),
}));

// The drawer pulls in the whole test-picker form; the toolbar contract under test is only
// "is it open, and with which suite" — so it's stubbed down to those observable facts.
const drawerRenders = vi.hoisted(() => ({ calls: [] }));
vi.mock("../../../src/components/CippComponents/CippAddTestReportDrawer", () => ({
  CippAddTestReportDrawer: (props) => {
    drawerRenders.calls.push(props);
    if (props.hideTrigger) {
      return props.open ? (
        <div data-testid={`drawer-${props.mode ?? "create"}`}>
          {props.reportToEdit?.name ?? "no-report"}
        </div>
      ) : null;
    }
    return <button type="button">{props.buttonText ?? "Create Suite"}</button>;
  },
}));

vi.mock("../../../src/components/CippComponents/CippApiDialog", () => ({
  CippApiDialog: ({ createDialog, title }) =>
    createDialog?.open ? <div data-testid="api-dialog">{title}</div> : null,
}));

import { CippReportToolbar } from "../../../src/components/CippComponents/CippReportToolbar";

const CUSTOM_SUITE = {
  id: "custom-1",
  name: "My Custom Suite",
  description: "custom",
  type: "custom",
  source: "table",
};
const BUILT_IN_SUITE = {
  id: "ztna",
  name: "Zero Trust Network Access Tests",
  description: "built in",
  type: "builtin",
  source: "file",
};

const openActionSheet = async (user) => {
  await user.click(screen.getByRole("button", { name: "Test suite actions" }));
  const heading = await screen.findByText("Test suite actions");
  return within(heading.closest(".MuiDrawer-paper"));
};

describe("CippReportToolbar", () => {
  beforeEach(() => {
    layoutState.isMobile = false;
    apiState.reports = [BUILT_IN_SUITE, CUSTOM_SUITE];
    apiState.refetch = vi.fn();
    apiState.reportsResult = {
      isSuccess: true,
      isFetching: false,
      isLoading: false,
      isError: false,
      data: apiState.reports,
      refetch: apiState.refetch,
    };
    routerState.query = {};
    routerState.push = vi.fn();
    drawerRenders.calls = [];
  });

  it("renders the inline desktop action buttons", () => {
    renderWithProviders(<CippReportToolbar />);

    expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Suite" })).toBeInTheDocument();
    // The selector's inline "Refresh test suites" icon button is desktop-only too
    expect(screen.getByRole("button", { name: "Refresh test suites" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Test suite actions" })).not.toBeInTheDocument();
  });

  it("collapses to a sheet trigger + kebab on mobile — no text input, no keyboard", () => {
    layoutState.isMobile = true;
    routerState.query = { reportId: "ztna" };
    renderWithProviders(<CippReportToolbar />);

    expect(screen.getByRole("button", { name: "Test suite actions" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Refresh" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Refresh test suites" })).not.toBeInTheDocument();
    // the house pick-one pattern: a trigger, not an autocomplete
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /switch test suite/i })).toHaveTextContent(
      "Zero Trust Network Access Tests"
    );
  });

  it("switches suite from the bottom sheet, routing shallowly", async () => {
    layoutState.isMobile = true;
    routerState.query = { reportId: "ztna" };
    const user = userEvent.setup();
    renderWithProviders(<CippReportToolbar />);

    await user.click(screen.getByRole("button", { name: /switch test suite/i }));
    const sheet = within((await screen.findByText("Test suite")).closest(".MuiDrawer-paper"));
    // descriptions ride as secondary text, the current suite is checked
    expect(sheet.getByText("custom")).toBeInTheDocument();
    expect(sheet.getByText("Zero Trust Network Access Tests").closest('[role="button"]')).toHaveClass(
      "Mui-selected"
    );

    await user.click(sheet.getByText("My Custom Suite"));
    await waitFor(() =>
      expect(routerState.push).toHaveBeenCalledWith(
        expect.objectContaining({ query: expect.objectContaining({ reportId: "custom-1" }) }),
        undefined,
        { shallow: true }
      )
    );
  });

  it("offers all five suite actions in the sheet", async () => {
    layoutState.isMobile = true;
    const user = userEvent.setup();
    renderWithProviders(<CippReportToolbar />);

    const sheet = await openActionSheet(user);
    ["Create Suite", "Run Tests", "Edit Suite", "Delete Suite", "Reload suite list"].forEach(
      (label) => expect(sheet.getByText(label)).toBeInTheDocument()
    );
  });

  it("disables Edit and Delete with a visible reason for a built-in suite", async () => {
    layoutState.isMobile = true;
    routerState.query = { reportId: "ztna" };
    const user = userEvent.setup();
    renderWithProviders(<CippReportToolbar />);

    const sheet = await openActionSheet(user);
    expect(sheet.getByText("Built-in test suites cannot be edited")).toBeInTheDocument();
    expect(sheet.getByText("Built-in test suites cannot be deleted")).toBeInTheDocument();
    expect(sheet.getByText("Edit Suite").closest("[role='button']")).toHaveClass("Mui-disabled");
  });

  it("opens the run-tests dialog and keeps it mounted after the sheet closes", async () => {
    layoutState.isMobile = true;
    const user = userEvent.setup();
    renderWithProviders(<CippReportToolbar />);

    const sheet = await openActionSheet(user);
    await user.click(sheet.getByText("Run Tests"));

    expect(await screen.findByTestId("api-dialog")).toHaveTextContent("Refresh Test Data");
    await waitFor(() =>
      expect(screen.queryByText("Test suite actions")).not.toBeInTheDocument()
    );
    expect(screen.getByTestId("api-dialog")).toBeInTheDocument();
  });

  it("opens the edit drawer pre-filled with the selected custom suite", async () => {
    layoutState.isMobile = true;
    routerState.query = { reportId: "custom-1" };
    const user = userEvent.setup();
    renderWithProviders(<CippReportToolbar />);

    const sheet = await openActionSheet(user);
    await user.click(sheet.getByText("Edit Suite"));

    const drawer = await screen.findByTestId("drawer-edit");
    expect(drawer).toHaveTextContent("My Custom Suite");
  });

  it("reloads the suite list from the sheet", async () => {
    layoutState.isMobile = true;
    const user = userEvent.setup();
    renderWithProviders(<CippReportToolbar />);

    const sheet = await openActionSheet(user);
    await user.click(sheet.getByText("Reload suite list"));

    // the sheet hands off on its exit transition, so the call lands a beat later
    await waitFor(() => expect(apiState.refetch).toHaveBeenCalled());
  });
});
