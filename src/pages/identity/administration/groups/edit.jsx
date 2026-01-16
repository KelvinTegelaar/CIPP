import { useEffect, useState } from "react";
import { Box, Button, Divider, Typography, Alert } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
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
  const { groupId, groupType } = router.query;
  const [groupIdReady, setGroupIdReady] = useState(false);
  const [showMembershipTable, setShowMembershipTable] = useState(false);
  const [combinedData, setCombinedData] = useState([]);
  const [initialValues, setInitialValues] = useState({});
  const tenantFilter = useSettings().currentTenant;

  const groupInfo = ApiGetCall({
    url: `/api/ListGroups?groupID=${groupId}&tenantFilter=${tenantFilter}&members=true&owners=true&groupType=${groupType}`,
    queryKey: `ListGroups-${groupId}`,
    waiting: groupIdReady,
  });

  useEffect(() => {
    if (groupId) {
      setGroupIdReady(true);
      groupInfo.refetch();
    }
  }, [router.query, groupId, tenantFilter]);

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: tenantFilter,
      AddMember: [],
      RemoveMember: [],
      AddOwner: [],
      RemoveOwner: [],
      AddContact: [],
      RemoveContact: [],
      visibility: "Public",
    },
  });

  useEffect(() => {
    if (groupInfo.isSuccess) {
      const group = groupInfo.data?.groupInfo;
      if (group) {
        // Create combined data for the table
        const combinedData = [
          ...(groupInfo.data?.owners?.map((o) => ({
            type: "Owner",
            userPrincipalName: o.userPrincipalName,
            displayName: o.displayName,
          })) || []),
          ...(groupInfo.data?.members?.map((m) => ({
            type: m?.["@odata.type"] === "#microsoft.graph.orgContact" ? "Contact" : "Member",
            userPrincipalName: m.userPrincipalName ?? m.mail,
            displayName: m.displayName,
          })) || []),
        ];
        setCombinedData(combinedData);

        // Create initial values object
        const formValues = {
          tenantFilter: tenantFilter,
          mail: group.mail,
          mailNickname: group.mailNickname || "",
          allowExternal: groupInfo?.data?.allowExternal,
          sendCopies: groupInfo?.data?.sendCopies,
          hideFromOutlookClients: groupInfo?.data?.hideFromOutlookClients,
          visibility: group?.visibility ?? "Public",
          displayName: group.displayName,
          description: group.description || "",
          membershipRules: group.membershipRule || "",
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
          securityEnabled: group.securityEnabled,
          // Initialize empty arrays for add/remove actions
          AddMember: [],
          RemoveMember: [],
          AddOwner: [],
          RemoveOwner: [],
          AddContact: [],
          RemoveContact: [],
        };

        // Store initial values for comparison
        setInitialValues({
          allowExternal: groupInfo?.data?.allowExternal,
          sendCopies: groupInfo?.data?.sendCopies,
          hideFromOutlookClients: groupInfo?.data?.hideFromOutlookClients,
          securityEnabled: group.securityEnabled,
          visibility: group.visibility ?? "Public",
        });

        // Reset the form with all values
        formControl.reset(formValues);
      }
    }
  }, [groupInfo.isSuccess, router.query, groupInfo.isFetching]);

  // Custom data formatter to only send changed values
  const customDataFormatter = (formData) => {
    const cleanedData = { ...formData };

    // Properties that should only be sent if they've changed from initial values
    const changeDetectionProperties = [
      "allowExternal",
      "sendCopies",
      "hideFromOutlookClients",
      "securityEnabled",
      "visibility",
    ];

    changeDetectionProperties.forEach((property) => {
      if (formData[property] === initialValues[property]) {
        delete cleanedData[property];
      }
    });

    return cleanedData;
  };

  return (
    <>
      <CippFormPage
        formControl={formControl}
        queryKey={[`ListGroups-${groupId}`]}
        title={`Group - ${groupInfo.data?.groupInfo?.displayName || ""}`}
        formPageType="Edit"
        backButtonTitle="Group Overview"
        postUrl="/api/EditGroup"
        customDataformatter={customDataFormatter}
        titleButton={
          <>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setShowMembershipTable(!showMembershipTable)}
              sx={{ mb: 2 }}
            >
              {showMembershipTable ? "Edit Membership" : "View members"}
            </Button>
          </>
        }
      >
        {groupInfo.isSuccess && groupInfo.data?.groupInfo?.onPremisesSyncEnabled && (
          <Alert severity="error" sx={{ mb: 1 }}>
            This group is synced from on-premises Active Directory. Changes should be made in the
            on-premises environment instead.
          </Alert>
        )}
        {showMembershipTable ? (
          <Box sx={{ my: 2 }}>
            <CippDataTable
              data={combinedData}
              isFetching={groupInfo.isFetching}
              simpleColumns={["type", "userPrincipalName", "displayName"]}
              refreshFunction={groupInfo.refetch}
            />
          </Box>
        ) : (
          <Box sx={{ my: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6">Group Properties</Typography>
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  fullWidth
                  label="Display Name"
                  name="displayName"
                  formControl={formControl}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  fullWidth
                  label="Description"
                  name="description"
                  formControl={formControl}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  fullWidth
                  label="Mail Nickname"
                  name="mailNickname"
                  formControl={formControl}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                />
              </Grid>

              {groupInfo.data?.groupInfo?.groupTypes?.includes("DynamicMembership") && (
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="textField"
                    fullWidth
                    label="Membership Rules"
                    name="membershipRules"
                    formControl={formControl}
                    isFetching={groupInfo.isFetching}
                    disabled={groupInfo.isFetching}
                  />
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">Add Members</Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CippFormUserSelector
                  formControl={formControl}
                  name="AddMember"
                  label="Add Members"
                  multiple={true}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                  addedField={{
                    id: "id",
                    displayName: "displayName",
                    userPrincipalName: "userPrincipalName",
                  }}
                  dataFilter={(option) =>
                    !groupInfo.data?.members?.some((m) => m.id === option.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CippFormUserSelector
                  formControl={formControl}
                  name="AddOwner"
                  label="Add Owners"
                  multiple={true}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                  addedField={{
                    id: "id",
                    displayName: "displayName",
                    userPrincipalName: "userPrincipalName",
                  }}
                  dataFilter={(option) =>
                    !groupInfo.data?.owners?.some((o) => o.id === option.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CippFormContactSelector
                  formControl={formControl}
                  name="AddContact"
                  label="Add Contacts"
                  multiple={true}
                  addedField={{
                    id: "Guid",
                    displayName: "displayName",
                    WindowsEmailAddress: "WindowsEmailAddress",
                  }}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                  dataFilter={(option) =>
                    !groupInfo.data?.members
                      ?.filter((m) => m?.["@odata.type"] === "#microsoft.graph.orgContact")
                      ?.some((c) => c.id === option.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">Remove Members</Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  type="autoComplete"
                  name="RemoveMember"
                  label="Remove Members"
                  formControl={formControl}
                  multiple={true}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                  options={
                    groupInfo.data?.members
                      ?.filter((m) => m?.["@odata.type"] !== "#microsoft.graph.orgContact")
                      ?.map((m) => ({
                        label: `${m.displayName} (${m.userPrincipalName})`,
                        value: m.id,
                        addedFields: {
                          userPrincipalName: m.userPrincipalName,
                          displayName: m.displayName,
                          id: m.id,
                        },
                      })) || []
                  }
                  sortOptions={true}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  type="autoComplete"
                  name="RemoveOwner"
                  label="Remove Owners"
                  formControl={formControl}
                  multiple={true}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                  options={
                    groupInfo.data?.owners?.map((o) => ({
                      label: `${o.displayName} (${o.userPrincipalName})`,
                      value: o.id,
                      addedFields: {
                        userPrincipalName: o.userPrincipalName,
                        displayName: o.displayName,
                        id: o.id,
                      },
                    })) || []
                  }
                  sortOptions={true}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  type="autoComplete"
                  name="RemoveContact"
                  label="Remove Contacts"
                  formControl={formControl}
                  multiple={true}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                  options={
                    groupInfo.data?.members
                      ?.filter((m) => m?.["@odata.type"] === "#microsoft.graph.orgContact")
                      ?.map((m) => ({
                        label: `${m.displayName} (${m.mail})`,
                        value: m.mail,
                        addedFields: { id: m.id },
                      })) || []
                  }
                  sortOptions={true}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">Group Settings</Typography>
              </Grid>

              {groupType === "Microsoft 365" && (
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="radio"
                    label="Group visibility"
                    name="visibility"
                    formControl={formControl}
                    isFetching={groupInfo.isFetching}
                    disabled={groupInfo.isFetching}
                    options={[
                      { label: "Public", value: "Public" },
                      { label: "Private", value: "Private" },
                    ]}
                  />
                </Grid>
              )}

              {(groupType === "Microsoft 365" || groupType === "Distribution List") && (
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="switch"
                    label="Let people outside the organization email the group"
                    name="allowExternal"
                    formControl={formControl}
                    isFetching={groupInfo.isFetching}
                    disabled={groupInfo.isFetching}
                  />
                </Grid>
              )}

              {groupType === "Microsoft 365" && (
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="switch"
                    label="Send Copies of team emails and events to team members inboxes"
                    name="sendCopies"
                    formControl={formControl}
                    isFetching={groupInfo.isFetching}
                    disabled={groupInfo.isFetching}
                  />
                </Grid>
              )}

              {groupType === "Microsoft 365" && (
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="switch"
                    label="Hide group mailbox from Outlook"
                    name="hideFromOutlookClients"
                    formControl={formControl}
                    isFetching={groupInfo.isFetching}
                    disabled={groupInfo.isFetching}
                  />
                </Grid>
              )}
              {groupType === "Microsoft 365" && (
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="switch"
                    label="Security Enabled"
                    name="securityEnabled"
                    formControl={formControl}
                    isFetching={groupInfo.isFetching}
                    disabled={groupInfo.isFetching}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </CippFormPage>
    </>
  );
};

EditGroup.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditGroup;
