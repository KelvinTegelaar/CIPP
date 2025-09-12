import React, { useState, useEffect } from "react";
import { Button, Box } from "@mui/material";
import { useForm, useWatch, useFormState } from "react-hook-form";
import { PersonAdd } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import { CippFormUserSelector } from "./CippFormUserSelector";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "../../hooks/use-settings";
import { ApiPostCall } from "../../api/ApiCall";
import CippAddEditUser from "../CippFormPages/CippAddEditUser";

export const CippAddUserDrawer = ({
  buttonText = "Add User",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const userSettingsDefaults = useSettings();

  const formControl = useForm({
    mode: "onBlur",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
      usageLocation: userSettingsDefaults.usageLocation,
    },
  });

  const createUser = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: [`Users-${userSettingsDefaults.currentTenant}`],
  });

  const { isValid, isDirty } = useFormState({ control: formControl.control });

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

  useEffect(() => {
    if (createUser.isSuccess) {
      formControl.reset({
        tenantFilter: userSettingsDefaults.currentTenant,
        usageLocation: userSettingsDefaults.usageLocation,
      });
    }
  }, [createUser.isSuccess]);

  const handleSubmit = () => {
    formControl.trigger();
    if (!isValid) {
      return;
    }
    const values = formControl.getValues();
    Object.keys(values).forEach((key) => {
      if (values[key] === "" || values[key] === null) {
        delete values[key];
      }
    });
    createUser.mutate({
      url: "/api/AddUser",
      data: values,
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset({
      tenantFilter: userSettingsDefaults.currentTenant,
      usageLocation: userSettingsDefaults.usageLocation,
    });
  };

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={<PersonAdd />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Add User"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="xl"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={formControl.handleSubmit(handleSubmit)}
              disabled={createUser.isPending || !isValid || (!isDirty && !createUser.isSuccess)}
            >
              {createUser.isPending
                ? "Creating User..."
                : createUser.isSuccess
                ? "Create Another User"
                : "Create User"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </div>
        }
      >
        <Box sx={{ my: 2 }}>
          <CippFormUserSelector
            formControl={formControl}
            name="userProperties"
            label="Copy properties from another user"
            multiple={false}
            select={
              "id,userPrincipalName,displayName,givenName,surname,mailNickname,jobTitle,department,streetAddress,city,state,postalCode,companyName,mobilePhone,businessPhones,usageLocation,office"
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
              city: "city",
              state: "state",
              postalCode: "postalCode",
              companyName: "companyName",
              mobilePhone: "mobilePhone",
              businessPhones: "businessPhones",
              usageLocation: "usageLocation",
              office: "office",
            }}
          />
        </Box>
        <Box sx={{ my: 2 }}>
          <CippAddEditUser
            formControl={formControl}
            userSettingsDefaults={userSettingsDefaults}
            formType="add"
          />
        </Box>
        <CippApiResults apiObject={createUser} />
      </CippOffCanvas>
    </>
  );
};
