import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { Stack, Typography } from "@mui/material";
import CippFormSection from "/src/components/CippFormPages/CippFormSection";
import { CippFormTenantSelector } from "./CippFormTenantSelector";

const CippAddEditTenantGroups = ({ formControl, initialValues, title, backButtonTitle }) => {
  return (
    <CippFormSection
      formControl={formControl}
      title={title}
      backButtonTitle={backButtonTitle}
      postUrl="/api/ExecTenantGroup"
      relatedQueryKeys={["TenantGroupListPage"]}
      resetForm={false}
      customDataformatter={(values) => {
        return {
          ...values,
          Action: "AddEdit",
        };
      }}
      initialValues={initialValues}
    >
      <Typography variant="h6">Properties</Typography>
      <Stack spacing={1} sx={{ mt: 2 }}>
        <CippFormComponent
          type="textField"
          name="groupName"
          label="Group Name"
          placeholder="Enter the name for this group."
          formControl={formControl}
          required
        />
        <CippFormComponent
          type="textField"
          name="groupDescription"
          label="Group Description"
          placeholder="Enter a description for this group."
          formControl={formControl}
        />
        <CippFormTenantSelector
          formControl={formControl}
          multiple={true}
          required={false}
          disableClearable={false}
          name="members"
          valueField="customerId"
          placeholder="Select members to add to this group."
        />
      </Stack>
    </CippFormSection>
  );
};

export default CippAddEditTenantGroups;
