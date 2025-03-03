import React, { useEffect, useState } from "react";
import { Grid, Divider, Typography } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormUserSelector } from "/src/components/CippComponents/CippFormUserSelector";
import { useRouter } from "next/router";
import { ApiGetCall } from "../../../../api/ApiCall";
import { useSettings } from "../../../../hooks/use-settings";
import { CippFormContactSelector } from "../../../../components/CippComponents/CippFormContactSelector";
import { CippDataTable } from "../../../../components/CippTable/CippDataTable";

const EditGroup = () => {
  const router = useRouter();
  const { groupId } = router.query;
  const tenantFilter = useSettings().currentTenant;
  const groupInfo = ApiGetCall({
    url: `/api/ListGroups?groupID=${groupId}&tenantFilter=${tenantFilter}&members=true&owners=true`,
    queryKey: `ListGroups-${groupId}`,
    waiting: false,
  });
  const [combinedData, setCombinedData] = useState([]);
  useEffect(() => {
    if (groupId) {
      groupInfo.refetch();
    }
  }, [router.query, groupId, tenantFilter]);

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantId: tenantFilter,
    },
  });
  const groupType = useWatch({ control: formControl.control, name: "groupType" });

  useEffect(() => {
    if (groupInfo.isSuccess) {
      const group = groupInfo.data?.groupInfo;
      if (group) {
        const combinedData = [
          ...(groupInfo.data?.owners?.map((o) => ({
            type: "Owner",
            userPrincipalName: o.userPrincipalName,
            displayName: o.displayName,
          })) || []),
          ...(groupInfo.data?.members?.map((m) => ({
            type: "Member",
            userPrincipalName: m.userPrincipalName,
            displayName: m.displayName,
          })) || []),
        ];
        setCombinedData(combinedData);

        formControl.reset({
          tenantId: tenantFilter,
          mail: group.mail,
          allowExternal: group.allowExternal,
          sendCopies: group.sendCopies,
          groupName: group.displayName,
          groupId: group.id,
          groupType: (() => {
            if (group.groupTypes?.includes("Unified")) {
              return "Microsoft 365";
            }
            if (!group.mailEnabled && group.securityEnabled) {
              return "Security";
            }
            if (group.mailEnabled && group.securityEnabled) {
              return "Mail-Enabled Security";
            }

            if (
              (!group.groupTypes || group.groupTypes.length === 0) &&
              group.mailEnabled &&
              !group.securityEnabled
            ) {
              return "Distribution List";
            }
            return null;
          })(),
        });
      }
    }
  }, [groupInfo.isSuccess, router.query, groupInfo.isFetching]);

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} md={6}>
        <CippFormPage
          formControl={formControl}
          queryKey={`ListGroups-${groupId}`}
          title={`Group: ${groupInfo.data?.groupInfo?.displayName || ''}`}
          formPageType="Edit"
          backButtonTitle="Group Overview"
          postUrl="/api/EditGroup"
        >
          <Typography variant="h6">Add</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CippFormUserSelector
                formControl={formControl}
                name="AddMember"
                label="Add Member"
                multiple={true}
                valueField="userPrincipalName"
              />
            </Grid>

            {/* AddOwners */}
            <Grid item xs={12}>
              <CippFormUserSelector
                formControl={formControl}
                name="AddOwner"
                label="Add Owner"
                multiple={true}
                labelField={(option) => `${option.displayName} (${option.userPrincipalName})`}
                valueField="userPrincipalName"
              />
            </Grid>
            <Grid item xs={12}>
              <CippFormContactSelector
                formControl={formControl}
                name="AddContact"
                label="Add Contact"
                multiple={true}
              />
            </Grid>
            <Divider sx={{ my: 2, width: "100%" }} />
            <Grid item xs={12}>
              <Typography variant="h6">Remove</Typography>

              <CippFormComponent
                type="autoComplete"
                formControl={formControl}
                isFetching={groupInfo.isFetching}
                disabled={groupInfo.isFetching}
                options={groupInfo.data?.members?.map((m) => ({
                  label: `${m.displayName} (${m.userPrincipalName})`,
                  value: m.userPrincipalName,
                }))}
                name="RemoveMember"
                label="Remove Member"
                multiple={true}
              />
            </Grid>

            {/* RemoveOwners */}
            <Grid item xs={12}>
              <CippFormComponent
                type="autoComplete"
                isFetching={groupInfo.isFetching}
                disabled={groupInfo.isFetching}
                options={groupInfo.data?.owners?.map((o) => ({
                  label: `${o.displayName} (${o.userPrincipalName})`,
                  value: o.userPrincipalName,
                }))}
                formControl={formControl}
                name="RemoveOwner"
                label="Remove Owner"
                multiple={true}
              />
            </Grid>
            <Grid item xs={12}>
              <CippFormContactSelector
                formControl={formControl}
                name="RemoveContact"
                label="Remove Contact"
                multiple={true}
              />
            </Grid>

            <Divider sx={{ my: 2, width: "100%" }} />
            {(groupType === "Microsoft 365" || groupType === "Distribution List") && (
              <Grid item xs={12}>
                <CippFormComponent
                  type="switch"
                  label="Let people outside the organization email the group"
                  name="allowExternal"
                  formControl={formControl}
                />
              </Grid>
            )}

            {groupType === "Microsoft 365" && (
              <Grid item xs={12}>
                <CippFormComponent
                  type="switch"
                  label="Send Copies of team emails and events to team members inboxes"
                  name="sendCopies"
                  formControl={formControl}
                />
              </Grid>
            )}
          </Grid>
        </CippFormPage>
      </Grid>
      <Grid sx={{ mt: 19 }} item md={5}>
        <CippDataTable
          sx={{ width: "100%" }}
          title="Members"
          data={combinedData}
          isFetching={groupInfo.isFetching}
          simpleColumns={["type", "userPrincipalName", "displayName"]}
        />
      </Grid>
    </Grid>
  );
};

EditGroup.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditGroup;
