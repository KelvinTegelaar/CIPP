import { useEffect, useState } from "react";
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
  includeGroups = false,
  includeOffboardingDefaults = false,
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

  // Build the API URL with query parameters to support tenant specific offboarding config
  const buildApiUrl = () => {
    const baseUrl = allTenants ? "/api/ListTenants?AllTenantSelector=true" : "/api/ListTenants";
    const params = new URLSearchParams();

    if (allTenants) {
      params.append("AllTenantSelector", "true");
    }

    if (includeOffboardingDefaults) {
      params.append("IncludeOffboardingDefaults", "true");
    }

    return params.toString()
      ? `${baseUrl.split("?")[0]}?${params.toString()}`
      : baseUrl.split("?")[0];
  };

  // Fetch tenant list
  const tenantList = ApiGetCall({
    url: buildApiUrl(),
    queryKey: allTenants
      ? `ListTenants-FormAllTenantSelector${includeOffboardingDefaults ? "-WithOffboarding" : ""}`
      : `ListTenants-FormnotAllTenants${includeOffboardingDefaults ? "-WithOffboarding" : ""}`,
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
      const tenantData = Array.isArray(tenantList.data)
        ? tenantList.data.map((tenant) => ({
            value: tenant[valueField],
            label: `${tenant.displayName} (${tenant.defaultDomainName})`,
            type: "Tenant",
            addedFields: {
              defaultDomainName: tenant.defaultDomainName,
              displayName: tenant.displayName,
              customerId: tenant.customerId,
              ...(includeOffboardingDefaults && {
                offboardingDefaults: tenant.offboardingDefaults,
              }),
            },
          }))
        : [];

      const groupData =
        includeGroups && Array.isArray(tenantGroupList?.data?.Results)
          ? tenantGroupList.data.Results.map((group) => ({
              value: group.Id,
              label: group.Name,
              type: "Group",
            }))
          : [];

      setOptions([...tenantData, ...groupData]);
    }
  }, [tenantList.isSuccess, tenantGroupList.isSuccess, includeGroups, includeOffboardingDefaults]);

  return (
    <CippFormComponent
      type={componentType}
      name={name}
      formControl={formControl}
      preselectedValue={preselectedEnabled ?? currentTenant ? currentTenant : null}
      label="Select a tenant"
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
