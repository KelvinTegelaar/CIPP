import { Alert, Button, List, ListItem, SvgIcon, Typography } from "@mui/material";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import { CippFormComponent } from "/src/components/CippComponents/CippFormComponent";
import GDAPRoles from "/src/data/GDAPRoles";
import { Box, Stack } from "@mui/system";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { CippPropertyList } from "/src/components/CippComponents/CippPropertyList";

const Page = () => {
  const formControl = useForm({
    mode: "onChange",
  });

  const selectedRoles = useWatch({ control: formControl.control, name: "gdapRoles" });
  const customSuffix = useWatch({ control: formControl.control, name: "customSuffix" });

  const cippDefaults = [
    {
      label: "Application Administrator",
      value: "9b895d92-2cd3-44c7-9d02-a6ac2d5ea5c3",
    },
    {
      label: "User Administrator",
      value: "fe930be7-5e62-47db-91af-98c3a49a38b1",
    },
    {
      label: "Intune Administrator",
      value: "3a2c62db-5318-420d-8d74-23affee5d9d5",
    },
    {
      label: "Exchange Administrator",
      value: "29232cdf-9323-42fd-ade2-1d097af3e4de",
    },
    {
      label: "Security Administrator",
      value: "194ae4cb-b126-40b2-bd5b-6091b380977d",
    },
    {
      label: "Cloud App Security Administrator",
      value: "892c5842-a9a6-463a-8041-72aa08ca3cf6",
    },
    {
      label: "Cloud Device Administrator",
      value: "7698a772-787b-4ac8-901f-60d6b08affd2",
    },
    {
      label: "Teams Administrator",
      value: "69091246-20e8-4a56-aa4d-066075b2a7a8",
    },
    {
      label: "Sharepoint Administrator",
      value: "f28a1f50-f6e7-4571-818b-6a12f2af6b6c",
    },
    {
      label: "Authentication Policy Administrator",
      value: "0526716b-113d-4c15-b2c8-68e3c22b9f80",
    },
    {
      label: "Privileged Role Administrator",
      value: "e8611ab8-c189-46e8-94e1-60213ab1f814",
    },
    {
      label: "Privileged Authentication Administrator",
      value: "7be44c8a-adaf-4e2a-84d6-ab2649e08a13",
    },
  ];

  const handleDefaults = () => {
    formControl.setValue("gdapRoles", cippDefaults);
  };

  return (
    <>
      <CippFormPage
        queryKey="ListGDAPRoles"
        formControl={formControl}
        title="GDAP Roles"
        backButtonTitle="GDAP Roles"
        postUrl="/api/ExecAddGDAPRole"
      >
        <Stack spacing={2}>
          <Alert severity="info">
            <Typography variant="subtitle">
              For each role you select a new group will be created inside of your partner tenant
              called "M365 GDAP RoleName". Add your users to these new groups to set their GDAP
              permissions. If you need to segment your groups for different teams or to define
              custom permissions, use the Custom Suffix to create additional group mappings per
              role.
            </Typography>
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
            options={GDAPRoles.map((role) => ({ label: role.Name, value: role.ObjectId }))}
            multiple={true}
            creatable={false}
            required={true}
          />
          {selectedRoles?.some((role) => role.value === "62e90394-69f5-4237-9190-012177145e10") && (
            <Alert severity="warning">
              The Company Administrator role is a highly privileged role that should be used with
              caution. GDAP Relationships with this role will not be eligible for auto-extend.
            </Alert>
          )}
          {selectedRoles?.length > 0 && (
            <>
              <Alert severity="info">
                The following groups will be created in your partner tenant if they do not already
                exist:
              </Alert>
              <CippPropertyList
                propertyItems={selectedRoles.map((role) => {
                  return {
                    label: `M365 GDAP ${role.label}${customSuffix ? ` - ${customSuffix}` : ""}`,
                    value: GDAPRoles.find((r) => r.ObjectId === role.value).Description,
                  };
                })}
              />
            </>
          )}
        </Stack>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
