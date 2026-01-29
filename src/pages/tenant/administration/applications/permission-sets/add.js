import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "../../../../../layouts/index.js";
import { useForm } from "react-hook-form";
import { ApiGetCall, ApiPostCall } from "../../../../../api/ApiCall";
import CippAppPermissionBuilder from "../../../../../components/CippComponents/CippAppPermissionBuilder";
import CippPageCard from "../../../../../components/CippCards/CippPageCard";
import { Alert, CardContent, Stack, Typography, Button, Box } from "@mui/material";
import { CippFormComponent } from "../../../../../components/CippComponents/CippFormComponent";
import { useEffect, useState } from "react";
import { CopyAll } from "@mui/icons-material";

const Page = () => {
  const router = useRouter();
  const { template, copy, name } = router.query;
  const pageTitle = copy ? "Copy Permission Set" : "Add Permission Set";

  const [initialPermissions, setInitialPermissions] = useState(null);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  // Add refetch key for refreshing data after save
  const [refetchKey, setRefetchKey] = useState(0);

  const formControl = useForm({
    mode: "onBlur",
  });

  // Get the specified template if template ID is provided
  const { data: templateData, isFetching: templateFetching } = ApiGetCall({
    url: template ? `/api/ExecAppPermissionTemplate?TemplateId=${template}` : null,
    queryKey: template ? ["execAppPermissionTemplateDetails", template, refetchKey] : null,
    enabled: !!template,
  });

  // Get all available templates for importing
  const { data: allTemplates, isLoading: templatesLoading } = ApiGetCall({
    url: "/api/ExecAppPermissionTemplate",
    queryKey: "execAppPermissionTemplateList",
  });

  useEffect(() => {
    if (allTemplates && allTemplates.length > 0) {
      setAvailableTemplates(allTemplates);
    }
  }, [allTemplates]);

  useEffect(() => {
    // Initialize with empty structure for new templates
    if (!template && !copy && !initialPermissions) {
      setInitialPermissions({
        Permissions: {},
        TemplateName: "New Permission Set",
      });
      formControl.setValue("templateName", "New Permission Set");
    } else if (templateData && copy && !initialPermissions) {
      // When copying, we want to load the permissions but assign a new ID
      if (templateData[0]) {
        const copyName = `Copy of ${templateData[0].TemplateName}`;
        setInitialPermissions({
          Permissions: templateData[0].Permissions,
          TemplateName: copyName,
        });
        formControl.setValue("templateName", copyName);
      }
    } else if (templateData && !initialPermissions) {
      // For editing, keep the same ID
      if (templateData[0]) {
        setInitialPermissions({
          TemplateId: templateData[0].TemplateId,
          Permissions: templateData[0].Permissions,
          TemplateName: templateData[0].TemplateName,
        });
        formControl.setValue("templateName", templateData[0].TemplateName);
      }
    }
  }, [templateData, copy, template]);

  const updatePermissions = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["ExecAppPermissionTemplate", "execAppPermissionTemplate"],
  });

  const handleUpdatePermissions = (data) => {
    let payload = {
      ...data,
    };

    if (copy) {
      // For copy, ensure we're not sending the original ID
      delete payload.TemplateId;
    } else if (template && !copy) {
      // For editing, include the template ID
      payload.TemplateId = template;
    }

    // Use the current value from the text field
    payload.TemplateName = formControl.getValues("templateName");

    updatePermissions.mutate(
      {
        url: "/api/ExecAppPermissionTemplate?Action=Save",
        data: payload,
        queryKey: "execAppPermissionTemplate",
      },
      {
        onSuccess: (data) => {
          // Instead of navigating away, stay on the page and refresh
          if (copy || !template) {
            // If we're copying or creating new, update the URL to edit mode with the new template ID
            const newTemplateId = data.data[0].Metadata.TemplateId;
            router.push(
              {
                pathname: "/tenant/administration/applications/permission-sets/edit",
                query: {
                  template: newTemplateId,
                  name: payload.TemplateName,
                },
              },
              undefined,
              { shallow: true }
            );
          } else {
            // Otherwise just refresh the current data
            setRefetchKey((prev) => prev + 1);
          }
        },
      }
    );
  };

  const handleImportTemplate = () => {
    const importTemplate = formControl.getValues("importTemplate");
    if (!importTemplate) return;

    const selectedTemplate = availableTemplates.find((t) => t.TemplateId === importTemplate.value);
    if (selectedTemplate) {
      setInitialPermissions({
        Permissions: selectedTemplate.Permissions,
        TemplateName: `Import of ${selectedTemplate.TemplateName}`,
      });
      formControl.setValue("templateName", `Import of ${selectedTemplate.TemplateName}`);
    }
  };

  return (
    <CippPageCard hideBackButton={false} title={pageTitle}>
      <CardContent>
        <Stack spacing={2}>
          {(!templateFetching || !template) && (
            <>
              <Typography variant="body2">
                {copy
                  ? "Create a copy of an existing permission set with your own modifications."
                  : template
                  ? "Edit the permissions in this permission set."
                  : "Create a new permission set to define a collection of application permissions."}
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

              {!template && !copy && (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ flexGrow: 1 }}>
                    <CippFormComponent
                      formControl={formControl}
                      name="importTemplate"
                      label="Import from Existing (optional)"
                      placeholder="Select a template to import"
                      type="autoComplete"
                      options={availableTemplates.map((template) => ({
                        label: template.TemplateName,
                        value: template.TemplateId,
                      }))}
                      isFetching={templatesLoading}
                      multiple={false}
                    />
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={handleImportTemplate}
                    startIcon={<CopyAll />}
                    disabled={!formControl.watch("importTemplate")}
                  >
                    Import
                  </Button>
                </Stack>
              )}

              {initialPermissions && (
                <>
                  <Alert severity="info">
                    Choose the permissions you want to assign to this permission set. Microsoft
                    Graph is the default Service Principal added and you can choose to add
                    additional Service Principals as needed. Note that some Service Principals do
                    not have any published permissions to choose from.
                  </Alert>
                  <CippAppPermissionBuilder
                    formControl={formControl}
                    currentPermissions={initialPermissions}
                    onSubmit={handleUpdatePermissions}
                    updatePermissions={updatePermissions}
                    removePermissionConfirm={true}
                    appDisplayName={formControl.watch("templateName") || "New Permission Set"}
                    key={refetchKey}
                  />
                </>
              )}
            </>
          )}
        </Stack>
      </CardContent>
    </CippPageCard>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
