import { useCallback, useState } from "react";
import { CippApiDialog } from "../components/CippComponents/CippApiDialog";
import { useDialog } from "./use-dialog";
import { useSettings } from "./use-settings";

const IDLE = { data: {}, action: {}, ready: false };

/**
 * Shared dispatch for a page-level `actions` array.
 *
 * The desktop ActionsMenu and the mobile page-actions sheet present the same actions two
 * ways; keeping the confirm-vs-run decision and the dialog wiring here is what stops the
 * two presentations from drifting apart.
 *
 * Note the state is per-instance: two mounted consumers get two dispatchers, so this shares
 * the decision, not an in-flight dialog.
 */
export const useActionsDispatch = ({ actions = [], data, queryKeys }) => {
  const [actionData, setActionData] = useState(IDLE);
  const [customAction, setCustomAction] = useState(null);
  const createDialog = useDialog();
  const settings = useSettings();

  // Nullsafety for data: it can be undefined (still loading) or null (no data)
  const isDisabled = (action) => {
    if (!data) return true;
    if (action?.condition) return !action.condition(data);
    return false;
  };

  const visibleActions = actions?.filter((action) => !action.link || action.showInActionsMenu) ?? [];

  const dispatch = (action) => {
    // An AllTenants row carries its own tenant; posting under "AllTenants" would target the
    // wrong one. Page-level data has no Tenant, so this is a no-op there.
    if (settings?.currentTenant === "AllTenants" && data?.Tenant) {
      settings.handleUpdate({ currentTenant: data.Tenant });
    }

    // Run-and-return paths must NOT set ready: doing so mounts CippApiDialog with
    // api.noConfirm true, and its mount effect auto-submits into the very customFunction
    // just called here — one tap, two invocations.
    if (action?.noConfirm && action.customFunction) {
      action.customFunction(data, action, {});
      return;
    }
    if (typeof action?.customComponent === "function") {
      setCustomAction({ data, action });
      return;
    }

    setActionData({ data, action, ready: true });
    createDialog.handleOpen();
  };

  // Dropped once the close transition finishes rather than on close, so the dialog keeps its
  // exit animation. Leaving it mounted would hold a live mutation, an API subscription and a
  // form instance for the life of the page — and HeaderedTabbedLayout never unmounts.
  const handleExited = useCallback(() => setActionData(IDLE), []);

  const dialog = (
    <>
      {actionData.ready && (
        <CippApiDialog
          // Keyed so consecutive actions get a fresh instance: the auto-submit effect keys
          // on [api.noConfirm, api.link], which would not re-fire for a repeat otherwise.
          key={actionData.action?.label}
          // Spread first so the structural props below cannot be replaced by an action that
          // happens to carry a `row` or `createDialog` key. Spread last, they were, and
          // every unrecognised key also rode CippApiDialog's ...other onto the DOM node.
          {...actionData.action}
          createDialog={createDialog}
          api={actionData.action}
          row={actionData.data}
          // These two keep the action's own value winning, which is what the old spread-last
          // ordering gave them — only the structural props above change hands.
          title={actionData.action?.title ?? "Confirmation"}
          relatedQueryKeys={actionData.action?.relatedQueryKeys ?? queryKeys}
          slotProps={{ transition: { onExited: handleExited } }}
        />
      )}
      {customAction?.action?.customComponent(customAction.data, {
        drawerVisible: Boolean(customAction),
        setDrawerVisible: (visible) => !visible && setCustomAction(null),
        fromRowAction: false,
      })}
    </>
  );

  return { visibleActions, isDisabled, dispatch, dialog };
};
