import CippFormComponent from "./CippFormComponent";
import { Typography } from "@mui/material";
import { Grid } from "@mui/system";
import { CippFormTenantSelector } from "./CippFormTenantSelector";
import { CippFormCondition } from "./CippFormCondition";
import CippTenantGroupRuleBuilder from "./CippTenantGroupRuleBuilder";

const CippAddEditTenantGroups = ({ formControl, initialValues, title, backButtonTitle, hideSubmitButton = false }) => {
  return (
    <>
      <Typography variant="h6">Properties</Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="textField"
            name="groupName"
            label="Group Name"
            placeholder="Enter the name for this group."
            formControl={formControl}
            required
            fullWidth
            validators={{
              required: "Group name is required",
              minLength: {
                value: 2,
                message: "Group name must be at least 2 characters long"
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="textField"
            name="groupDescription"
            label="Group Description"
            placeholder="Enter a description for this group."
            formControl={formControl}
            fullWidth
          />
        </Grid>

        {/* Group Type Selection */}
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="radio"
            name="groupType"
            label="Group Type"
            options={[
              { label: "Static", value: "static" },
              { label: "Dynamic", value: "dynamic" }
            ]}
            formControl={formControl}
            required
            defaultValue="static"
          />
        </Grid>

        {/* Static Group Members - Show only when Static is selected */}
        <Grid size={{ xs: 12 }}>
          <CippFormCondition
            formControl={formControl}
            field="groupType"
            compareType="is"
            compareValue="static"
          >
            <CippFormTenantSelector
              formControl={formControl}
              multiple={true}
              required={false}
              disableClearable={false}
              name="members"
              valueField="customerId"
              placeholder="Select members to add to this group."
            />
          </CippFormCondition>
        </Grid>

        {/* Dynamic Group Rules - Show only when Dynamic is selected */}
        <Grid size={{ xs: 12 }}>
          <CippFormCondition
            formControl={formControl}
            field="groupType"
            compareType="is"
            compareValue="dynamic"
          >
            <CippTenantGroupRuleBuilder
              formControl={formControl}
              name="dynamicRules"
            />
          </CippFormCondition>
        </Grid>
      </Grid>
    </>
  );
};

export default CippAddEditTenantGroups;
