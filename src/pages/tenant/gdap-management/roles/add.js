import React, { useState } from "react";
import { Alert, Button, SvgIcon, Typography, Tooltip, Link } from "@mui/material";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import { CippFormComponent } from "/src/components/CippComponents/CippFormComponent";
import { CippFormCondition } from "/src/components/CippComponents/CippFormCondition";
import GDAPRoles from "/src/data/GDAPRoles";
import { Box, Stack, Grid } from "@mui/system";
import { ShieldCheckIcon, PlusSmallIcon } from "@heroicons/react/24/outline";
import { CippPropertyList } from "/src/components/CippComponents/CippPropertyList";
import cippDefaults from "/src/data/CIPPDefaultGDAPRoles";
import { ApiGetCall } from "/src/api/ApiCall";
import { Settings, SyncAlt } from "@mui/icons-material";
import { CippDataTable } from "/src/components/CippTable/CippDataTable";
import { TrashIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      advancedMode: false,
    },
  });

  const selectedGdapRoles = useWatch({
    control: formControl.control,
    name: "gdapRoles",
  });

  const customSuffix = useWatch({
    control: formControl.control,
    name: "customSuffix",
  });
  const [advancedMappings, setAdvancedMappings] = useState([]);

  const handleDefaults = () => {
    formControl.setValue("gdapRoles", cippDefaults, { shouldDirty: true });
    formControl.trigger();
  };

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
        title="GDAP Roles"
        backButtonTitle="GDAP Roles"
        postUrl="/api/ExecAddGDAPRole"
        customDataformatter={(values) => {
          if (values.advancedMode) {
            return {
              Action: "AddRoleAdvanced",
              Mappings: advancedMappings,
            };
          } else {
            return values;
          }
        }}
      >
        <Box display="flex" width="100%" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" width="100%">
            GDAP Roles
          </Typography>
          <Tooltip title="Advanced Mode">
            <Stack direction="row" alignItems="center">
              <SvgIcon fontSize="small">
                <Settings />
              </SvgIcon>
              <CippFormComponent formControl={formControl} name="advancedMode" type="switch" />
            </Stack>
          </Tooltip>
        </Box>
        <Stack spacing={2}>
          <CippFormCondition
            formControl={formControl}
            field="advancedMode"
            compareType="is"
            compareValue={false}
          >
            <Alert severity="info">
              <Typography variant="subtitle">
                For each role you select a new group will be created inside of your partner tenant
                called "M365 GDAP RoleName". Add your users to these new groups to set their GDAP
                permissions. If you need to segment your groups for different teams or to define
                custom permissions, use the Custom Suffix to create additional group mappings per
                role.
              </Typography>
            </Alert>
            <Alert severity="warning">
              <b>Certain roles may not be compatible with GDAP</b>. See the{" "}
              <Link href="https://learn.microsoft.com/en-us/partner-center/customers/gdap-least-privileged-roles-by-task">
                Microsoft Documentation
              </Link>{" "}
              on GDAP Role Guidance.
            </Alert>
            <Box>
              <CippFormComponent
                formControl={formControl}
                name="customSuffix"
                label="Custom Suffix (optional)"
                type="textField"
              />
            </Box>
            <Box>
              <Button
                onClick={handleDefaults}
                startIcon={
                  <SvgIcon fontSize="small">
                    <ShieldCheckIcon />
                  </SvgIcon>
                }
              >
                Add CIPP Default Roles
              </Button>
            </Box>
            <CippFormComponent
              formControl={formControl}
              name="gdapRoles"
              label="Select GDAP Roles"
              type="autoComplete"
              options={GDAPRoles.filter(
                (role) =>
                  role.ObjectId !== "7495fdc4-34c4-4d15-a289-98788ce399fd" &&
                  role.ObjectId !== "aaf43236-0c0d-4d5f-883a-6955382ac081"
              ).map((role) => ({ label: role.Name, value: role.ObjectId }))}
              multiple={true}
              creatable={false}
              required={true}
              validators={{
                validate: (value) => {
                  if (!value || value.length === 0) {
                    return "Please select at least one GDAP Role";
                  }
                  return true;
                },
              }}
              sortOptions={true}
            />
            <CippFormCondition
              formControl={formControl}
              field="gdapRoles"
              compareType="arrayLength"
              compareValue={1}
            >
              <Alert severity="info">
                The following groups will be created in your partner tenant if they do not already
                exist:
              </Alert>
              <CippPropertyList
                propertyItems={selectedGdapRoles?.map((role) => ({
                  label: `M365 GDAP ${role.label}${customSuffix ? ` - ${customSuffix}` : ""}`,
                  value: GDAPRoles.find((r) => r.ObjectId === role.value).Description,
                }))}
              />
            </CippFormCondition>
            <CippFormCondition
              formControl={formControl}
              field="gdapRoles"
              compareType="valueEq"
              compareValue="62e90394-69f5-4237-9190-012177145e10"
            >
              <Alert severity="warning">
                The Company Administrator role is a highly privileged role that should be used with
                caution. GDAP Relationships with this role will not be eligible for auto-extend.
              </Alert>
            </CippFormCondition>
          </CippFormCondition>

          <CippFormCondition
            formControl={formControl}
            field="advancedMode"
            compareType="is"
            compareValue={true}
          >
            <Alert severity="warning">
              <Typography variant="subtitle">
                In Advanced Mode, you can manually map existing groups to GDAP roles. This
                functionality is designed to help map existing groups to GDAP roles that do not
                match the default naming convention. Use extreme caution when mapping roles in this
                mode.
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
            <Grid container spacing={2} alignItems="center">
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
                    <SyncAlt />
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
                      <PlusSmallIcon />
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
                      <TrashIcon />
                    </SvgIcon>
                  ),
                  customFunction: handleRemoveMapping,
                  noConfirm: true,
                },
              ]}
            />
          </CippFormCondition>
        </Stack>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
