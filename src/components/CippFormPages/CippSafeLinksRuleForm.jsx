import React, { useEffect } from "react";
import Grid from "@mui/material/Grid";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { Typography } from "@mui/material";
import { CippFormUserSelector } from "/src/components/CippComponents/CippFormUserSelector";
import { CippFormGroupSelector } from "/src/components/CippComponents/CippFormGroupSelector";
import { CippFormDomainSelector } from "/src/components/CippComponents/CippFormDomainSelector";
import { CippInfoCard } from "/src/components/CippCards/CippInfoCard";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export const SafeLinksRuleForm = ({ formControl, PolicyName, formType = "add" }) => {
  // Set the policy-related values whenever the policy name changes
  useEffect(() => {
    if (PolicyName) {
      // Always set SafeLinksPolicy to match the policy name
      formControl.setValue('SafeLinksPolicy', PolicyName);
      
      // Only auto-generate the rule name for new policies
      if (formType === "add") {
        const ruleName = `${PolicyName}_Rule`;
        formControl.setValue('RuleName', ruleName);
      }
    }
    
    // Set default enabled state and priority for new rules
    if (formType === "add") {
      if (formControl.getValues('Enabled') === undefined) {
        formControl.setValue('Enabled', true);
      }
      
      if (!formControl.getValues('Priority')) {
        formControl.setValue('Priority', 0);
      }
    }
  }, [PolicyName, formType, formControl]);

  return (
    <Grid container spacing={2}>
      {formType === "add" && (
        <Grid item xs={12}>
          <CippInfoCard 
            icon={<InformationCircleIcon />}
            label="Rule Association"
            value={`This rule will be automatically associated with policy "${PolicyName || ''}" with name "${PolicyName ? `${PolicyName}_Rule` : ''}"`}
            isFetching={false}
          />
        </Grid>
      )}
      
      <Grid item xs={12}>
        <Typography variant="h6">Rule Information</Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="textField"
          fullWidth
          disabled={true}
          label="Rule Name (Auto-generated)"
          name="RuleName"
          formControl={formControl}
          helperText={formType === "add" ? "Rule name is automatically generated from policy name" : "Rule name cannot be changed"}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="textField"
          fullWidth
          disabled={true}
          label="Policy Name"
          name="SafeLinksPolicy"
          formControl={formControl}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="number"
          fullWidth
          label="Priority"
          name="Priority"
          formControl={formControl}
          helperText="Lower numbers have higher priority"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="switch"
          label="Enable Rule"
          name="Enabled"
          formControl={formControl}
        />
      </Grid>
      <Grid item xs={12}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Comments"
          name="Comments"
          formControl={formControl}
          multiline
          rows={2}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6">Rule Conditions</Typography>
      </Grid>
      <Grid item xs={12}>
        <CippFormDomainSelector
          formControl={formControl}
          name="RecipientDomainIs"
          label="Apply to Recipient Domains"
          multiple={true}
        />
      </Grid>
      <Grid item xs={12}>
        <CippFormUserSelector
          formControl={formControl}
          name="SentTo"
          label="Apply to Recipients"
          valueField="userPrincipalName"
          multiple={true}
        />
      </Grid>
      <Grid item xs={12}>
        <CippFormGroupSelector
          formControl={formControl}
          name="SentToMemberOf"
          label="Apply to Members of Groups"
          multiple={true}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6">Exceptions</Typography>
      </Grid>
      <Grid item xs={12}>
        <CippFormUserSelector
          formControl={formControl}
          name="ExceptIfSentTo"
          label="Except for Recipients"
          valueField="userPrincipalName"
          multiple={true}
        />
      </Grid>
      <Grid item xs={12}>
        <CippFormGroupSelector
          formControl={formControl}
          name="ExceptIfSentToMemberOf"
          label="Except for Members of Groups"
          multiple={true}
        />
      </Grid>
      <Grid item xs={12}>
        <CippFormDomainSelector
          formControl={formControl}
          name="ExceptIfRecipientDomainIs"
          label="Except for Recipient Domains"
          multiple={true}
        />
      </Grid>

      <Grid item xs={12}>
        <CippInfoCard 
          icon={<InformationCircleIcon />}
          label="Propagation Time"
          value="Changes to Safe Links rules may take up to 6 hours to propagate throughout your organization."
          isFetching={false}
        />
      </Grid>
    </Grid>
  );
};

export default SafeLinksRuleForm;