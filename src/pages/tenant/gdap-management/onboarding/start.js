import { Alert, Button, List, ListItem, SvgIcon, Typography } from "@mui/material";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import { CippFormComponent } from "/src/components/CippComponents/CippFormComponent";
import GDAPRoles from "/src/data/GDAPRoles";
import { Box, Stack } from "@mui/system";
import { CippPropertyList } from "/src/components/CippComponents/CippPropertyList";
import { ApiGetCallWithPagination } from "../../../../api/ApiCall";
import { useEffect, useState } from "react";
import { getCippFormatting } from "/src/utils/get-cipp-formatting";
import { router } from "next/router";

const Page = () => {
  const [currentRelationship, setCurrentRelationship] = useState(null);
  const [currentInvite, setCurrentInvite] = useState(null);
  const queryId = router.query.id;
  const formControl = useForm({
    mode: "onChange",
  });

  const currentInvites = ApiGetCallWithPagination({
    url: "/api/ListGDAPInvite",
    queryKey: "ListGDAPInvite",
  });

  const selectedRelationship = useWatch({
    control: formControl.control,
    name: "id",
  });

  useEffect(() => {
    if (currentInvites.isSuccess && selectedRelationship !== currentRelationship) {
      const invite = currentInvites?.data?.pages?.[0]?.find(
        (invite) => invite.RowKey === selectedRelationship?.value
      );
      setCurrentRelationship(selectedRelationship);
      setCurrentInvite(invite);
    }
  }, [currentInvites.isSuccess, selectedRelationship, currentRelationship]);

  return (
    <>
      <CippFormPage
        queryKey="ListGDAPInvite"
        formControl={formControl}
        title="Tenant Onboarding"
        backButtonTitle="GDAP Invites"
        postUrl="/api/ExecOnboardTenant"
        formPageType="Start"
      >
        <Stack spacing={2}>
          <CippFormComponent
            formControl={formControl}
            name="id"
            label="Select GDAP Relationship"
            type="autoComplete"
            api={{
              url: "/api/ListGraphRequest",
              data: {
                TenantFilter: "",
                Endpoint: "tenantRelationships/delegatedAdminRelationships",
                $filter:
                  "(status eq 'active' or status eq 'approvalPending') and not startsWith(displayName,'MLT_')",
              },
              queryKey: "GDAPRelationships",
              dataKey: "Results",
              labelField: (option) =>
                (option?.customer?.displayName ?? "Pending Invite") + " - (" + option?.id + ")",
              valueField: "id",
              addedField: {
                customer: "customer",
                id: "id",
                createdDateTime: "createdDateTime",
                accessDetails: "accessDetails",
                status: "status",
                autoExtendDuration: "autoExtendDuration",
                lastModifiedDateTime: "lastModifiedDateTime",
              },
            }}
            multiple={false}
            required={true}
          />
          {currentRelationship?.value && !currentInvite && (
            <>
              <CippFormComponent
                formControl={formControl}
                name="remapRoles"
                value={true}
                type="hidden"
              />
              <CippFormComponent
                formControl={formControl}
                name="gdapRoles"
                label="Select GDAP Role Template"
                type="autoComplete"
                api={{
                  url: "/api/ExecGDAPRoleTemplate",
                  queryKey: "GDAPTemplates",
                  dataKey: "Results",
                  labelField: (option) => option.TemplateId,
                  valueField: "RoleMappings",
                }}
                required={true}
                multiple={false}
              />
            </>
          )}
          {currentRelationship?.value && (
            <>
              <Box>
                <Typography variant="h6">Current Relationship Details</Typography>
                <CippPropertyList
                  layout="double"
                  propertyItems={[
                    {
                      label: "Customer",
                      value:
                        currentRelationship?.addedFields?.customer?.displayName ?? "Pending Invite",
                    },
                    {
                      label: "Status",
                      value: getCippFormatting(
                        currentRelationship?.addedFields?.status,
                        "status",
                        "text"
                      ),
                    },
                    {
                      label: "Auto Extend Duration",
                      value: getCippFormatting(
                        currentRelationship?.addedFields?.autoExtendDuration,
                        "autoExtendDuration",
                        "text"
                      ),
                    },
                    {
                      label: "Pending Invite",
                      value: currentInvite?.RowKey ? "Yes" : "No",
                    },
                    {
                      label: "Created Date",
                      value: getCippFormatting(
                        currentRelationship?.addedFields?.createdDateTime,
                        "createdDateTime",
                        "date"
                      ),
                    },
                    {
                      label: "Last Modified Date",
                      value: getCippFormatting(
                        currentRelationship?.addedFields?.lastModifiedDateTime,
                        "lastModifiedDateTime",
                        "date"
                      ),
                    },
                    {
                      label: "Invite URL",
                      value: getCippFormatting(
                        "https://admin.microsoft.com/AdminPortal/Home#/partners/invitation/granularAdminRelationships/" +
                          currentRelationship.value,
                        "InviteUrl",
                        "url"
                      ),
                    },
                    {
                      label: "Access Details",
                      value: getCippFormatting(
                        currentInvite
                          ? currentInvite.RoleMappings
                          : currentRelationship?.addedFields?.accessDetails.unifiedRoles,
                        "unifiedRoles",
                        "object"
                      ),
                    },
                  ]}
                />
              </Box>
            </>
          )}
        </Stack>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
