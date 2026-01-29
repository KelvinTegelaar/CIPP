import { TabbedLayout } from "../../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../../layouts/index.js";
import tabOptions from "./tabOptions";
import { useForm } from "react-hook-form";
import { ApiGetCall, ApiPostCall } from "../../../api/ApiCall";
import CippAppPermissionBuilder from "../../../components/CippComponents/CippAppPermissionBuilder";
import CippPageCard from "../../../components/CippCards/CippPageCard";
import { Alert, CardContent, Skeleton, Stack, Typography } from "@mui/material";
import { WarningAmberOutlined } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "SAM App Permissions";

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

  const handleUpdatePermissions = (data) => {
    updatePermissions.mutate({
      url: "/api/ExecSAMAppPermissions?Action=Update",
      data: data,
      queryKey: "execSamAppPermissions",
    });
  };

  return (
    <CippPageCard hideBackButton={true} title={"SAM App Permissions"}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="body2">This is an advanced setting that allows you to modify the permissions used for CPV consent on customer tenants.</Typography>
          <Alert color="warning" icon={<WarningAmberOutlined />}>
            This functionality is in beta and should be treated as such. Removing permissions from
            the CIPP-SAM app is not advised.
          </Alert>
          {execSamAppPermissions.isLoading && <Skeleton variant="rectangular" height={300} />}
          {execSamAppPermissions.isSuccess && (
            <CippAppPermissionBuilder
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
    </CippPageCard>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
