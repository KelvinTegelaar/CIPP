import M365LicensesDefault from "../data/M365Licenses.json";
import M365LicensesAdditional from "../data/M365Licenses-additional.json";

/**
 * Get all available licenses for tenant group dynamic rules
 * @returns {Array} Array of license options with label and value (SKU)
 */
export const getTenantGroupLicenseOptions = () => {
  // Combine both license files
  const allLicenses = [...M365LicensesDefault, ...M365LicensesAdditional];

  // Create unique licenses map using String_Id as key for better deduplication
  const uniqueLicensesMap = new Map();

  allLicenses.forEach((license) => {
    if (license.String_Id && license.Product_Display_Name && license.GUID) {
      // Use String_Id as the unique key since that's what we send to backend
      const key = license.String_Id;
      if (!uniqueLicensesMap.has(key)) {
        uniqueLicensesMap.set(key, {
          label: license.Product_Display_Name,
          value: license.String_Id,
          guid: license.GUID,
        });
      }
    }
  });

  // Convert to array and filter out incomplete entries
  const licenseOptions = Array.from(uniqueLicensesMap.values()).filter(
    (license) => license.label && license.value
  );

  // Additional deduplication by label to handle cases where different String_Ids have same display name
  const uniqueByLabelMap = new Map();
  licenseOptions.forEach((license) => {
    if (!uniqueByLabelMap.has(license.label)) {
      uniqueByLabelMap.set(license.label, license);
    }
  });

  return Array.from(uniqueByLabelMap.values()).sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Get all available service plans for tenant group dynamic rules
 * @returns {Array} Array of unique service plan options with label and value
 */
export const getTenantGroupServicePlanOptions = () => {
  // Combine both license files
  const allLicenses = [...M365LicensesDefault, ...M365LicensesAdditional];

  // Create unique service plans map using Service_Plan_Name as key for better deduplication
  const uniqueServicePlansMap = new Map();

  allLicenses.forEach((license) => {
    if (
      license.Service_Plan_Name &&
      license.Service_Plans_Included_Friendly_Names &&
      license.Service_Plan_Id
    ) {
      // Use Service_Plan_Name as the unique key since that's what we send to backend
      const key = license.Service_Plan_Name;
      if (!uniqueServicePlansMap.has(key)) {
        uniqueServicePlansMap.set(key, {
          label: license.Service_Plans_Included_Friendly_Names,
          value: license.Service_Plan_Name,
          id: license.Service_Plan_Id,
        });
      }
    }
  });

  // Convert to array and sort by display name, then deduplicate by label as well
  const serviceOptions = Array.from(uniqueServicePlansMap.values()).filter(
    (plan) => plan.label && plan.value
  ); // Filter out any incomplete entries

  // Additional deduplication by label to handle cases where different service plan names have same friendly name
  const uniqueByLabelMap = new Map();
  serviceOptions.forEach((plan) => {
    if (!uniqueByLabelMap.has(plan.label)) {
      uniqueByLabelMap.set(plan.label, plan);
    }
  });

  return Array.from(uniqueByLabelMap.values()).sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Get delegated access status options for tenant group dynamic rules
 * @returns {Array} Array of delegated access status options
 */
export const getTenantGroupDelegatedAccessOptions = () => {
  return [
    {
      label: "Granular Delegated Admin Privileges",
      value: "granularDelegatedAdminPrivileges",
    },
    {
      label: "Direct Tenant",
      value: "directTenant",
    },
  ];
};

/**
 * Get all property options for dynamic tenant group rules
 * @returns {Array} Array of property options for the rule builder
 */
export const getTenantGroupPropertyOptions = () => {
  return [
    {
      label: "Available License",
      value: "availableLicense",
      type: "license",
    },
    {
      label: "Available Service Plan",
      value: "availableServicePlan",
      type: "servicePlan",
    },
    {
      label: "Delegated Access Status",
      value: "delegatedAccessStatus",
      type: "delegatedAccess",
    },
    {
      label: "Member of Tenant Group",
      value: "tenantGroupMember",
      type: "tenantGroup",
    },
    {
      label: "Custom Variable",
      value: "customVariable",
      type: "customVariable",
    },
  ];
};

/**
 * Get operator options for dynamic tenant group rules
 * @returns {Array} Array of operator options
 */
export const getTenantGroupOperatorOptions = (propertyType) => {
  const baseOperators = [
    {
      label: "Equals",
      value: "eq",
    },
    {
      label: "Not Equals",
      value: "ne",
    },
  ];

  const arrayOperators = [
    {
      label: "In",
      value: "in",
    },
    {
      label: "Not In",
      value: "notIn",
    },
  ];

  const textOperators = [
    {
      label: "Contains",
      value: "like",
    },
    {
      label: "Does Not Contain",
      value: "notlike",
    },
  ];

  // Custom Variable supports text comparison
  if (propertyType === "customVariable") {
    return [...baseOperators, ...textOperators];
  }

  // Delegated Access Status only supports equals/not equals
  if (propertyType === "delegatedAccess") {
    return baseOperators;
  }

  // Tenant group only supports in/notin
  if (propertyType === "tenantGroup") {
    return arrayOperators;
  }

  // License and Service Plan support all operators
  return [...baseOperators, ...arrayOperators];
};

/**
 * Get value options based on the selected property type
 * @param {string} propertyType - The type of property (license, servicePlan, delegatedAccess, tenantGroup)
 * @returns {Array} Array of value options for the selected property type
 */
export const getTenantGroupValueOptions = (propertyType) => {
  switch (propertyType) {
    case "license":
      return getTenantGroupLicenseOptions();
    case "servicePlan":
      return getTenantGroupServicePlanOptions();
    case "delegatedAccess":
      return getTenantGroupDelegatedAccessOptions();
    case "tenantGroup":
      // Return empty array - will be populated dynamically via API
      return [];
    case "customVariable":
      // Return empty array - uses free-text input with variable name
      return [];
    default:
      return [];
  }
};

/**
 * Get tenant group options query configuration for use with ApiGetCallWithPagination
 * This should be used with ApiGetCallWithPagination hook in components
 * Uses the same query key as the Tenant Group table list for cache consistency
 * @returns {Object} Query configuration object for ApiGetCallWithPagination
 */
export const getTenantGroupsQuery = () => ({
  url: "/api/ListTenantGroups",
  queryKey: "TenantGroupListPage",
  waiting: true,
});
