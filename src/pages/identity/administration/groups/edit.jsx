import React, { useEffect } from "react";
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

const EditGroup = () => {
  const router = useRouter();
  const { groupId } = router.query;
  const tenantFilter = useSettings().currentTenant;
  const groupInfo = ApiGetCall({
    url: `/api/ListGroups?groupID=${groupId}&tenantFilter=${tenantFilter}&members=true&owners=true`,
    queryKey: `ListGroups-${groupId}`,
    waiting: false,
  });

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
        formControl.reset({
          tenantId: tenantFilter,
          allowExternal: group.allowExternal,
          sendCopies: group.sendCopies,
          groupName: group.displayName,
          groupId: group.id,
          groupType: (() => {
            if (group.mailEnabled && group.securityEnabled) {
              return "Mail-Enabled Security";
            }
            if (!group.mailEnabled && group.securityEnabled) {
              return "Security";
            }
            if (group.groupTypes?.includes("Unified")) {
              return "Microsoft 365";
            }
            if (
              (!group.groupTypes || group.groupTypes.length === 0) &&
              group.mailEnabled &&
              !group.securityEnabled
            ) {
              return "Distribution List";
            }
            return null; // Default case, if no condition is met
          })(),
        });
      }
    }
  }, [groupInfo.isSuccess]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <CippFormPage
          formControl={formControl}
          queryKey="EditGroup"
          title="Edit Group"
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
            <Grid item xs={12}>
              <CippFormContactSelector
                formControl={formControl}
                name="AddContact"
                label="Add Contact"
                multiple={true}
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

            {/* RemoveContacts */}
            <Grid item xs={12}>
              <CippFormContactSelector
                formControl={formControl}
                name="RemoveContact"
                label="Remove Contact"
                multiple={true}
              />
            </Grid>

            <Divider sx={{ my: 2, width: "100%" }} />

            {/* Conditional fields */}
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
    </Grid>
  );
};

EditGroup.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditGroup;
