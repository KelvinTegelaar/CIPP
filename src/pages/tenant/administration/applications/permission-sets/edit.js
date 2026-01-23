import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "../../../../../layouts/index.js";
import { useForm } from "react-hook-form";
import { ApiGetCall, ApiPostCall } from "../../../../../api/ApiCall";
import CippAppPermissionBuilder from "../../../../../components/CippComponents/CippAppPermissionBuilder";
import CippPageCard from "../../../../../components/CippCards/CippPageCard";
import { Alert, CardContent, Skeleton, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@mui/material";
import { CippFormComponent } from "../../../../../components/CippComponents/CippFormComponent";

const Page = () => {
  const router = useRouter();
  const { template, name } = router.query;

  const [initialPermissions, setInitialPermissions] = useState(null);

  const formControl = useForm({
    mode: "onBlur",
  });

  // Add a key to force refetch when we save
  const [refetchKey, setRefetchKey] = useState(0);

  const {
    data: templateData,
    isFetching,
    refetch,
  } = ApiGetCall({
    url: template ? `/api/ExecAppPermissionTemplate?TemplateId=${template}` : null,
    queryKey: template ? ["execAppPermissionTemplate", template, refetchKey] : null,
    enabled: !!template,
  });

  const updatePermissions = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["ExecAppPermissionTemplate", "execAppPermissionTemplate"],
  });

  useEffect(() => {
    if (templateData && templateData[0]) {
      setInitialPermissions({
        TemplateId: templateData[0].TemplateId,
        Permissions: templateData[0].Permissions,
        TemplateName: templateData[0].TemplateName,
      });
      formControl.setValue("templateName", templateData[0].TemplateName, {
        shouldValidate: true,
        shouldDirty: false,
      });
    }
  }, [templateData]);

  const handleUpdatePermissions = (data) => {
    let payload = {
      ...data,
      TemplateId: template,
    };

    // Use the current value from the text field
    payload.TemplateName = formControl.getValues("templateName");

    updatePermissions.mutate(
      {
        url: "/api/ExecAppPermissionTemplate?Action=Save",
        data: payload,
        queryKey: "execAppPermissionTemplate",
      },
      {
        onSuccess: () => {
          // Refresh the data by incrementing the refetch key
          setRefetchKey((prev) => prev + 1);

          // Explicitly refetch the data
          refetch();
        },
      }
    );
  };

  // Instead of redirecting, we'll display an error message
  if (!template) {
    return (
      <CippPageCard hideBackButton={false} title="Permission Set Not Found">
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            The requested permission set does not exist or was not specified. Please select a valid
            permission set from the list.
          </Alert>
          <Button
            variant="contained"
            component={Link}
            href="/tenant/administration/applications/permission-sets"
          >
            Back to Permission Sets
          </Button>
        </CardContent>
      </CippPageCard>
    );
  }

  return (
    <CippPageCard
      hideBackButton={false}
      title={`Edit Permission Set: ${
        initialPermissions?.TemplateName || templateData?.[0]?.TemplateName || name || ""
      }`}
    >
      <CardContent>
        <Stack spacing={2}>
          {isFetching && (
            <Skeleton variant="rectangular" width="100%" height={200} animation="wave" />
          )}
          {!isFetching && initialPermissions && (
            <>
              <Typography variant="body2">
                Modify the permissions in this permission set. Any changes will affect all
                applications using this permission set.
              </Typography>
              <Alert severity="info">
                Permission sets allow you to define collections of permissions that can be applied
                to applications consistently.
              </Alert>

              <CippFormComponent
                formControl={formControl}
                name="templateName"
                label="Permission Set Name"
                type="textField"
                required={true}
                validators={{ required: "Permission set name is required" }}
              />

              <Alert severity="info">
                Choose the permissions you want to assign to this permission set. Microsoft Graph is
                the default Service Principal added and you can choose to add additional Service
                Principals as needed. Note that some Service Principals do not have any published
                permissions to choose from.
              </Alert>

              <CippAppPermissionBuilder
                formControl={formControl}
                currentPermissions={initialPermissions}
                onSubmit={handleUpdatePermissions}
                updatePermissions={updatePermissions}
                removePermissionConfirm={true}
                appDisplayName={
                  formControl.watch("templateName") || initialPermissions?.TemplateName
                }
                key={refetchKey}
              />
            </>
          )}
        </Stack>
      </CardContent>
    </CippPageCard>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
