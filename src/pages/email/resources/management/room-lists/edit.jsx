import { useEffect, useState } from "react";
import { Box, Button, Divider, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormUserSelector } from "/src/components/CippComponents/CippFormUserSelector";
import { useRouter } from "next/router";
import { ApiGetCall } from "../../../../../api/ApiCall";
import { useSettings } from "../../../../../hooks/use-settings";
import { CippDataTable } from "../../../../../components/CippTable/CippDataTable";

const EditRoomList = () => {
  const router = useRouter();
  const { groupId } = router.query;
  const [groupIdReady, setGroupIdReady] = useState(false);
  const [showMembershipTable, setShowMembershipTable] = useState(false);
  const [combinedData, setCombinedData] = useState([]);
  const [originalAllowExternal, setOriginalAllowExternal] = useState(null);
  const tenantFilter = useSettings().currentTenant;

  const groupInfo = ApiGetCall({
    url: `/api/ListRoomLists?groupID=${groupId}&tenantFilter=${tenantFilter}&members=true&owners=true`,
    queryKey: `ListRoomLists-${groupId}`,
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
    },
  });

  useEffect(() => {
    if (groupInfo.isSuccess) {
      const group = groupInfo.data?.groupInfo;
      if (group) {
        // Create combined data for the table
        const owners = Array.isArray(groupInfo.data?.owners) ? groupInfo.data.owners : [];
        const members = Array.isArray(groupInfo.data?.members) ? groupInfo.data.members : [];

        const combinedData = [
          ...owners.map((o) => ({
            type: "Owner",
            userPrincipalName: o.userPrincipalName,
            displayName: o.displayName,
          })),
          ...members.map((m) => ({
            type: "Room",
            userPrincipalName: m.PrimarySmtpAddress || m.userPrincipalName || m.mail,
            displayName: m.DisplayName || m.displayName,
          })),
        ];
        setCombinedData(combinedData);

        // Store original allowExternal value for comparison
        const allowExternalValue = groupInfo?.data?.allowExternal;
        setOriginalAllowExternal(allowExternalValue);

        // Reset the form with all values
        formControl.reset({
          tenantFilter: tenantFilter,
          mail: group.PrimarySmtpAddress || group.mail,
          mailNickname: group.Alias || group.mailNickname || "",
          allowExternal: allowExternalValue,
          displayName: group.DisplayName || group.displayName,
          description: group.Description || group.description || "",
          groupId: group.Guid || group.id,
          groupType: "Room List",
          // Initialize empty arrays for add/remove actions
          AddMember: [],
          RemoveMember: [],
          AddOwner: [],
          RemoveOwner: [],
        });
      }
    }
  }, [groupInfo.isSuccess, router.query, groupInfo.isFetching]);

  return (
    <>
      <CippFormPage
        formControl={formControl}
        queryKey={[`ListRoomLists-${groupId}`]}
        title={`Room List: ${
          groupInfo.data?.groupInfo?.DisplayName || groupInfo.data?.groupInfo?.displayName || ""
        }`}
        formPageType="Edit"
        backButtonTitle="Room Lists"
        postUrl="/api/EditRoomList"
        customDataformatter={(values) => {
          // Only include allowExternal if it has changed from the original value
          const modifiedValues = { ...values };
          if (originalAllowExternal !== null && values.allowExternal === originalAllowExternal) {
            delete modifiedValues.allowExternal;
          }
          return modifiedValues;
        }}
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
                <Typography variant="h6">Room List Properties</Typography>
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

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">Add Members</Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  type="autoComplete"
                  name="AddMember"
                  label="Add Room Mailboxes"
                  formControl={formControl}
                  multiple={true}
                  creatable={false}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                  api={{
                    url: "/api/ListRooms",
                    labelField: (room) =>
                      `${room.displayName || "Unknown"} (${
                        room.mail || room.userPrincipalName || "No email"
                      })`,
                    valueField: "mail",
                    addedField: {
                      roomType: "bookingType",
                      capacity: "capacity",
                      id: "id",
                    },
                    queryKey: `rooms-${tenantFilter}`,
                    showRefresh: true,
                    dataFilter: (rooms) => {
                      // Get current member emails to filter out
                      const members = Array.isArray(groupInfo.data?.members)
                        ? groupInfo.data.members
                        : [];
                      const currentMemberEmails = members
                        .map((m) => m.mail || m.userPrincipalName)
                        .filter(Boolean);

                      // Filter out rooms that are already members
                      // rooms here have been transformed to {label, value, addedFields} format
                      const filteredRooms = rooms.filter((room) => {
                        const roomEmail = room.value; // email is in the value field
                        const isAlreadyMember = currentMemberEmails.includes(roomEmail);
                        return !isAlreadyMember;
                      });

                      return filteredRooms;
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  type="autoComplete"
                  name="AddOwner"
                  label="Add Owners"
                  formControl={formControl}
                  multiple={true}
                  creatable={false}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                  api={{
                    url: "/api/ListUsers",
                    labelField: (user) =>
                      `${user.displayName || "Unknown"} (${
                        user.userPrincipalName || user.mail || "No email"
                      })`,
                    valueField: "userPrincipalName",
                    addedField: {
                      id: "id",
                    },
                    queryKey: `users-${tenantFilter}`,
                    showRefresh: true,
                    dataFilter: (users) => {
                      // Get current owner userPrincipalNames to filter out
                      const owners = Array.isArray(groupInfo.data?.owners)
                        ? groupInfo.data.owners
                        : [];
                      const currentOwnerEmails = owners
                        .map((o) => o.userPrincipalName)
                        .filter(Boolean);

                      // Filter out users that are already owners
                      // users here have been transformed to {label, value, addedFields} format
                      const filteredUsers = users.filter((user) => {
                        const userEmail = user.value; // userPrincipalName is in the value field
                        const isAlreadyOwner = currentOwnerEmails.includes(userEmail);
                        return !isAlreadyOwner;
                      });

                      return filteredUsers;
                    },
                  }}
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
                  label="Remove Room Mailboxes"
                  formControl={formControl}
                  multiple={true}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                  options={
                    Array.isArray(groupInfo.data?.members)
                      ? groupInfo.data.members.map((m) => ({
                          label: `${m.DisplayName || m.displayName || "Unknown"} (${
                            m.PrimarySmtpAddress || m.userPrincipalName || m.mail
                          })`,
                          value: m.PrimarySmtpAddress || m.userPrincipalName || m.mail,
                          addedFields: { id: m.ExternalDirectoryObjectId || m.id },
                        }))
                      : []
                  }
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
                    Array.isArray(groupInfo.data?.owners)
                      ? groupInfo.data.owners.map((o) => ({
                          label: `${o.displayName} (${o.userPrincipalName})`,
                          value: o.userPrincipalName,
                          addedFields: { id: o.id },
                        }))
                      : []
                  }
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">Room List Settings</Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  type="switch"
                  label="Let people outside the organization email the room list"
                  name="allowExternal"
                  formControl={formControl}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </CippFormPage>
    </>
  );
};

EditRoomList.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditRoomList;
