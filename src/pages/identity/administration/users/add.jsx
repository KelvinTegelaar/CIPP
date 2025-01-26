import { Box } from "@mui/material";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import { CippFormUserSelector } from "/src/components/CippComponents/CippFormUserSelector";
import { useSettings } from "../../../../hooks/use-settings";
import { useEffect } from "react";

import CippAddEditUser from "../../../../components/CippFormPages/CippAddEditUser";
const Page = () => {
  const userSettingsDefaults = useSettings();

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
      usageLocation: userSettingsDefaults.usageLocation,
    },
  });

  const formValues = useWatch({ control: formControl.control, name: "userProperties" });
  useEffect(() => {
    if (formValues) {
      const { userPrincipalName, usageLocation, ...restFields } = formValues.addedFields || {};
      let newFields = { ...restFields };
      if (userPrincipalName) {
        const [mailNickname, domainNamePart] = userPrincipalName.split("@");
        if (mailNickname) {
          newFields.mailNickname = mailNickname;
        }
        if (domainNamePart) {
          newFields.primDomain = { label: domainNamePart, value: domainNamePart };
        }
      }
      if (usageLocation) {
        newFields.usageLocation = { label: usageLocation, value: usageLocation };
      }
      newFields.tenantFilter = userSettingsDefaults.currentTenant;
      formControl.reset(newFields);
    }
  }, [formValues]);
  return (
    <>
      <CippFormPage
        queryKey={`Users-${userSettingsDefaults.currentTenant}`}
        formControl={formControl}
        title="User"
        backButtonTitle="User Overview"
        postUrl="/api/AddUser"
      >
        <Box sx={{ my: 2 }}>
          <CippFormUserSelector
            formControl={formControl}
            name="userProperties"
            label="Copy properties from another user"
            multiple={false}
            select={
              "id,userPrincipalName,displayName,givenName,surname,mailNickname,jobTitle,department,streetAddress,postalCode,companyName,mobilePhone,businessPhones,usageLocation"
            }
            addedField={{
              groupType: "calculatedGroupType",
              displayName: "displayName",
              userPrincipalName: "userPrincipalName",
              id: "id",
              givenName: "givenName",
              surname: "surname",
              mailNickname: "mailNickname",
              jobTitle: "jobTitle",
              department: "department",
              streetAddress: "streetAddress",
              postalCode: "postalCode",
              companyName: "companyName",
              mobilePhone: "mobilePhone",
              businessPhones: "businessPhones",
              usageLocation: "usageLocation",
            }}
          />
        </Box>
        <Box sx={{ my: 2 }}>
          <CippAddEditUser formControl={formControl} userSettingsDefaults={userSettingsDefaults} />
        </Box>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
