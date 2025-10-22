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
  label = "Filter Specific Resources (Optional)",
  helperText,
  multiple = true,
  required = false,
  tenantFilter,
  ...otherProps
}) => {
  // Watch for changes in the resource type field
  const selectedResource = useWatch({
    control: formControl.control,
    name: resourceFieldName,
  });

  // Extract the value whether selectedResource is an object or string
  const resourceValue = selectedResource?.value || selectedResource;

  const getHelperText = () => {
    if (helperText) return helperText;

    if (!resourceValue) {
      return "Select a resource type above to filter specific resources";
    }

    if (multiple) {
      return "Optionally select specific resources to monitor (will create filter with OR statements: id eq 'id1' or id eq 'id2')";
    }

    return "Optionally select a specific resource to monitor";
  };

  const api = resourceValue
    ? {
        url: "/api/ListGraphRequest",
        queryKey: `graph-resources-${resourceValue}-${tenantFilter}`,
        data: {
          Endpoint: resourceValue,
          IgnoreErrors: true,
          $select: "id,displayName",
          $top: 100,
          tenantFilter,
        },
        labelField: (item) => item.displayName || item.id,
        valueField: "id",
        dataKey: "Results",
        waiting: tenantFilter ? true : false,
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
      disabled={!resourceValue}
      formControl={formControl}
      api={api}
      helperText={getHelperText()}
      placeholder={!resourceValue ? "Select a resource type first" : undefined}
      {...otherProps}
    />
  );
};

export default CippGraphResourceSelector;
