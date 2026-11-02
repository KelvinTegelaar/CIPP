import React, { useState } from "react";
import { CippIcons } from "../../../../utils/icon-registry";
import { Alert, Button, SvgIcon, Typography, Tooltip, Link } from "@mui/material";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "../../../../layouts/index";
import { useForm } from "react-hook-form";
import { CippFormComponent } from "../../../../components/CippComponents/CippFormComponent";
import GDAPRoles from "../../../../data/GDAPRoles";
import { Box, Stack, Grid } from "@mui/system";
import { ApiGetCall } from "../../../../api/ApiCall";
import { CippDataTable } from "../../../../components/CippTable/CippDataTable";

const Page = () => {
  const formControl = useForm({
    mode: "onChange",
  });

  const [advancedMappings, setAdvancedMappings] = useState([]);

  const groupList = ApiGetCall({
    url: "/api/ExecAddGDAPRole?Action=ListGroups",
    queryKey: "ListGroups",
  });

  const handleAddMapping = () => {
    const selectedGroup = formControl.getValues("selectedGroup");
    const selectedRole = formControl.getValues("selectedRole");

    if (!selectedGroup || !selectedRole) {
      return;
    }

    const newMapping = {
      groupName: selectedGroup.label,
      groupId: selectedGroup.value,
      roleName: selectedRole.label,
      roleDefinitionId: selectedRole.value,
    };

    if (
      advancedMappings.some(
        (mapping) =>
          mapping.groupId === newMapping.groupId &&
          mapping.roleDefinitionId === newMapping.roleDefinitionId
      )
    ) {
      return;
    }

    setAdvancedMappings([...advancedMappings, newMapping]);
    formControl.setValue("selectedGroup", null); // Clear the selected group
    formControl.setValue("selectedRole", null); // Clear the selected role
  };

  const handleRemoveMapping = (mappingToRemove) => {
    const updatedMappings = advancedMappings.filter(
      (mapping) =>
        mapping.groupId !== mappingToRemove.groupId ||
        mapping.roleDefinitionId !== mappingToRemove.roleDefinitionId
    );
    setAdvancedMappings(updatedMappings);
  };

  return (
    <>
      <CippFormPage
        queryKey="ListGDAPRoles"
        formControl={formControl}
        title="Map an existing group (Advanced)"
        backButtonTitle="Group Mappings"
        postUrl="/api/ExecAddGDAPRole"
        customDataformatter={() => ({
          Action: "AddRoleAdvanced",
          Mappings: advancedMappings,
        })}
      >
        <Stack spacing={2}>
          <Alert severity="warning">
            <Typography variant="subtitle">
              Role templates create and map groups for you - use this page only for groups that
              already exist and do not match the default naming convention. Use extreme caution
              when mapping roles here.
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Limitations
            </Typography>
            <ul style={{ paddingLeft: "15px" }}>
              <li>
                <b>Reserved groups and roles are unavailable for mapping</b>, this is to prevent
                misconfigurations due to permission overlap.
              </li>
              <li>
                <b>Only one role can be mapped per group</b>. If your current configuration maps
                more than one, use the Reset Role Mapping action on the Relationship.
              </li>
              <li>
                <b>Certain roles may not be compatible with GDAP</b>. See the{" "}
                <Link href="https://learn.microsoft.com/en-us/partner-center/customers/gdap-least-privileged-roles-by-task">
                  Microsoft Documentation
                </Link>{" "}
                on GDAP Role Guidance.
              </li>
            </ul>
          </Alert>
          <Grid container spacing={2} sx={{
            alignItems: "center"
          }}>
            <Grid size={{ md: 5, xs: 12 }}>
              <CippFormComponent
                formControl={formControl}
                name="selectedGroup"
                label="Select Group"
                type="autoComplete"
                options={groupList.data?.Results?.map((group) => ({
                  label: group.displayName,
                  value: group.id,
                }))}
                isFetching={groupList.isFetching}
                multiple={false}
                required={true}
                creatable={false}
                sortOptions={true}
              />
            </Grid>
            <Grid>
              <Box sx={{ my: "auto" }}>
                <SvgIcon>
                  <CippIcons.SyncAlt />
                </SvgIcon>
              </Box>
            </Grid>
            <Grid size={{ md: 5, xs: 12 }}>
              <CippFormComponent
                formControl={formControl}
                name="selectedRole"
                label="Select GDAP Role"
                type="autoComplete"
                options={GDAPRoles.filter(
                  (role) =>
                    role.ObjectId !== "62e90394-69f5-4237-9190-012177145e10" && // Partner Tier 1
                    role.ObjectId !== "17315797-102d-40b4-93e0-432062caca18" // Partner Tier 2
                ).map((role) => ({ label: role.Name, value: role.ObjectId }))}
                multiple={false}
                required={true}
                creatable={false}
                sortOptions={true}
              />
            </Grid>
            <Grid size={{ md: 1, xs: 12 }}>
              <Tooltip title="Add Mapping">
                <Button size="small" onClick={handleAddMapping} variant="contained">
                  <SvgIcon fontSize="small">
                    <CippIcons.PlusSmallIcon />
                  </SvgIcon>
                </Button>
              </Tooltip>
            </Grid>
          </Grid>
          <CippDataTable
            title="Role Mappings"
            data={advancedMappings ?? []}
            simpleColumns={["groupName", "roleName"]}
            cardProps={{ variant: "outlined" }}
            actions={[
              {
                label: "Remove",
                icon: (
                  <SvgIcon fontSize="small">
                    <CippIcons.TrashIcon />
                  </SvgIcon>
                ),
                customFunction: handleRemoveMapping,
                noConfirm: true,
              },
            ]}
          />
        </Stack>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
