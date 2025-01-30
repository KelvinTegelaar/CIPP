import React from "react";
import { CippFormComponent } from "./CippFormComponent";

export const CippFormTenantSelector = ({
  formControl,
  allTenants = false,
  type = "multiple",
  name = "tenantFilter",
  valueField = "defaultDomainName",
  required = true,
  disableClearable = true,
  ...other
}) => {
  const validators = () => {
    if (required) {
      return {
        required: { value: true, message: "This field is required" },
      };
    }
    return {};
  };

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
        valueField: valueField,
        addedField: {
          defaultDomainName: "defaultDomainName",
          displayName: "displayName",
          customerId: "customerId",
        },
      }}
      multiple={type === "single" ? false : true}
      disableClearable={disableClearable}
      validators={validators}
      {...other}
    />
  );
};
