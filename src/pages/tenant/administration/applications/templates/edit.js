import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "../../../../../layouts/index.js";
import { useForm } from "react-hook-form";
import { ApiGetCall, ApiPostCall } from "../../../../../api/ApiCall";
import CippPageCard from "../../../../../components/CippCards/CippPageCard";
import { Alert, Button, CardContent } from "@mui/material";
import { useState } from "react";
import Link from "next/link";
import AppApprovalTemplateForm from "../../../../../components/CippComponents/AppApprovalTemplateForm";

const Page = () => {
  const router = useRouter();
  const { template, name } = router.query;

  // Add a key to force refetch when we save
  const [refetchKey, setRefetchKey] = useState(0);

  const formControl = useForm({
    mode: "onBlur",
  });

  const { data: templateData, isLoading } = ApiGetCall({
    url: template ? `/api/ExecAppApprovalTemplate?Action=Get&TemplateId=${template}` : null,
    queryKey: template ? ["ExecAppApprovalTemplateList", template, refetchKey] : null,
    enabled: !!template,
  });

  const updatePermissions = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["ListAppApprovalTemplates", "ExecAppApprovalTemplate"],
  });

  const handleSubmit = (payload) => {
    // Ensure we're passing the TemplateId in the payload for updates
    const updatedPayload = {
      ...payload,
      TemplateId: template,
      Action: "Save",
    };

    updatePermissions.mutate(
      {
        url: "/api/ExecAppApprovalTemplate?Action=Save",
        data: updatedPayload,
        queryKey: "ExecAppApprovalTemplate",
      },
      {
        onSuccess: (data) => {
          // Check if we received a valid response
          const newTemplateId = data?.[0]?.TemplateId || template;

          // Refresh the data
          setRefetchKey((prev) => prev + 1);
        },
      }
    );
  };

  // Show error if template doesn't exist
  if (!template) {
    return (
      <CippPageCard hideBackButton={false} title="Template Not Found">
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            The requested app approval template does not exist or was not specified. Please select a
            valid template from the list.
          </Alert>
          <Button
            variant="contained"
            component={Link}
            href="/tenant/administration/applications/templates"
          >
            Back to Templates
          </Button>
        </CardContent>
      </CippPageCard>
    );
  }

  return (
    <CippPageCard
      hideBackButton={false}
      title={`Edit App Approval Template: ${templateData?.[0]?.TemplateName || name || ""}`}
    >
      <CardContent>
        <AppApprovalTemplateForm
          formControl={formControl}
          templateData={templateData}
          templateLoading={isLoading}
          isEditing={true}
          isCopy={false}
          updatePermissions={updatePermissions}
          onSubmit={handleSubmit}
          refetchKey={refetchKey}
        />
      </CardContent>
    </CippPageCard>
  );
};

// Changed from TabbedLayout to just DashboardLayout
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
