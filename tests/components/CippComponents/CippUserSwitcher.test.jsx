import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test-utils";

const layoutState = vi.hoisted(() => ({ isMobile: false }));
vi.mock("../../../src/hooks/use-breakpoint", async (importOriginal) => ({
  ...(await importOriginal()),
  useIsMobileLayout: () => layoutState.isMobile,
}));

// Stable identities (tests/mocks/api-call.js): fresh objects per call re-render forever
const routerState = vi.hoisted(() => {
  const router = {
    push: () => {},
    pathname: "/identity/administration/users/user",
    query: { userId: "user-1", tenantFilter: "contoso.com" },
  };
  return { router };
});
vi.mock("next/router", () => ({ useRouter: () => routerState.router }));

const apiState = vi.hoisted(() => ({
  result: { isFetching: false, isSuccess: true, data: { Results: [] } },
}));
vi.mock("../../../src/api/ApiCall", () => ({
  ApiGetCall: () => apiState.result,
}));

import { CippUserSwitcher } from "../../../src/components/CippComponents/CippUserSwitcher";

const users = [
  { id: "user-1", displayName: "Ada Lovelace", userPrincipalName: "ada@contoso.com" },
  { id: "user-2", displayName: "Grace Hopper", userPrincipalName: "grace@contoso.com" },
  { id: "user-3", displayName: "Alan Turing", userPrincipalName: "alan@contoso.com" },
];

const renderSwitcher = () =>
  renderWithProviders(
    <CippUserSwitcher title="Ada Lovelace" currentUserId="user-1" tenantFilter="contoso.com" />
  );

describe("CippUserSwitcher", () => {
  beforeEach(() => {
    layoutState.isMobile = false;
    routerState.router.push = vi.fn();
    apiState.result = { isFetching: false, isSuccess: true, data: { Results: users } };
  });

  it("keeps the visible name in the accessible name", () => {
    renderSwitcher();
    expect(
      screen.getByRole("button", { name: /Ada Lovelace switch user/i })
    ).toBeInTheDocument();
  });

  it("switches only the userId, keeping route and tenant", async () => {
    const user = userEvent.setup();
    renderSwitcher();

    await user.click(screen.getByRole("button", { name: /switch user/i }));
    await user.click(await screen.findByText("Grace Hopper"));

    expect(routerState.router.push).toHaveBeenCalledWith({
      pathname: "/identity/administration/users/user",
      query: { userId: "user-2", tenantFilter: "contoso.com" },
    });
  });

  it("treats picking the current user as a no-op", async () => {
    const user = userEvent.setup();
    renderSwitcher();

    await user.click(screen.getByRole("button", { name: /switch user/i }));
    // the popover lists the current user too — pick the row, not the trigger's own text
    const rows = await screen.findAllByText("Ada Lovelace");
    await user.click(rows[rows.length - 1]);

    expect(routerState.router.push).not.toHaveBeenCalled();
  });

  it("filters by name or UPN", async () => {
    const user = userEvent.setup();
    renderSwitcher();

    await user.click(screen.getByRole("button", { name: /switch user/i }));
    await user.type(await screen.findByPlaceholderText(/search users/i), "alan@");

    const list = screen.getByRole("list");
    expect(within(list).getByText("Alan Turing")).toBeInTheDocument();
    expect(within(list).queryByText("Grace Hopper")).not.toBeInTheDocument();
  });

  it("uses the bottom sheet on mobile", async () => {
    layoutState.isMobile = true;
    const user = userEvent.setup();
    renderSwitcher();

    await user.click(screen.getByRole("button", { name: /switch user/i }));
    const sheet = (await screen.findByText("Grace Hopper")).closest(".MuiDrawer-paper");
    expect(sheet).not.toBeNull();
  });
});
