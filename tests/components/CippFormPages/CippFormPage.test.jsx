import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { renderWithProviders } from "../../test-utils";

// jsdom has no width-based matchMedia, so the mobile branch is driven by mocking the hook
const layoutState = vi.hoisted(() => ({ isMobile: false }));
vi.mock("../../../src/hooks/use-breakpoint", async (importOriginal) => ({
  ...(await importOriginal()),
  useIsMobileLayout: () => layoutState.isMobile,
  useIsTabletLayout: () => false,
}));

// Stable identities: CippFormPage has a useEffect keyed on the router object itself that
// resets the form — a fresh object per call re-renders forever (tests/mocks/api-call.js)
const routerState = vi.hoisted(() => {
  const router = { push: () => {}, back: () => {}, query: {} };
  return { push: router.push, pathname: "/cipp/sam-roles", router };
});
vi.mock("next/navigation", () => ({
  useRouter: () => routerState.router,
  usePathname: () => routerState.pathname,
  useSearchParams: () => new URLSearchParams(""),
}));
vi.mock("next/router", () => ({
  useRouter: () => routerState.router,
}));

// Stable identities: a fresh object per call re-renders forever (tests/mocks/api-call.js)
const idle = vi.hoisted(() => ({
  isSuccess: false,
  isFetching: false,
  isPending: false,
  isError: false,
  isIdle: true,
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
import CippFormPage from "../../../src/components/CippFormPages/CippFormPage";

const tabOptions = [
  { label: "SAM App Roles", path: "/cipp/sam-roles" },
  { label: "SSO", path: "/cipp/sso" },
];

const Harness = (formPageProps) => {
  const formControl = useForm({ mode: "onChange" });
  return (
    <TabbedLayout tabOptions={tabOptions}>
      <CippFormPage
        title="SAM App Roles"
        hideBackButton
        hidePageType
        formControl={formControl}
        postUrl="/api/x"
        queryKey="x"
        {...formPageProps}
      >
        <div>form content</div>
      </CippFormPage>
    </TabbedLayout>
  );
};

describe("CippFormPage title vs the mobile tab picker", () => {
  beforeEach(() => {
    layoutState.isMobile = false;
    routerState.pathname = "/cipp/sam-roles";
  });

  // Same defect class as CippPageCard: the picker trigger already says "SAM App Roles"
  // right above this h4, so the page opened with its own name printed twice in a row.
  it("stands its title down when the picker already says it", () => {
    layoutState.isMobile = true;
    renderWithProviders(<Harness />);

    expect(screen.getAllByText("SAM App Roles")).toHaveLength(1);
    expect(
      screen.queryByRole("heading", { level: 4, name: "SAM App Roles" })
    ).not.toBeInTheDocument();
  });

  // With the page-type prefix the rendered text is "Add - SAM App Roles", which is not what
  // the picker says — so it still renders.
  it("keeps a title the prefix makes different", () => {
    layoutState.isMobile = true;
    renderWithProviders(<Harness hidePageType={false} />);

    expect(
      screen.getByRole("heading", { level: 4, name: "Add - SAM App Roles" })
    ).toBeInTheDocument();
  });

  it("keeps its title on desktop", () => {
    renderWithProviders(<Harness />);

    expect(screen.getByRole("heading", { level: 4, name: "SAM App Roles" })).toBeInTheDocument();
  });
});
