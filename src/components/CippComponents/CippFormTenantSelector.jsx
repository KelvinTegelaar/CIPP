import React, { useEffect, useState } from "react";
import { CippFormComponent } from "./CippFormComponent";
import { useSettings } from "../../hooks/use-settings";
import { GroupHeader, GroupItems } from "../CippComponents/CippAutocompleteGrouping";
import { ApiGetCall } from "/src/api/ApiCall";

export const CippFormTenantSelector = ({
  formControl,
  componentType = "autoComplete",
  allTenants = false,
  type = "multiple",
  name = "tenantFilter",
  valueField = "defaultDomainName",
  required = true,
  disableClearable = true,
  preselectedEnabled = false,
  removeOptions = [],
  includeGroups = false, // New parameter
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
  const currentTenant = useSettings()?.currentTenant;

  // Fetch tenant list
  const tenantList = ApiGetCall({
    url: allTenants ? "/api/ListTenants?AllTenantSelector=true" : "/api/ListTenants",
    queryKey: allTenants ? "ListTenants-FormAllTenantSelector" : "ListTenants-FormnotAllTenants",
  });

  // Fetch tenant group list if includeGroups is true
  const tenantGroupList = ApiGetCall({
    url: "/api/ListTenantGroups",
    data: { AllTenantSelector: true },
    queryKey: "TenantGroupSelector",
    waiting: includeGroups,
  });

  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (tenantList.isSuccess && (!includeGroups || tenantGroupList.isSuccess)) {
      const tenantData = tenantList.data.map((tenant) => ({
        value: tenant[valueField],
        label: `${tenant.displayName} (${tenant.defaultDomainName})`,
        type: "Tenant",
        addedFields: {
          defaultDomainName: tenant.defaultDomainName,
          displayName: tenant.displayName,
          customerId: tenant.customerId,
        },
      }));

      const groupData = includeGroups
        ? tenantGroupList?.data?.Results?.map((group) => ({
            value: group.Id,
            label: group.Name,
            type: "Group",
          }))
        : [];

      setOptions([...tenantData, ...groupData]);
    }
  }, [tenantList.isSuccess, tenantGroupList.isSuccess, includeGroups]);

  return (
    <CippFormComponent
      type={componentType}
      name={name}
      formControl={formControl}
      preselectedValue={preselectedEnabled ?? currentTenant ? currentTenant : null}
      placeholder="Select a tenant"
      creatable={false}
      multiple={type === "single" ? false : true}
      disableClearable={disableClearable}
      validators={validators}
      removeOptions={removeOptions}
      options={options}
      groupBy={(option) => option.type}
      renderGroup={(params) => (
        <li key={params.key}>
          {includeGroups && <GroupHeader>{params.group}</GroupHeader>}
          {includeGroups ? <GroupItems>{params.children}</GroupItems> : params.children}
        </li>
      )}
      isFetching={tenantList.isFetching || tenantGroupList.isFetching}
      {...other}
    />
  );
};
