import React from "react";
import { CippFormComponent } from "./CippFormComponent";

export const CippFormTenantSelector = ({
  formControl,
  allTenants = false,
  type = "multiple",
  name = "tenantFilter",
  ...other
}) => {
  return (
    <CippFormComponent
      type="autoComplete"
      name={name}
      formControl={formControl}
      placeholder="Select a tenant"
      api={{
        excludeTenantFilter: true,
        url: allTenants ? "/api/ListTenants?AllTenantSelector=true" : "/api/ListTenants",
        queryKey: allTenants ? "ListTenants-AllTenantSelector" : "ListTenants-notAllTenants",
        labelField: (option) => `${option.displayName} (${option.defaultDomainName})`,
        valueField: "defaultDomainName",
      }}
      multiple={type === "single" ? false : true}
      disableClearable={true}
      validators={{
        required: { value: true, message: "This field is required" },
      }}
      {...other}
    />
  );
};
