import React from "react";
import { CippFormComponent } from "./CippFormComponent";

export const CippFormTenantSelector = ({
  formControl,
  allTenants = false,
  type = "multiple",
  ...other
}) => {
  return (
    <CippFormComponent
      type="autoComplete"
      name="tenantFilter"
      formControl={formControl}
      placeholder="Select a tenant"
      api={{
        excludeTenantFilter: true,
        url: allTenants ? "/api/ListTenants" : "/api/ListTenants?AllTenantSelector=true",
        queryKey: "ListTenants",
        labelField: (option) => `${option.displayName} (${option.defaultDomainName})`,
        valueField: "customerId",
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
