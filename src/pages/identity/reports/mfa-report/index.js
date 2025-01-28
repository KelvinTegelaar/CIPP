import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { LockPerson } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "MFA Report";
  const apiUrl = "/api/ListMFAUsers";
  const simpleColumns = [
    "UPN",
    "AccountEnabled",
    "isLicensed",
    "MFARegistration",
    "PerUser",
    "CoveredBySD",
    "CoveredByCA",
    "MFAMethods",
    "CAPolicies",
  ];
  const filters = [
    {
      filterName: "Enabled, licensed users",
      value: [
        { id: "AccountEnabled", value: "Yes" },
        { id: "isLicensed", value: "Yes" },
      ],
      type: "column",
    },
    {
      filterName: "Enabled, licensed users missing MFA",
      value: [
        { id: "AccountEnabled", value: "Yes" },
        { id: "isLicensed", value: "Yes" },
        { id: "MFARegistration", value: "No" },
      ],
      type: "column",
    },
    {
      filterName: "No MFA methods registered",
      value: [{ id: "MFARegistration", value: "No" }],
      type: "column",
    },
    {
      filterName: "MFA methods registered",
      value: [{ id: "MFARegistration", value: "Yes" }],
      type: "column",
    },
  ];

  const actions = [
    {
      label: "Set Per-User MFA",
      type: "POST",
      icon: <LockPerson />,
      url: "/api/ExecPerUserMFA",
      data: { userId: "UPN" },
      fields: [
        {
          type: "autoComplete",
          name: "State",
          label: "State",
          options: [
            { label: "Enforced", value: "Enforced" },
            { label: "Enabled", value: "Enabled" },
            { label: "Disabled", value: "Disabled" },
          ],
          multiple: false,
          creatable: false,
        },
      ],
      confirmText: "Are you sure you want to set per-user MFA for these users?",
      multiPost: false,
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      simpleColumns={simpleColumns}
      filters={filters}
      actions={actions}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
