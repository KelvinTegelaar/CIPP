import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import tabOptions from "./tabOptions";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { ApiGetCall, ApiPostCall } from "../../../../api/ApiCall";
import CippAppPermissionBuilder from "../../../../components/CippComponents/CippAppPermissionBuilder";
import CippPageCard from "../../../../components/CippCards/CippPageCard";
import { CippApiResults } from "../../../../components/CippComponents/CippApiResults";
import { ConfirmationDialog } from "../../../../components/confirmation-dialog";
import { Alert, Button, CardContent, Skeleton, Stack, SvgIcon, Typography } from "@mui/material";
import { SettingsBackupRestore, WarningAmberOutlined } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "SAM App Permissions";

  const [resetKey, setResetKey] = useState(0);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const formControl = useForm({
    mode: "onBlur",
  });

  const execSamAppPermissions = ApiGetCall({
    url: "/api/ExecSAMAppPermissions",
    queryKey: "execSamAppPermissions",
    waiting: true,
  });

  const updatePermissions = ApiPostCall({
    urlFromData: true,
  });

  const resetPermissions = ApiPostCall({
    relatedQueryKeys: ["execSamAppPermissions"],
    onResult: () => {
      // Remount the builder so it re-seeds its internal state from the freshly defaulted data
      setResetKey((prev) => prev + 1);
      execSamAppPermissions.refetch();
    },
  });

  const handleUpdatePermissions = (data) => {
    updatePermissions.mutate({
      url: "/api/ExecSAMAppPermissions?Action=Update",
      data: data,
      queryKey: "execSamAppPermissions",
    });
  };

  const handleResetToCippDefaults = () => {
    resetPermissions.mutate({
      url: "/api/ExecSAMAppPermissions?Action=Reset",
      data: {},
    });
  };

  return (
    <CippPageCard hideBackButton={true} title={pageTitle}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="body2">
            This is an advanced setting that allows you to modify the permissions used for CPV
            consent on customer tenants.
          </Typography>
          <Alert color="warning" icon={<WarningAmberOutlined />}>
            The default CIPP-SAM permissions are always applied and cannot be removed - you
            can only layer additional permissions on top of them. Use "Reset to CIPP Defaults"
            to remove all additional permissions and return to the built-in defaults.
          </Alert>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="error"
              startIcon={
                <SvgIcon fontSize="small">
                  <SettingsBackupRestore />
                </SvgIcon>
              }
              onClick={() => setResetDialogOpen(true)}
              disabled={resetPermissions.isPending}
            >
              Reset to CIPP Defaults
            </Button>
          </Stack>
          <CippApiResults apiObject={resetPermissions} />
          {execSamAppPermissions.isLoading && <Skeleton variant="rectangular" height={300} />}
          {execSamAppPermissions.isSuccess && (
            <CippAppPermissionBuilder
              key={`sam-permission-builder-${resetKey}`}
              postUrl={"/api/execSamAppPermissions"}
              formControl={formControl}
              currentPermissions={execSamAppPermissions?.data}
              onSubmit={handleUpdatePermissions}
              updatePermissions={updatePermissions}
              removePermissionConfirm={true}
            />
          )}
        </Stack>
      </CardContent>
      <ConfirmationDialog
        open={resetDialogOpen}
        onCancel={() => setResetDialogOpen(false)}
        title="Reset to CIPP Defaults"
        variant="warning"
        message="This removes all additional permissions you have layered on top of the CIPP-SAM defaults and returns the saved permission set to the built-in CIPP manifest defaults. The default permissions themselves are unaffected. You will need to complete a Permissions repair from the Permissions page, then complete a CPV refresh to finalise the chnages. Continue?"
        onConfirm={() => {
          handleResetToCippDefaults();
          setResetDialogOpen(false);
        }}
      />
    </CippPageCard>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
