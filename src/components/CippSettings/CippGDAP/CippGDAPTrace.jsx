import React, { forwardRef, useImperativeHandle, useRef, useMemo } from "react";
import { Security } from "@mui/icons-material";
import { useDialog } from "../../../hooks/use-dialog";
import { CippGDAPTraceDialog } from "./CippGDAPTraceDialog";

/**
 * Trace GDAP dialog: render this and pass a ref; call ref.current.open(row) to open for a tenant row.
 */
export const CippGDAPTrace = forwardRef(function CippGDAPTrace(_, ref) {
  const gdapTraceDialog = useDialog();
  const [gdapTraceRow, setGdapTraceRow] = React.useState(null);

  useImperativeHandle(ref, () => ({
    open(row) {
      setGdapTraceRow(row);
      gdapTraceDialog.handleOpen();
    },
  }));

  const handleClose = () => {
    setGdapTraceRow(null);
  };

  return (
    gdapTraceRow && (
      <CippGDAPTraceDialog
        createDialog={gdapTraceDialog}
        row={gdapTraceRow}
        title={`Trace GDAP Access - ${gdapTraceRow.displayName || gdapTraceRow.defaultDomainName}`}
        onClose={handleClose}
      />
    )
  );
});

/**
 * Hook for using Trace GDAP on a tenants table.
 * Returns ref (pass to <CippGDAPTrace ref={ref} />), traceGdapAction (add to table actions), and CippGDAPTrace.
 */
export function useCippGDAPTrace() {
  const ref = useRef(null);
  const traceGdapAction = useMemo(
    () => ({
      label: "Trace GDAP",
      icon: <Security />,
      noConfirm: true,
      customFunction: (row) => ref.current?.open(row),
      condition: (row) => row.displayName !== "*Partner Tenant",
    }),
    []
  );
  return { ref, traceGdapAction, CippGDAPTrace };
}

export default CippGDAPTrace;
