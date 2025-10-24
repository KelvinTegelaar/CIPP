import { useWatch } from "react-hook-form";
import CippFormComponent from "./CippFormComponent";

/**
 * A form component for selecting specific resources from a Graph API endpoint
 * @param {Object} props - Component props
 * @param {Object} props.formControl - React Hook Form control object
 * @param {string} props.name - Field name for the form
 * @param {string} props.resourceFieldName - Name of the field that contains the selected resource type
 * @param {string} props.label - Label for the field
 * @param {string} props.helperText - Helper text for the field
 * @param {boolean} props.multiple - Whether to allow multiple selections
 * @param {boolean} props.required - Whether the field is required
 * @param {Object} props.gridProps - Grid props to pass to the wrapper
 */
const CippGraphResourceSelector = ({
  formControl,
  name,
  resourceFieldName = "DeltaResource",
  tenantFilterFieldName = "tenantFilter",
  label = "Filter Specific Resources (Optional)",
  helperText,
  multiple = true,
  required = false,
  ...otherProps
}) => {
  // Watch for changes in the resource type field
  const selectedResource = useWatch({
    control: formControl.control,
    name: resourceFieldName,
  });

  // Watch for changes in the tenant filter field
  const tenantFilter = useWatch({
    control: formControl.control,
    name: tenantFilterFieldName,
  });

  // Extract the value whether selectedResource is an object or string
  const resourceValue = selectedResource?.value || selectedResource;

  // Extract the tenant filter value - handle both object and string formats
  const tenantFilterValue = tenantFilter?.value || tenantFilter;

  const getHelperText = () => {
    if (helperText) return helperText;

    if (!resourceValue) {
      return "Select a resource type above to filter specific resources";
    }

    if (
      !tenantFilterValue ||
      tenantFilterValue === "AllTenants" ||
      (tenantFilter && typeof tenantFilter === "object" && tenantFilter.type === "Group")
    ) {
      return "Resource filtering is not available for All Tenants or tenant groups";
    }

    if (multiple) {
      return "Optionally select specific resources to monitor (will create filter with OR statements: id eq 'id1' or id eq 'id2')";
    }

    return "Optionally select a specific resource to monitor";
  };

  // Check if we should make the API call
  const shouldFetchResources = () => {
    // Must have a resource type selected
    if (!resourceValue) return false;

    // Must have a tenant filter
    if (!tenantFilterValue) return false;

    // Cannot be null or undefined
    if (tenantFilterValue === null || tenantFilterValue === undefined) return false;

    // Cannot be AllTenants
    if (tenantFilterValue === "AllTenants") return false;

    // Cannot be a tenant group (check if tenantFilter object has type: "Group")
    if (tenantFilter && typeof tenantFilter === "object" && tenantFilter.type === "Group")
      return false;

    return true;
  };

  const isDisabled = !resourceValue || !shouldFetchResources();

  const api = shouldFetchResources()
    ? {
        url: "/api/ListGraphRequest",
        queryKey: `graph-resources-${resourceValue}-${tenantFilterValue}`,
        data: {
          Endpoint: resourceValue,
          IgnoreErrors: true,
          $select: "id,displayName",
          $top: 100,
          tenantFilter: tenantFilterValue,
        },
        labelField: (item) => item.displayName || item.id,
        valueField: "id",
        dataKey: "Results",
        waiting: true,
      }
    : null;

  return (
    <CippFormComponent
      name={name}
      type="autoComplete"
      label={label}
      multiple={multiple}
      creatable={false}
      required={required}
      disabled={isDisabled}
      formControl={formControl}
      api={api}
      helperText={getHelperText()}
      placeholder={
        !resourceValue
          ? "Select a resource type first"
          : !shouldFetchResources()
          ? "Resource filtering not available"
          : undefined
      }
      {...otherProps}
    />
  );
};

export default CippGraphResourceSelector;
