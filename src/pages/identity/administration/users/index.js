import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { Button } from "@mui/material";
import Link from "next/link";
import { useSettings } from "/src/hooks/use-settings.js";
import { CippUserActions } from "/src/components/CippComponents/CippUserActions.jsx";

const Page = () => {
  const pageTitle = "Users";
  const tenant = useSettings().currentTenant;

  const offCanvas = {
    extendedInfoFields: [
      "createdDateTime", // Created Date (UTC)
      "userPrincipalName", // UPN
      "givenName", // Given Name
      "surname", // Surname
      "jobTitle", // Job Title
      "assignedLicenses", // Licenses
      "businessPhones", // Business Phone
      "mobilePhone", // Mobile Phone
      "mail", // Mail
      "city", // City
      "department", // Department
      "onPremisesLastSyncDateTime", // OnPrem Last Sync
      "id", // Unique ID
      "otherMails", // Alternate Email Addresses
    ],
    actions: CippUserActions(),
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGraphRequest"
      cardButton={
        <>
          <Button component={Link} href="users/bulk-add">
            Bulk Add Users
          </Button>
          <Button component={Link} href="users/invite">
            Invite Guest
          </Button>
          <Button component={Link} href="users/add">
            Add User
          </Button>
        </>
      }
      apiData={{
        Endpoint: "users",
        manualPagination: true,
        $select:
          "id,accountEnabled,businessPhones,city,createdDateTime,companyName,country,department,displayName,faxNumber,givenName,isResourceAccount,jobTitle,mail,mailNickname,mobilePhone,onPremisesDistinguishedName,officeLocation,onPremisesLastSyncDateTime,otherMails,postalCode,preferredDataLocation,preferredLanguage,proxyAddresses,showInAddressList,state,streetAddress,surname,usageLocation,userPrincipalName,userType,assignedLicenses,onPremisesSyncEnabled",
        $count: true,
        $orderby: "displayName",
        $top: 999,
      }}
      apiDataKey="Results"
      actions={CippUserActions()}
      offCanvas={offCanvas}
      simpleColumns={[
        "accountEnabled",
        "userPrincipalName",
        "displayName",
        "mail",
        "businessPhones",
        "proxyAddresses",
        "assignedLicenses",
      ]}
      filters={[
        {
          filterName: "Account Enabled",
          //true or false filters by yes/no
          value: [{ id: "accountEnabled", value: "Yes" }],
          type: "column",
        },
        {
          filterName: "Account Disabled",
          value: [{ id: "accountEnabled", value: "No" }],
          type: "column",
        },
        {
          filterName: "Guest Accounts",
          value: [{ id: "userType", value: "Guest" }],
          type: "column",
        },
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
