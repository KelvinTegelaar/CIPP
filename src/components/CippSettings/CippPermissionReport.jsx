import { Button, Stack, SvgIcon } from "@mui/material";
import { Delete, FileDownload, FileUpload } from "@mui/icons-material";
import { ApiGetCall } from "../../api/ApiCall";

export const CippPermissionReport = (props) => {
  const { importReport, setImportReport } = props;
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

  const handleExportReport = () => {
    permissionReport.waiting = true;
    gdapReport.waiting = true;
    tenantReport.waiting = true;
    const report = {
      Permissions: permissionReport.data,
      GDAP: gdapReport.data,
      Tenants: tenantReport.data,
    };

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
      setImportReport(report);
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  return (
    <Stack direction="row" spacing={1}>
      <Button
        size="small"
        variant="contained"
        color="primary"
        onClick={handleExportReport}
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
        <input type="file" hidden onChange={handleImportReport} accept=".json" id="report-upload" />
      </Button>
      {importReport && (
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={() => setImportReport(false)}
          startIcon={
            <SvgIcon fontSize="small">
              <Delete />
            </SvgIcon>
          }
        >
          Clear
        </Button>
      )}
    </Stack>
  );
};
