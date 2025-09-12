import { InputAdornment } from "@mui/material";
import { Grid } from "@mui/system";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormCondition } from "/src/components/CippComponents/CippFormCondition";
import { CippFormDomainSelector } from "../CippComponents/CippFormDomainSelector";
import { CippFormUserSelector } from "../CippComponents/CippFormUserSelector";

const DynamicMembershipRules = ({ formControl }) => (
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
);

const CippAddGroupForm = (props) => {
  const { formControl } = props;

  return (
    <Grid container spacing={2}>
      <Grid size={{ md: 12, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Display Name"
          name="displayName"
          formControl={formControl}
          fullWidth
        />
      </Grid>
      <Grid size={{ md: 12, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Description"
          name="description"
          formControl={formControl}
          fullWidth
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Username"
          name="username"
          formControl={formControl}
          fullWidth
          InputProps={{
            endAdornment: <InputAdornment position="end">@</InputAdornment>,
          }}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormDomainSelector
          formControl={formControl}
          name="primDomain"
          label="Primary Domain name"
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <CippFormUserSelector
          sx={{ mb: "1rem" }}
          formControl={formControl}
          name="owners"
          label="Owners"
          multiple={true}
          select={"id,userPrincipalName,displayName"}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <CippFormUserSelector
          sx={{ mb: "1rem" }}
          formControl={formControl}
          name="members"
          label="Members"
          multiple={true}
          select={"id,userPrincipalName,displayName"}
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
            { label: "Dynamic Distribution Group", value: "dynamicdistribution" },
            { label: "Distribution List", value: "distribution" },
            { label: "Mail Enabled Security Group", value: "security" },
          ]}
        />
      </Grid>
      <CippFormCondition
        formControl={formControl}
        field="groupType"
        compareType="isOneOf"
        compareValue={["distribution", "dynamicdistribution"]}
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

export default CippAddGroupForm;
