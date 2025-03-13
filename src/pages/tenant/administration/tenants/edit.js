import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm } from "react-hook-form";
import { ApiGetCall } from "../../../../api/ApiCall";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import {
  Stack,
  Box,
  Tab,
  Tabs,
  CardContent,
  Button,
  SvgIcon,
  Alert,
  Typography,
  Grid,
} from "@mui/material";
import { CippCardTabPanel } from "/src/components/CippComponents/CippCardTabPanel";
import { PlusIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { CippDataTable } from "/src/components/CippTable/CippDataTable";
import { CippApiResults } from "/src/components/CippComponents/CippApiResults";
import { ApiPostCall } from "../../../../api/ApiCall";
import CippFormSection from "/src/components/CippFormPages/CippFormSection";
import CippPageCard from "../../../../components/CippCards/CippPageCard";
import { CippApiDialog } from "/src/components/CippComponents/CippApiDialog";
import { CippPropertyListCard } from "/src/components/CippCards/CippPropertyListCard";
import { getCippFormatting } from "../../../../utils/get-cipp-formatting";

function tabProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Page = () => {
  const router = useRouter();
  const { id } = router.query;
  const formControl = useForm({
    mode: "onChange",
  });
  const [value, setValue] = useState(0);
  const [customVariables, setCustomVariables] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const tenantDetails = ApiGetCall({
    url: id ? `/api/ListTenantDetails?tenantFilter=${id}` : null,
    queryKey: id ? `TenantProperties_${id}` : null,
  });

  const updateCustomVariablesApi = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [
      `CustomVariables_${id}`,
      "TenantSelector",
      "ListTenants-notAllTenants",
      `TenantProperties-${id}`,
    ],
  });

  useEffect(() => {
    if (tenantDetails.isSuccess && tenantDetails.data) {
      formControl.reset({
        customerId: id,
        Alias: tenantDetails?.data?.customProperties?.Alias ?? "",
        Groups:
          tenantDetails.data.Groups?.map((group) => ({
            label: group.groupName,
            value: group.groupId,
          })) || [],
      });
    }
  }, [tenantDetails.isSuccess, tenantDetails.data]);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleAddVariable = () => {
    setOpenAddDialog(true);
  };

  const actions = [
    {
      label: "Edit",
      icon: (
        <SvgIcon>
          <PencilIcon />
        </SvgIcon>
      ),
      confirmText: "Update the custom variable '[RowKey]'?",
      hideBulk: true,
      setDefaultValues: true,
      fields: [
        {
          type: "textField",
          name: "RowKey",
          label: "Key",
          placeholder: "Enter the key for the custom variable.",
          required: true,
          validators: {
            validate: (value) => {
              if (!value.includes(" ") && !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(value)) {
                return true;
              } else {
                return "The variable name must not contain spaces or special characters.";
              }
            },
          },
        },
        {
          type: "textField",
          name: "Value",
          label: "Value",
          placeholder: "Enter the value for the custom variable.",
          required: true,
        },
      ],
      type: "POST",
      url: "/api/ExecCippReplacemap",
      data: {
        Action: "!AddEdit",
        customerId: id,
      },
      relatedQueryKeys: [`CustomVariables_${id}`],
    },
    {
      label: "Delete",
      icon: <TrashIcon />,
      confirmText: "Are you sure you want to delete [RowKey]?",
      type: "POST",
      url: "/api/ExecCippReplacemap",
      data: {
        Action: "Delete",
        RowKey: "RowKey",
        customerId: id,
      },
      relatedQueryKeys: [`CustomVariables_${id}`],
      multiPost: false,
    },
  ];

  return (
    <CippPageCard
      title={
        tenantDetails.isSuccess
          ? `Edit Tenant - ${
              tenantDetails?.data?.customProperties?.tenantAlias ?? tenantDetails?.data?.displayName
            }`
          : "Loading..."
      }
      backButtonTitle="Tenants"
      noTenantInHead={true}
    >
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: "24px", m: "auto" }}>
          <Tabs value={value} onChange={handleTabChange} aria-label="Edit Tenant Tabs">
            <Tab label="General" {...tabProps(0)} />
            <Tab label="Custom Variables" {...tabProps(1)} />
          </Tabs>
        </Box>
        <CippCardTabPanel value={value} index={0}>
          <Grid container spacing={2} sx={{ my: 2, px: 2 }}>
            <Grid item xs={12} md={4}>
              <CippPropertyListCard
                variant="outlined"
                title="Tenant Details"
                propertyItems={[
                  { label: "Display Name", value: tenantDetails.data?.displayName },
                  {
                    label: "Tenant ID",
                    value: getCippFormatting(tenantDetails.data?.id, "Tenant"),
                  },
                ]}
                showDivider={false}
                isFetching={tenantDetails.isFetching}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <CippFormSection
                relatedQueryKeys={[
                  `TenantProperties_${id}`,
                  "ListTenants-notAllTenants",
                  "TenantSelector",
                ]}
                formControl={formControl}
                title="Edit Tenant"
                backButtonTitle="Tenants"
                postUrl="/api/EditTenant"
                customDataformatter={(values) => {
                  const formattedValues = {
                    tenantAlias: values.tenantAlias,
                    tenantGroups: values.Groups.map((group) => ({
                      groupId: group.value,
                      groupName: group.label,
                    })),
                  };
                  return formattedValues;
                }}
              >
                <Typography variant="h6">Properties</Typography>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  <CippFormComponent
                    type="textField"
                    name="Alias"
                    label="Tenant Alias"
                    placeholder="Enter a custom alias for this tenant to be displayed in CIPP."
                    formControl={formControl}
                    isFetching={tenantDetails.isFetching}
                    disabled={tenantDetails.isFetching}
                  />
                  <CippFormComponent
                    type="autoComplete"
                    name="Groups"
                    label="Tenant Groups"
                    placeholder="Select the groups this tenant belongs to."
                    formControl={formControl}
                    multiple
                    options={
                      tenantDetails.data?.availableGroups?.map((group) => ({
                        label: group.groupName,
                        value: group.groupId,
                      })) || []
                    }
                    disabled={tenantDetails.isFetching}
                  />
                </Stack>
              </CippFormSection>
            </Grid>
          </Grid>
        </CippCardTabPanel>
        <CippCardTabPanel value={value} index={1}>
          <CardContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Custom variables are key-value pairs that can be used to store additional information
              about a tenant. These are applied to templates in standards using the format
              %VariableName%.
            </Alert>
            <CippDataTable
              queryKey={`CustomVariables_${id}`}
              title="Custom Variables"
              actions={actions}
              api={{
                url: `/api/ExecCippReplacemap?Action=List&customerId=${id}`,
                dataKey: "Results",
              }}
              simpleColumns={["RowKey", "Value"]}
              cardButton={
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleAddVariable}
                  startIcon={
                    <SvgIcon fontSize="small">
                      <PlusIcon />
                    </SvgIcon>
                  }
                >
                  Add Variable
                </Button>
              }
            />
            <CippApiResults apiObject={updateCustomVariablesApi} />
          </CardContent>
        </CippCardTabPanel>
      </Box>

      <CippApiDialog
        createDialog={{
          open: openAddDialog,
          handleClose: () => setOpenAddDialog(false),
        }}
        title="Add Variable"
        fields={[
          {
            type: "textField",
            name: "RowKey",
            label: "Key",
            placeholder: "Enter the key for the custom variable.",
            required: true,
            validators: {
              validate: (value) => {
                if (!value.includes(" ") && !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(value)) {
                  return true;
                } else {
                  return "The variable name must not contain spaces or special characters.";
                }
              },
            },
          },
          {
            type: "textField",
            name: "Value",
            label: "Value",
            placeholder: "Enter the value for the custom variable.",
            required: true,
          },
        ]}
        api={{
          type: "POST",
          url: "/api/ExecCippReplacemap",
          data: { Action: "AddEdit", customerId: id },
          relatedQueryKeys: [`CustomVariables_${id}`],
        }}
      />
    </CippPageCard>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
