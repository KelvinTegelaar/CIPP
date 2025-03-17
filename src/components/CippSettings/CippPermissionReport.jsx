import { Button, Stack, SvgIcon, Tooltip } from "@mui/material";
import { Close, ContentPasteGo, FileDownload, FileUpload } from "@mui/icons-material";
import { ApiGetCall } from "../../api/ApiCall";
import { useDialog } from "../../hooks/use-dialog";
import { CippApiDialog } from "../CippComponents/CippApiDialog";
import { useState } from "react";

export const CippPermissionReport = (props) => {
  const { importReport, setImportReport } = props;
  const [importError, setImportError] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const createDialog = useDialog();
  const permissionReport = ApiGetCall({
    url: "/api/ExecAccessChecks",
    data: { Type: "Permissions" },
    queryKey: "ExecAccessChecks-Permissions",
    waiting: false,
  });

  const gdapReport = ApiGetCall({
    url: "/api/ExecAccessChecks",
    data: { Type: "GDAP" },
    queryKey: "ExecAccessChecks-GDAP",
    waiting: false,
  });

  const tenantReport = ApiGetCall({
    url: "/api/ExecAccessChecks",
    data: { Type: "Tenants" },
    queryKey: "ExecAccessChecks-Tenants",
    waiting: false,
  });

  const redactString = (str) => {
    const isGuid =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
    if (isGuid) {
      const parts = str.split("-");
      return parts
        .map((part, index) => (index === parts.length - 1 ? part : "*".repeat(part.length)))
        .join("-");
    } else {
      if (typeof str !== "string") return str;
      if (str.length <= 9) return "*".repeat(str.length);
      const start = str.slice(0, 3);
      const end = str.slice(-3);
      const middle = "*".repeat(6);
      return `${start}${middle}${end}`;
    }
  };

  const handleExportReport = (row, action, formData) => {
    permissionReport.waiting = true;
    gdapReport.waiting = true;
    tenantReport.waiting = true;
    const report = {
      Permissions: permissionReport?.data,
      GDAP: gdapReport?.data,
      Tenants: tenantReport?.data,
    };

    const customerProps = [
      "AppId",
      "CustomerId",
      "Tenant",
      "TenantName",
      "TenantId",
      "DisplayName",
      "DefaultDomainName",
      "UserPrincipalName",
      "IPAddress",
      "GDAPRoles",
    ];

    if (formData.redactCustomerData) {
      report.Tenants.Results = report?.Tenants?.Results?.map((tenant) => {
        customerProps.forEach((prop) => {
          if (tenant?.[prop]) {
            if (prop === "GDAPRoles") {
              tenant[prop] = tenant[prop].map((role) => {
                if (Array.isArray(role?.Group)) {
                  role.Group = role.Group.map((group) => group?.split("@")[0]);
                } else if (role?.Group) {
                  role.Group = role.Group.split("@")[0];
                }
                return role;
              });
            } else {
              tenant[prop] = redactString(tenant[prop]);
            }
          }
        });
        return tenant;
      });

      report?.GDAP?.Results?.GDAPIssues?.map((issue) => {
        customerProps.forEach((prop) => {
          if (issue?.[prop]) {
            issue[prop] = redactString(issue[prop]);
          }
        });
        return issue;
      });

      report?.Permissions?.Results?.CPVRefreshList?.map((cpv) => {
        customerProps.forEach((prop) => {
          if (cpv?.[prop]) {
            cpv[prop] = redactString(cpv[prop]);
          }
        });
        return cpv;
      });

      customerProps.forEach((prop) => {
        if (report?.Permissions?.Results?.AccessTokenDetails?.[prop]) {
          report.Permissions.Results.AccessTokenDetails[prop] = redactString(
            report.Permissions.Results.AccessTokenDetails[prop]
          );
        }
        if (report?.Permissions?.Results?.ApplicationTokenDetails?.[prop]) {
          report.Permissions.Results.ApplicationTokenDetails[prop] = redactString(
            report.Permissions.Results.ApplicationTokenDetails[prop]
          );
        }
      });
    }

    const json = JSON.stringify(report);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cipp-permission-report.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportReport = (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      const report = JSON.parse(e.target.result);

      if (!report?.Permissions && !report?.GDAP && !report?.Tenants) {
        setImportError("Invalid report format");
        return;
      }
      setCurrentFile(file);
      setImportReport(report);
      setImportError(false);
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleImportFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const report = JSON.parse(text);

      if (!report?.Permissions && !report?.GDAP && !report?.Tenants) {
        setImportError("Invalid report format");
        return;
      }
      setCurrentFile({ name: "Clipboard Data" });
      setImportReport(report);
      setImportError(false);
    } catch (error) {
      setImportError("Failed to read from clipboard");
    }
  };

  return (
    <>
      <Stack direction="row" spacing={2}>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={createDialog.handleOpen}
          startIcon={
            <SvgIcon fontSize="small">
              <FileDownload />
            </SvgIcon>
          }
        >
          Export Report
        </Button>
        <Button
          component="label"
          size="small"
          variant="contained"
          color="primary"
          startIcon={
            <SvgIcon fontSize="small">
              <FileUpload />
            </SvgIcon>
          }
        >
          Import Report
          <input
            type="file"
            hidden
            onChange={handleImportReport}
            accept=".json"
            id="report-upload"
          />
        </Button>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={handleImportFromClipboard}
          startIcon={
            <SvgIcon fontSize="small">
              <ContentPasteGo />
            </SvgIcon>
          }
        >
          Paste Report
        </Button>
        {importReport && (
          <Tooltip title="Close report">
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => setImportReport(false)}
              endIcon={
                <SvgIcon fontSize="small">
                  <Close />
                </SvgIcon>
              }
            >
              {currentFile.name}
            </Button>
          </Tooltip>
        )}
        {importError && (
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => setImportError(false)}
            endIcon={
              <SvgIcon fontSize="small">
                <Close />
              </SvgIcon>
            }
          >
            {importError}
          </Button>
        )}
      </Stack>
      <CippApiDialog
        title="Export Diagnostic Report"
        createDialog={createDialog}
        fields={[
          {
            type: "switch",
            name: "redactCustomerData",
            label: "Redact Customer Data",
          },
        ]}
        api={{
          confirmText:
            "Export a diagnostic report of the current permissions for your SAM application authentication, GDAP and Tenant data. This report will be exported as a JSON file.",
          customFunction: handleExportReport,
        }}
      />
    </>
  );
};
