import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test-utils";
import { cippPrincipal } from "../mocks/fixtures";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

// jsdom has no width-based matchMedia, so the nav pivot is driven by mocking the hook, and
// MUI's own useMediaQuery answers false there, i.e. the >= md side of the popover's mdDown
// gate. that pairing is the 900-1199 band: nav collapsed, still above md.
const layoutState = vi.hoisted(() => ({ isMobile: false }));
vi.mock("../../src/hooks/use-breakpoint", async (importOriginal) => ({
  ...(await importOriginal()),
  useIsMobileLayout: () => layoutState.isMobile,
}));

// stable identities, a fresh object per call re-renders forever
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
const meResult = vi.hoisted(() => ({
  isSuccess: true,
  isFetching: false,
  isPending: false,
  isError: false,
  data: undefined,
  refetch: () => {},
}));
vi.mock("../../src/api/ApiCall", () => ({
  ApiGetCall: ({ url }) => (url === "/api/me" ? meResult : idle),
  ApiPostCall: () => idle,
  ApiGetCallWithPagination: () => ({ ...idle, fetchNextPage: () => {} }),
}));

import { AccountPopover } from "../../src/layouts/account-popover";

const renderPopover = () => {
  const onThemeSwitch = vi.fn();
  const onOpenSearch = vi.fn();
  renderWithProviders(
    <AccountPopover
      onThemeSwitch={onThemeSwitch}
      onOpenSearch={onOpenSearch}
      paletteMode="light"
    />
  );
  return { onThemeSwitch, onOpenSearch };
};

// avatar fallback glyph for john@contoso.com, the popover's only trigger
const openPopover = async () => userEvent.click(await screen.findByText("J"));

describe("AccountPopover", () => {
  beforeEach(() => {
    layoutState.isMobile = false;
    meResult.data = cippPrincipal(["editor"]);
  });

  it("offers universal search and the theme toggle whenever the top bar hides their icons", async () => {
    layoutState.isMobile = true;
    const { onThemeSwitch, onOpenSearch } = renderPopover();

    await openPopover();
    await userEvent.click(screen.getByText("Universal Search"));
    expect(onOpenSearch).toHaveBeenCalled();

    await openPopover();
    await userEvent.click(screen.getByText("Dark Mode"));
    expect(onThemeSwitch).toHaveBeenCalled();
  });

  it("leaves search and theme to the top bar while it still renders their icons", async () => {
    renderPopover();

    await openPopover();
    expect(screen.queryByText("Universal Search")).toBeNull();
    expect(screen.queryByText("Dark Mode")).toBeNull();
  });

  it("does not repeat the signed-in identity that the trigger is already showing", async () => {
    layoutState.isMobile = true;
    renderPopover();

    await openPopover();
    expect(screen.getAllByText("john@contoso.com")).toHaveLength(1);
  });
});
