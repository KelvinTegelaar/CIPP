import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm } from "react-hook-form";
import { ApiGetCall, ApiPostCall } from "../../../../../api/ApiCall";
import CippPageCard from "/src/components/CippCards/CippPageCard";
import { CardContent } from "@mui/material";
import { useState } from "react";
import AppApprovalTemplateForm from "/src/components/CippComponents/AppApprovalTemplateForm";

const Page = () => {
  const router = useRouter();
  const { template, copy, name } = router.query;
  const pageTitle = copy ? "Copy App Approval Template" : "Add App Approval Template";

  // Add refetch key for refreshing data after save
  const [refetchKey, setRefetchKey] = useState(0);

  const formControl = useForm({
    mode: "onBlur",
  });

  // Get the specified template if template ID is provided
  const { data: templateData, isLoading: templateLoading } = ApiGetCall({
    url: template ? `/api/ExecAppApprovalTemplate?Action=Get&TemplateId=${template}` : null,
    queryKey: template ? ["ExecAppApprovalTemplate", template, refetchKey] : null,
    waiting: !!template,
  });

  const updatePermissions = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["ListAppApprovalTemplates", "ExecAppApprovalTemplate"],
  });

  const handleSubmit = (payload) => {
    updatePermissions.mutate(
      {
        url: "/api/ExecAppApprovalTemplate?Action=Save",
        data: payload,
        queryKey: "ExecAppApprovalTemplate",
      },
      {
        onSuccess: (data) => {
          // If we're adding or copying, redirect to edit page with the new ID
          if (!template || copy) {
            // Check if data exists and has the expected structure
            const newTemplateId = data?.[0]?.TemplateId;

            if (newTemplateId) {
              router.push(
                {
                  pathname: "/tenant/administration/applications/templates/edit",
                  query: {
                    template: newTemplateId,
                    name: payload.TemplateName,
                  },
                },
                undefined,
                { shallow: true }
              );
            } else {
              // Handle the case where TemplateId is missing
              console.error("Missing TemplateId in response:", data);
              // Just refresh the data as fallback
              setRefetchKey((prev) => prev + 1);
            }
          } else {
            // Just refresh the data if we're editing
            setRefetchKey((prev) => prev + 1);
          }
        },
      }
    );
  };

  return (
    <CippPageCard hideBackButton={false} title={pageTitle}>
      <CardContent>
        <AppApprovalTemplateForm
          formControl={formControl}
          templateData={templateData}
          templateLoading={templateLoading}
          isEditing={false}
          isCopy={copy}
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
