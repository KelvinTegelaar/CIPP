import { useMemo } from "react";
import { ApiGetCall } from "/src/api/ApiCall";

/**
 * Hook to fetch and format custom variables for autocomplete
 * @param {string} tenantFilter - Optional tenant filter for tenant-specific variables
 * @param {boolean} includeSystemVariables - Whether to include system variables
 * @returns {object} { variables, isLoading, error }
 */
export const useCustomVariables = (tenantFilter = null, includeSystemVariables = false) => {
  // Simple, consistent query key using prefix pattern
  // React Query can invalidate with wildcards like "CustomVariables*"

  if (tenantFilter === "AllTenants") {
    tenantFilter = null; // Normalize to null for global context
  }
  const queryKey = `CustomVariables-${tenantFilter || "global"}-${
    includeSystemVariables ? "withSystem" : "noSystem"
  }`;

  // Simple related keys pattern - React Query supports predicate-based invalidation
  const relatedQueryKeys = ["CustomVariables*"];

  // Build API URL with optional tenant filter and system variables setting
  let apiUrl = "/api/ListCustomVariables";
  const params = new URLSearchParams();

  if (tenantFilter) {
    params.append("tenantFilter", tenantFilter);
  }

  if (!includeSystemVariables) {
    params.append("includeSystem", "false");
  }

  if (params.toString()) {
    apiUrl += `?${params.toString()}`;
  }

  // Fetch variables from API
  const apiCall = ApiGetCall({
    url: apiUrl,
    queryKey,
    relatedQueryKeys,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000, // 5 minutes - variables don't change often
  });

  // Format variables for autocomplete component
  const variables = useMemo(() => {
    if (!apiCall.isSuccess || !apiCall.data?.Results) {
      return [];
    }

    return apiCall.data.Results.map((variable) => ({
      // Core properties
      name: variable.Name,
      variable: variable.Variable,
      label: variable.Variable, // What shows in autocomplete
      value: variable.Variable, // What gets inserted

      // Metadata for display and filtering
      description: variable.Description,
      type: variable.Type, // 'reserved' or 'custom'
      category: variable.Category, // 'system', 'tenant', 'partner', 'cipp', 'global', 'tenant-custom'

      // Custom variable specific
      ...(variable.Type === "custom" && {
        customValue: variable.Value,
        scope: variable.Scope,
      }),

      // For grouping in autocomplete
      group:
        variable.Type === "reserved"
          ? `Reserved (${variable.Category})`
          : variable.Category === "global"
          ? "Global Custom Variables"
          : "Tenant Custom Variables",
    }));
  }, [apiCall.isSuccess, apiCall.data]);

  // Group variables by category for better UX
  const groupedVariables = useMemo(() => {
    const groups = {};
    variables.forEach((variable) => {
      const groupName = variable.group;
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(variable);
    });
    return groups;
  }, [variables]);

  // Filter functions for different use cases
  const filterVariables = useMemo(
    () => ({
      // Get only reserved variables
      reserved: () => variables.filter((v) => v.type === "reserved"),

      // Get only custom variables
      custom: () => variables.filter((v) => v.type === "custom"),

      // Get variables by category
      byCategory: (category) => variables.filter((v) => v.category === category),

      // Search variables by name or description
      search: (query) => {
        const lowerQuery = query.toLowerCase();
        return variables.filter(
          (v) =>
            v.name.toLowerCase().includes(lowerQuery) ||
            v.description.toLowerCase().includes(lowerQuery)
        );
      },
    }),
    [variables]
  );

  return {
    variables,
    groupedVariables,
    filterVariables,
    isLoading: apiCall.isLoading,
    isSuccess: apiCall.isSuccess,
    isError: apiCall.isError,
    error: apiCall.error,
    metadata: apiCall.data?.Metadata,
    relatedQueryKeys, // Expose related query keys for other components
  };
};
