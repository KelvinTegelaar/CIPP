import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

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

  /* Filters not supported in the current structure, need dev attention for integration.
  filterlist: [
    { filterName: 'Enabled users', filter: '"accountEnabled":true' },
    { filterName: 'Non-guest users', filter: 'Complex: UPN notlike #EXT#' },
    { filterName: 'Licensed users', filter: 'Complex: IsLicensed eq true' },
    { filterName: 'Enabled, licensed non-guest users missing MFA', filter: 'Complex: UPN notlike #EXT#; IsLicensed eq true; accountEnabled eq true; MFARegistration ne true' },
    { filterName: 'No MFA methods registered', filter: 'Complex: MFARegistration ne true' },
    { filterName: 'MFA methods registered', filter: 'Complex: MFARegistration eq true' },
  ],
  */

  return <CippTablePage title={pageTitle} apiUrl={apiUrl} simpleColumns={simpleColumns} />;
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
