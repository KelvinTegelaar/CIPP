import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test-utils";
import { useActionsDispatch } from "../../src/hooks/use-actions-dispatch";
import { CippApiDialog } from "../../src/components/CippComponents/CippApiDialog";

// Stable identities: a fresh object per call changes on every render and spins a loop.
// CippApiDialog calls reset() on open, so the post result needs the full shape.
const idlePost = vi.hoisted(() => ({
  mutate: vi.fn(),
  reset: vi.fn(),
  isPending: false,
  isSuccess: false,
  isError: false,
  data: undefined,
  error: null,
}));
const idleGet = vi.hoisted(() => ({
  data: undefined,
  isFetching: false,
  isLoading: false,
  isSuccess: false,
  isError: false,
  refetch: vi.fn(),
}));
const idlePaginated = vi.hoisted(() => ({
  data: undefined,
  isFetching: false,
  isSuccess: false,
  isError: false,
  fetchNextPage: vi.fn(),
  refetch: vi.fn(),
}));
const postOptions = vi.hoisted(() => []);
vi.mock("../../src/api/ApiCall", () => ({
  ApiPostCall: (options) => {
    postOptions.push(options);
    return idlePost;
  },
  ApiGetCall: () => idleGet,
  ApiGetCallWithPagination: () => idlePaginated,
}));

// `dialog` is a fragment holding whichever surface the action needs, so reach past it.
const dialogPropsOf = (dialog) =>
  React.Children.toArray(dialog?.props?.children).find((child) => child?.type === CippApiDialog)
    ?.props;

const Harness = ({ actions, data = { id: "1" }, queryKeys, onDialogProps }) => {
  const { visibleActions, dispatch, dialog } = useActionsDispatch({ actions, data, queryKeys });
  onDialogProps?.(dialogPropsOf(dialog));
  return (
    <>
      {visibleActions.map((action) => (
        <button key={action.label} type="button" onClick={() => dispatch(action)}>
          {action.label}
        </button>
      ))}
      {dialog}
    </>
  );
};

beforeEach(() => {
  idlePost.mutate.mockClear();
  postOptions.length = 0;
});

describe("useActionsDispatch", () => {
  // The hook set ready:true before branching, which mounted CippApiDialog with
  // api.noConfirm true; the dialog's mount effect then auto-submitted into the same
  // customFunction the hook had just called directly.
  it("runs a noConfirm customFunction exactly once per tap", async () => {
    const user = userEvent.setup();
    const customFunction = vi.fn();
    renderWithProviders(
      <Harness actions={[{ label: "Refresh Data", noConfirm: true, customFunction }]} />
    );

    await user.click(screen.getByRole("button", { name: "Refresh Data" }));

    await waitFor(() => expect(customFunction).toHaveBeenCalledTimes(1));
    // and it stays at one — the auto-submit effect must not fire on a later commit
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(customFunction).toHaveBeenCalledTimes(1);
  });

  // The dialog instance was reused and its auto-submit effect keys on
  // [api.noConfirm, api.link], so a repeat of the same action left the deps unchanged and
  // silently did nothing.
  it("runs again when the same action is dispatched twice", async () => {
    const user = userEvent.setup();
    const customFunction = vi.fn();
    renderWithProviders(
      <Harness actions={[{ label: "Refresh Data", noConfirm: true, customFunction }]} />
    );

    await user.click(screen.getByRole("button", { name: "Refresh Data" }));
    await waitFor(() => expect(customFunction).toHaveBeenCalledTimes(1));
    await user.click(screen.getByRole("button", { name: "Refresh Data" }));

    await waitFor(() => expect(customFunction).toHaveBeenCalledTimes(2));
  });

  it("passes the caller's queryKeys through to the dialog", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <Harness
        actions={[{ label: "Edit", type: "POST", url: "/api/Edit" }]}
        queryKeys="Tenant History"
      />
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));

    // The dialog builds its mutation from relatedQueryKeys; without it the invalidation
    // falls back to the hardcoded "Confirmation" title and the page never refreshes.
    await waitFor(() => {
      expect(postOptions.at(-1)?.relatedQueryKeys).toBe("Tenant History");
    });
  });

  // The action was spread last, so any key it happened to carry silently beat the explicit
  // prop — and every unknown key was forwarded onto the DOM by CippApiDialog.
  it("does not let the action object override explicit dialog props", async () => {
    const user = userEvent.setup();
    const props = vi.fn();
    renderWithProviders(
      <Harness
        actions={[{ label: "Edit", type: "POST", url: "/api/Edit", row: "not-the-row" }]}
        data={{ id: "42" }}
        onDialogProps={props}
      />
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));

    await waitFor(() => {
      const last = props.mock.calls.at(-1)?.[0];
      expect(last?.row).toEqual({ id: "42" });
    });
  });

  it("drops the dialog again once it closes", async () => {
    const user = userEvent.setup();
    const props = vi.fn();
    renderWithProviders(
      <Harness actions={[{ label: "Edit", type: "POST", url: "/api/Edit" }]} onDialogProps={props} />
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await waitFor(() => expect(props.mock.calls.at(-1)?.[0]).toBeTruthy());

    await user.keyboard("{Escape}");

    // Left mounted, it holds a live mutation, an API subscription and a form instance for
    // as long as the page lives — and on HeaderedTabbedLayout the page never unmounts.
    await waitFor(() => expect(props.mock.calls.at(-1)?.[0]).toBeUndefined());
  });

  it("hands a customComponent action to that component instead of a confirm dialog", async () => {
    const user = userEvent.setup();
    const customComponent = vi.fn(() => <div data-testid="custom">custom surface</div>);
    renderWithProviders(<Harness actions={[{ label: "Open", customComponent }]} />);

    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(await screen.findByTestId("custom")).toBeInTheDocument();
  });
});
