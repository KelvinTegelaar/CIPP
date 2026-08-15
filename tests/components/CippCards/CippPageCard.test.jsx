import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils";

// jsdom has no width-based matchMedia, so the mobile branch is driven by mocking the hook
const layoutState = vi.hoisted(() => ({ isMobile: false }));
vi.mock("../../../src/hooks/use-breakpoint", async (importOriginal) => ({
  ...(await importOriginal()),
  useIsMobileLayout: () => layoutState.isMobile,
  useIsTabletLayout: () => false,
}));

const routerState = vi.hoisted(() => ({ push: vi.fn(), pathname: "/cipp/roles" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerState.push }),
  usePathname: () => routerState.pathname,
  useSearchParams: () => new URLSearchParams(""),
}));
vi.mock("next/router", () => ({
  useRouter: () => ({ push: routerState.push, back: vi.fn() }),
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
vi.mock("../../../src/api/ApiCall", () => ({
  ApiGetCall: () => idle,
  ApiPostCall: () => idle,
  ApiGetCallWithPagination: () => ({ ...idle, fetchNextPage: () => {} }),
}));

import { TabbedLayout } from "../../../src/layouts/TabbedLayout";
import CippPageCard from "../../../src/components/CippCards/CippPageCard";

const tabOptions = [
  { label: "CIPP Roles", path: "/cipp/roles" },
  { label: "CIPP Users", path: "/cipp/users" },
];

const renderPage = (title) =>
  renderWithProviders(
    <TabbedLayout tabOptions={tabOptions}>
      <CippPageCard title={title} hideBackButton>
        <div>page content</div>
      </CippPageCard>
    </TabbedLayout>
  );

describe("CippPageCard title vs the mobile tab picker", () => {
  beforeEach(() => {
    layoutState.isMobile = false;
    routerState.pathname = "/cipp/roles";
  });

  // The picker trigger wears the current tab's label in heading clothes right above the
  // page header — a page titled the same printed "CIPP Roles" twice in a row on a phone.
  it("stands its title down when the picker already says it", () => {
    layoutState.isMobile = true;
    renderPage("CIPP Roles");

    // once: the picker trigger (whose label is itself an h6 — query the page h4 by level)
    expect(screen.getAllByText("CIPP Roles")).toHaveLength(1);
    expect(screen.getByRole("button", { name: /CIPP Roles switch view/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 4, name: "CIPP Roles" })).not.toBeInTheDocument();
  });

  it("keeps a title the picker does not carry", () => {
    layoutState.isMobile = true;
    renderPage("Edit Role: limited");

    expect(
      screen.getByRole("heading", { level: 4, name: "Edit Role: limited" })
    ).toBeInTheDocument();
  });

  it("keeps its title on desktop, where tabs look like navigation", () => {
    renderPage("CIPP Roles");

    expect(screen.getByRole("heading", { level: 4, name: "CIPP Roles" })).toBeInTheDocument();
  });
});
