import { Layout as DashboardLayout } from "../../../layouts/index.js";
import { CippTablePage } from "../../../components/CippComponents/CippTablePage.jsx";
import {
  Alert,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  CircularProgress,
  Box,
} from "@mui/material";
import { useRouter } from "next/router";
import { ArrowPathIcon, DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Close } from "@mui/icons-material";
import { useState } from "react";
import { CippScriptDiff } from "../../../components/CippComponents/CippScriptDiff.jsx";
import { ApiGetCall } from "../../../api/ApiCall";

const Page = () => {
  const router = useRouter();
  const { ScriptGuid } = router.query;
  const pageTitle = "Script Version History";
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareVersion, setCompareVersion] = useState(null);

  const allVersions = ApiGetCall({
    url: `/api/ListCustomScripts?ScriptGuid=${ScriptGuid}&IncludeAllVersions=true`,
    queryKey: `CustomScript-Versions-${ScriptGuid}`,
    waiting: !!ScriptGuid,
  });

  const latestVersion = allVersions.data?.[0];
  const compareLabel = compareVersion
    ? `Version ${compareVersion.Version} - ${compareVersion.CreatedBy || "Unknown"}`
    : "Selected Version";
  const latestLabel = latestVersion
    ? `Version ${latestVersion.Version} (Latest) - ${latestVersion.CreatedBy || "Unknown"}`
    : "Latest Version";

  const simpleColumns = [
    "Version",
    "ScriptName",
    "Description",
    "Enabled",
    "AlertOnFailure",
    "ReturnType",
    "Category",
    "Risk",
    "CreatedBy",
    "CreatedDate",
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        tableFilter={
          <Alert severity="info">
            <Typography variant="body2">
              View all versions of this custom script. You can restore to any previous version, but
              note that restoring will permanently delete all versions newer than the selected
              version.
            </Typography>
          </Alert>
        }
        tenantInTitle={false}
        apiUrl={`/api/ListCustomScripts?ScriptGuid=${ScriptGuid}&IncludeAllVersions=true`}
        simpleColumns={simpleColumns}
        queryKey={`CustomScript-Versions-List-${ScriptGuid}`}
        actions={[
          {
            label: "Restore to This Version",
            type: "POST",
            url: "/api/AddCustomScript",
            icon: <ArrowPathIcon />,
            relatedQueryKeys: [
              "Custom PowerShell Scripts",
              "CustomScript*",
            ],
            data: {
              ScriptGuid: "ScriptGuid",
              RestoreToVersion: "Version",
            },
            confirmText:
              "Are you sure you want to restore '[ScriptName]' to version [Version]? All versions newer than [Version] will be permanently deleted.",
            color: "warning",
          },
          {
            label: "Compare to Latest",
            icon: <DocumentMagnifyingGlassIcon />,
            noConfirm: true,
            customFunction: (row) => {
              setCompareVersion(row);
              setCompareOpen(true);
            },
            condition: (row) => row.Version != latestVersion?.Version,
          },
        ]}
      />

      <Dialog
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Compare Script Versions
          <IconButton
            aria-label="close"
            onClick={() => setCompareOpen(false)}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {!compareVersion || !latestVersion ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Script Content Diff
                </Typography>
                <CippScriptDiff
                  oldScript={compareVersion.ScriptContent || ""}
                  newScript={latestVersion.ScriptContent || ""}
                  oldLabel={compareLabel}
                  newLabel={latestLabel}
                />
              </Box>

              {(compareVersion.MarkdownTemplate || latestVersion.MarkdownTemplate) && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Markdown Template Diff
                  </Typography>
                  <CippScriptDiff
                    oldScript={compareVersion.MarkdownTemplate || ""}
                    newScript={latestVersion.MarkdownTemplate || ""}
                    oldLabel={compareLabel}
                    newLabel={latestLabel}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
