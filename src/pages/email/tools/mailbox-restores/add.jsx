import React from "react";
import { Grid, Divider } from "@mui/material";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { useSettings } from "../../../../hooks/use-settings";

const sourceMailboxesOptions = [
  { value: "sourceGuid1", label: "MailboxOne <mailboxone@example.com>" },
  { value: "sourceGuid2", label: "MailboxTwo <mailboxtwo@example.com>" },
];

const targetMailboxesOptions = [
  { value: "targetGuid1", label: "TargetMailboxOne <targetone@example.com>" },
  { value: "targetGuid2", label: "TargetMailboxTwo <targettwo@example.com>" },
];

const MailboxRestoreForm = () => {
  const tenantDomain = useSettings().currentTenant;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: tenantDomain,
      SourceMailbox: null,
      TargetMailbox: null,
      RequestName: "",
      AcceptLargeDataLoss: false,
      BadItemLimit: "",
      LargeItemLimit: "",
    },
  });

  return (
    <CippFormPage
      formControl={formControl}
      queryKey="MailboxRestore"
      title="Mailbox Restore"
      backButtonTitle="Mailbox Overview"
      postUrl="/api/ExecMailboxRestore"
      customDataformatter={(values) => {
        const shippedValues = {
          TenantFilter: tenantDomain,
          RequestName: values.RequestName,
          SourceMailbox: values.SourceMailbox?.value,
          TargetMailbox: values.TargetMailbox?.value,
          BadItemLimit: values.BadItemLimit,
          LargeItemLimit: values.LargeItemLimit,
          AcceptLargeDataLoss: values.AcceptLargeDataLoss,
        };
        return shippedValues;
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CippFormComponent
            name="SourceMailbox"
            label="Source Mailbox"
            type="autoComplete"
            formControl={formControl}
            multiple={false}
            api={{
              labelField: (option) => `${option.displayName} (${option.UPN})`,
              valueField: "UPN",
              url: "/api/ListMailboxes?SoftDeletedMailbox=true",
              queryKey: `ListMailboxes-${tenantDomain}-SoftDeleted`,
            }}
          />
        </Grid>
        {/* Target Mailbox */}
        <Grid item xs={12}>
          <CippFormComponent
            name="TargetMailbox"
            label="Restore Target"
            type="autoComplete"
            formControl={formControl}
            multiple={false}
            api={{
              queryKey: `ListMailboxes-${tenantDomain}`,
              labelField: (option) => `${option.displayName} (${option.UPN})`,
              valueField: "UPN",
              url: "/api/ListMailboxes",
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="textField"
            label="Restore Request Name"
            name="RequestName"
            formControl={formControl}
            validators={{ required: "Please enter a request name." }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="switch"
            label="Accept Large Data Loss"
            name="AcceptLargeDataLoss"
            formControl={formControl}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="textField"
            label="Bad Item Limit"
            name="BadItemLimit"
            formControl={formControl}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="textField"
            label="Large Item Limit"
            name="LargeItemLimit"
            formControl={formControl}
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

MailboxRestoreForm.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default MailboxRestoreForm;
