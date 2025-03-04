import React from "react";
import { Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { useSettings } from "../../../../hooks/use-settings";

const AddTenantAllowBlockList = () => {
  const tenantDomain = useSettings().currentTenant;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      entries: "",
      notes: "",
      listType: null,
      listMethod: null,
      NoExpiration: false,
    },
  });

  return (
    <CippFormPage
      formControl={formControl}
      queryKey="TenantAllowBlockList"
      title="Add Tenant Allow/Block List"
      backButtonTitle="Overview"
      postUrl="/api/AddTenantAllowBlockList"
      customDataformatter={(values) => {
        return {
          tenantID: tenantDomain,
          entries: values.entries,
          listType: values.listType?.value,
          notes: values.notes,
          listMethod: values.listMethod?.value,
          NoExpiration: values.NoExpiration,
        };
      }}
    >
      <Grid container spacing={2}>
        {/* Entries */}
        <Grid item xs={12} md={12}>
          <CippFormComponent
            type="textField"
            label="Entries"
            name="entries"
            formControl={formControl}
            validators={{ required: "Entries field is required" }}
          />
        </Grid>
        {/* Notes & List Type */}
        <Grid item xs={12} md={4}>
          <CippFormComponent
            type="textField"
            label="Notes"
            name="notes"
            formControl={formControl}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CippFormComponent
            type="autoComplete"
            label="List Type"
            name="listType"
            formControl={formControl}
            multiple={false}
            creatable={false}
            options={[
              { label: "Sender", value: "Sender" },
              { label: "Url", value: "Url" },
              { label: "FileHash", value: "FileHash" },
            ]}
            validators={{ required: "Please choose a List Type." }}
          />
        </Grid>

        {/* List Method */}
        <Grid item xs={12} md={4}>
          <CippFormComponent
            type="autoComplete"
            label="Block or Allow Entry"
            name="listMethod"
            formControl={formControl}
            multiple={false}
            creatable={false}
            options={[
              { label: "Block", value: "Block" },
              { label: "Allow", value: "Allow" },
            ]}
            validators={{ required: "Please select Block or Allow." }}
          />
        </Grid>

        {/* No Expiration */}
        <Grid item xs={12} md={4}>
          <CippFormComponent
            type="switch"
            label="NoExpiration"
            name="NoExpiration"
            formControl={formControl}
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

AddTenantAllowBlockList.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddTenantAllowBlockList;
