import { useEffect } from "react";
import "@mui/material";
import { Grid } from "@mui/system";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { CippFormCondition } from "../CippComponents/CippFormCondition";

const CippAddGroupTemplateForm = (props) => {
  const { formControl } = props;

  // Debug the current form values, especially groupType
  useEffect(() => {
    const subscription = formControl.watch((value, { name, type }) => {});
    return () => subscription.unsubscribe();
  }, [formControl]);

  return (
    <Grid container spacing={2}>
      {/* Hidden field to store the template GUID when editing */}
      <CippFormComponent type="hidden" name="GUID" formControl={formControl} />

      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Display Name"
          name="displayName"
          required
          formControl={formControl}
          fullWidth
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Description"
          name="description"
          formControl={formControl}
          fullWidth
        />
      </Grid>
      <Grid size={{ md: 12, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Username"
          helperText="If this is a mail enabled group, CIPP variable replacement are supported for the domain (e.g mygroup@%tenantfilter%)"
          name="username"
          required
          formControl={formControl}
          fullWidth
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="radio"
          name="groupType"
          formControl={formControl}
          options={[
            { label: "Azure Role Group", value: "azurerole" },
            { label: "Security Group", value: "generic" },
            { label: "Microsoft 365 Group", value: "m365" },
            { label: "Dynamic Group", value: "dynamic" },
            { label: "Dynamic Distribution Group", value: "dynamicDistribution" },
            { label: "Distribution List", value: "distribution" },
            { label: "Mail Enabled Security Group", value: "security" },
          ]}
        />
        {/* Debug output */}
        <div style={{ display: "none" }}>Current groupType: {formControl.watch("groupType")}</div>
      </Grid>
      <CippFormCondition
        formControl={formControl}
        field="groupType"
        compareType="isOneOf"
        compareValue={["distribution", "dynamicDistribution"]}
      >
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Let people outside the organization email the group"
            name="allowExternal"
            formControl={formControl}
          />
        </Grid>
      </CippFormCondition>
      <CippFormCondition
        formControl={formControl}
        field="groupType"
        compareType="is"
        compareValue="m365"
      >
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Subscribe members to receive group emails"
            name="subscribeMembers"
            formControl={formControl}
          />
        </Grid>
      </CippFormCondition>
      <CippFormCondition
        formControl={formControl}
        field="groupType"
        compareType="contains"
        compareValue="dynamic"
      >
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Dynamic Group Parameters"
            name="membershipRules"
            formControl={formControl}
            placeholder="Enter dynamic group parameters syntax"
            multiline
            rows={4}
            fullWidth
          />
        </Grid>
      </CippFormCondition>
    </Grid>
  );
};

export default CippAddGroupTemplateForm;
