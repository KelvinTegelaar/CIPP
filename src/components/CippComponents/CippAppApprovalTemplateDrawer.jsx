import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { Add, Edit } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import AppApprovalTemplateForm from "./AppApprovalTemplateForm";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "./CippApiResults";

export const CippAppApprovalTemplateDrawer = ({
  buttonText = "Add App Approval Template",
  isEditMode = false,
  templateId = null,
  templateName = null,
  isCopy = false,
  requiredPermissions = [],
  PermissionButton = Button,
  onSuccess = null,
  drawerVisible: externalDrawerVisible,
  setDrawerVisible: externalSetDrawerVisible,
}) => {
  const [internalDrawerVisible, setInternalDrawerVisible] = useState(false);
  const [refetchKey, setRefetchKey] = useState(0);

  // Use external drawer state if provided, otherwise use internal state
  const drawerVisible =
    externalDrawerVisible !== undefined ? externalDrawerVisible : internalDrawerVisible;
  const setDrawerVisible = externalSetDrawerVisible || setInternalDrawerVisible;

  const formControl = useForm({
    mode: "onBlur",
  });

  // Get the specified template if template ID is provided
  const { data: templateData, isLoading: templateLoading } = ApiGetCall({
    url:
      (isEditMode || isCopy) && templateId
        ? `/api/ExecAppApprovalTemplate?Action=Get&TemplateId=${templateId}`
        : null,
    queryKey:
      (isEditMode || isCopy) && templateId
        ? ["ExecAppApprovalTemplate", templateId, refetchKey]
        : null,
    waiting: !!((isEditMode || isCopy) && templateId),
  });

  const updatePermissions = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["ListAppApprovalTemplates", "ExecAppApprovalTemplate"],
  });

  const handleSubmit = (payload) => {
    // If editing, include the template ID
    if (isEditMode && !isCopy && templateId) {
      payload.TemplateId = templateId;
    }

    updatePermissions.mutate(
      {
        url: "/api/ExecAppApprovalTemplate?Action=Save",
        data: payload,
        queryKey: "ExecAppApprovalTemplate",
      },
      {
        onSuccess: (data) => {
          // Refresh the data
          setRefetchKey((prev) => prev + 1);

          // Call the onSuccess callback if provided
          if (onSuccess) {
            onSuccess(data);
          }

          // If adding or copying, reset the form for next entry
          if (!isEditMode || isCopy) {
            formControl.reset({
              templateName: "",
              appType: "EnterpriseApp",
              appId: null,
              galleryTemplateId: null,
              permissionSetId: null,
              applicationManifest: "",
            });
          }
        },
      }
    );
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset({
      templateName: "",
      appType: "EnterpriseApp",
      appId: null,
      galleryTemplateId: null,
      permissionSetId: null,
      applicationManifest: "",
    });
  };

  // Reset form when drawer is opened for a new template
  useEffect(() => {
    if (drawerVisible && !isEditMode && !isCopy) {
      formControl.reset({
        templateName: "New App Deployment Template",
        appType: "EnterpriseApp",
        appId: null,
        galleryTemplateId: null,
        permissionSetId: null,
        applicationManifest: "",
      });
    }
  }, [drawerVisible, isEditMode, isCopy]);

  const getDrawerTitle = () => {
    if (isCopy) {
      return `Copy App Approval Template${templateName ? `: ${templateName}` : ""}`;
    } else if (isEditMode) {
      return `Edit App Approval Template${templateName ? `: ${templateName}` : ""}`;
    } else {
      return "Add App Approval Template";
    }
  };

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={isEditMode ? <Edit /> : <Add />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title={getDrawerTitle()}
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="xl"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={formControl.handleSubmit(handleSubmit)}
              disabled={updatePermissions.isPending}
            >
              {updatePermissions.isPending
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : updatePermissions.isSuccess
                ? isEditMode
                  ? "Update Another"
                  : "Create Another"
                : isEditMode
                ? "Update Template"
                : "Create Template"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </div>
        }
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <AppApprovalTemplateForm
              formControl={formControl}
              templateData={templateData}
              templateLoading={templateLoading}
              isEditing={isEditMode}
              isCopy={isCopy}
              updatePermissions={updatePermissions}
              onSubmit={handleSubmit}
              refetchKey={refetchKey}
              hideSubmitButton={true}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CippApiResults apiObject={updatePermissions} />
          </Grid>
        </Grid>
      </CippOffCanvas>
    </>
  );
};
