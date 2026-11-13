import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import { CippFormComponent } from "./CippFormComponent";
import { useSettings } from "../../hooks/use-settings";
import { GroupHeader, GroupItems } from "../CippComponents/CippAutocompleteGrouping";
import { ApiGetCall } from "../../api/ApiCall";

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
  // Offer tenant groups that add their member tenants to the selection, so the form still sends
  // plain tenants. For endpoints that store group selectors themselves, use includeGroups instead.
  expandGroups = type !== "single" && !includeGroups,
  includeTenantDefaults = false,
  // Deprecated alias for includeTenantDefaults.
  includeOffboardingDefaults = false,
  ...other
}) => {
  const includeDefaults = includeTenantDefaults || includeOffboardingDefaults;
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

    if (includeDefaults) {
      params.append("IncludeTenantDefaults", "true");
    }

    return params.toString()
      ? `${baseUrl.split("?")[0]}?${params.toString()}`
      : baseUrl.split("?")[0];
  };

  // Fetch tenant list
  const tenantList = ApiGetCall({
    url: buildApiUrl(),
    queryKey: allTenants
      ? `ListTenants-FormAllTenantSelector${includeDefaults ? "-WithDefaults" : ""}`
      : `ListTenants-FormnotAllTenants${includeDefaults ? "-WithDefaults" : ""}`,
  });

  // Fetch tenant group list if includeGroups is true
  const tenantGroupList = ApiGetCall({
    url: "/api/ListTenantGroups",
    data: { AllTenantSelector: true },
    queryKey: "TenantGroupSelector",
    waiting: includeGroups || expandGroups,
  });

  const [options, setOptions] = useState([]);
  const selected = useWatch({ control: formControl.control, name });

  // Replace a picked group with its member tenants. Members are matched against this user's tenant
  // options, so tenants outside their access are left out.
  useEffect(() => {
    if (!expandGroups || !Array.isArray(selected)) return;
    const pickedGroups = selected.filter((item) => item?.type === "Group");
    if (pickedGroups.length === 0) return;
    const byCustomerId = new Map(
      options.filter((option) => option.type === "Tenant").map((option) => [option.addedFields?.customerId, option])
    );
    const expanded = selected.filter((item) => item?.type !== "Group");
    const chosen = new Set(expanded.map((item) => item?.value));
    for (const group of pickedGroups) {
      for (const member of group.addedFields?.members ?? []) {
        const option = byCustomerId.get(member.customerId);
        if (option && !chosen.has(option.value)) {
          expanded.push(option);
          chosen.add(option.value);
        }
      }
    }
    formControl.setValue(name, expanded, { shouldDirty: true, shouldValidate: true });
  }, [selected, expandGroups, options, formControl, name]);

  useEffect(() => {
    if (tenantList.isSuccess && (!(includeGroups || expandGroups) || tenantGroupList.isSuccess)) {
      const tenantData = Array.isArray(tenantList.data)
        ? tenantList.data.map((tenant) => ({
            value: tenant[valueField],
            label: `${tenant.displayName} (${tenant.defaultDomainName})`,
            type: "Tenant",
            addedFields: {
              defaultDomainName: tenant.defaultDomainName,
              displayName: tenant.displayName,
              customerId: tenant.customerId,
              ...(includeDefaults && {
                offboardingDefaults: tenant.offboardingDefaults,
                vacationDefaults: tenant.vacationDefaults,
              }),
            },
          }))
        : [];

      // An expanding group lists only the members this user can pick, and is left out when that is none
      const pickableIds = new Set(tenantData.map((tenant) => tenant.addedFields.customerId));
      const groupData =
        (includeGroups || expandGroups) && Array.isArray(tenantGroupList?.data?.Results)
          ? tenantGroupList.data.Results.flatMap((group) => {
              if (!expandGroups) return [{ value: group.Id, label: group.Name, type: "Group" }];
              const members = (group.Members ?? []).filter((member) => pickableIds.has(member.customerId));
              if (members.length === 0) return [];
              return [
                {
                  value: group.Id,
                  label: `${group.Name} (adds ${members.length} ${members.length === 1 ? "tenant" : "tenants"})`,
                  type: "Group",
                  addedFields: { members },
                },
              ];
            })
          : [];

      setOptions([...tenantData, ...groupData]);
    }
  }, [tenantList.isSuccess, tenantGroupList.isSuccess, includeGroups, expandGroups, includeDefaults]);

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
          {(includeGroups || expandGroups) && <GroupHeader>{params.group}</GroupHeader>}
          {includeGroups || expandGroups ? <GroupItems>{params.children}</GroupItems> : params.children}
        </li>
      )}
      isFetching={tenantList.isFetching || tenantGroupList.isFetching}
      {...other}
    />
  );
};
