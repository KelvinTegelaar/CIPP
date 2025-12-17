import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import { useDialog } from "../../../hooks/use-dialog";
import { CippApiDialog } from "../../../components/CippComponents/CippApiDialog";
import countryList from "/src/data/countryList.json";
import tabOptions from "./tabOptions.json";
import { useSettings } from "../../../hooks/use-settings";

const Page = () => {
  const pageTitle = "New User Default Templates";
  const createDialog = useDialog();
  const userSettings = useSettings();

  const actions = [
    {
      label: "Delete Template",
      type: "POST",
      url: "/api/RemoveUserDefaultTemplate",
      icon: <Delete />,
      data: { ID: "GUID" },
      confirmText: "Do you want to delete this User Default template?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "templateName",
      "defaultForTenant",
      "displayName",
      "usernameFormat",
      "primDomain",
      "usageLocation",
      "licenses",
      "jobTitle",
      "streetAddress",
      "city",
      "state",
      "postalCode",
      "country",
      "companyName",
      "department",
      "mobilePhone",
      "businessPhones",
    ],
    actions: actions,
  };

  const createTemplateAction = {
    label: "Create User Default Template",
    type: "POST",
    url: "/api/AddUserDefaults",

    relatedQueryKeys: [`ListNewUserDefaults-${userSettings.currentTenant}`],
  };

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={`/api/ListNewUserDefaults?includeAllTenants=false`}
        queryKey={`ListNewUserDefaults-${userSettings.currentTenant}`}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={[
          "templateName",
          "defaultForTenant",
          "displayName",
          "usernameFormat",
          "usageLocation",
          "department",
        ]}
        cardButton={
          <Button startIcon={<Add />} onClick={createDialog.handleOpen} sx={{ mr: 1 }}>
            Add Template
          </Button>
        }
      />

      <CippApiDialog
        createDialog={createDialog}
        title="Create User Default Template"
        api={createTemplateAction}
        defaultvalues={{ tenantFilter: userSettings.currentTenant }}
        fields={[
          {
            name: "tenantFilter",
            type: "hidden",
          },
          {
            label: "Template Name",
            name: "templateName",
            type: "textField",
            required: true,
          },
          {
            label: "Default for Tenant",
            name: "defaultForTenant",
            type: "switch",
          },
          {
            label: "Display Name Suffix (e.g., ' - Contractor' or ' (External)')",
            name: "displayName",
            type: "textField",
          },
          {
            label: "Username Format",
            name: "usernameFormat",
            type: "autoComplete",
            options: [
              { label: "%FirstName%.%LastName% (john.doe)", value: "%FirstName%.%LastName%" },
              { label: "%FirstName%%LastName% (johndoe)", value: "%FirstName%%LastName%" },
              { label: "%LastName%.%FirstName% (doe.john)", value: "%LastName%.%FirstName%" },
              { label: "%LastName%%FirstName% (doejohn)", value: "%LastName%%FirstName%" },
              { label: "%FirstName%_%LastName% (john_doe)", value: "%FirstName%_%LastName%" },
              { label: "%LastName%_%FirstName% (doe_john)", value: "%LastName%_%FirstName%" },
              { label: "%FirstName%-%LastName% (john-doe)", value: "%FirstName%-%LastName%" },
              { label: "%LastName%-%FirstName% (doe-john)", value: "%LastName%-%FirstName%" },
              { label: "%FirstName[1]%%LastName% (jdoe)", value: "%FirstName[1]%%LastName%" },
              { label: "%FirstName[2]%%LastName% (jodoe)", value: "%FirstName[2]%%LastName%" },
              { label: "%FirstName[3]%%LastName% (johdoe)", value: "%FirstName[3]%%LastName%" },
              { label: "%FirstName%.%LastName[1]% (john.d)", value: "%FirstName%.%LastName[1]%" },
              { label: "%FirstName%%LastName[1]% (johnd)", value: "%FirstName%%LastName[1]%" },
              { label: "%FirstName[1]%.%LastName% (j.doe)", value: "%FirstName[1]%.%LastName%" },
              { label: "%LastName% (doe)", value: "%LastName%" },
              { label: "%FirstName% (john)", value: "%FirstName%" },
            ],
            multiple: false,
            creatable: true,
          },
          {
            label: "Primary Domain",
            name: "primDomain",
            type: "autoComplete",
            api: {
              url: "/api/ListDomains",
              labelField: "id",
              valueField: "id",
              queryKey: "ListDomains",
            },
            multiple: false,
            creatable: false,
          },
          {
            label: "Add Aliases",
            name: "addedAliases",
            type: "textField",
            multiline: true,
            rows: 4,
          },
          {
            label: "Usage Location",
            name: "usageLocation",
            type: "autoComplete",
            options: countryList.map(({ Code, Name }) => ({
              label: Name,
              value: Code,
            })),
            multiple: false,
            creatable: false,
          },
          {
            label: "Licenses",
            name: "licenses",
            type: "autoComplete",
            api: {
              url: "/api/ListLicenses",
              labelField: (option) =>
                `${option.displayName || option.SkuPartNumber} (${
                  option.AvailableUnits || 0
                } available)`,
              valueField: "skuId",
              queryKey: "ListLicenses",
              dataKey: "SkuList",
            },
            multiple: true,
            creatable: false,
          },
          {
            label: "Job Title",
            name: "jobTitle",
            type: "textField",
          },
          {
            label: "Street",
            name: "streetAddress",
            type: "textField",
          },
          {
            label: "City",
            name: "city",
            type: "textField",
          },
          {
            label: "State/Province",
            name: "state",
            type: "textField",
          },
          {
            label: "Postal Code",
            name: "postalCode",
            type: "textField",
          },
          {
            label: "Country",
            name: "country",
            type: "textField",
          },
          {
            label: "Company Name",
            name: "companyName",
            type: "textField",
          },
          {
            label: "Department",
            name: "department",
            type: "textField",
          },
          {
            label: "Mobile #",
            name: "mobilePhone",
            type: "textField",
          },
          {
            label: "Business #",
            name: "businessPhones[0]",
            type: "textField",
          },
        ]}
      />
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
