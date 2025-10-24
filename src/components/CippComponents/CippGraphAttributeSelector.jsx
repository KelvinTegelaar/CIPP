import { useWatch } from "react-hook-form";
import CippFormComponent from "./CippFormComponent";

/**
 * A form component for selecting attributes from a Graph API endpoint
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
const CippGraphAttributeSelector = ({
  formControl,
  name,
  resourceFieldName = "DeltaResource",
  label = "Attributes to Monitor",
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

  // Extract the value whether selectedResource is an object or string
  const resourceValue = selectedResource?.value || selectedResource;

  const getHelperText = () => {
    if (helperText) return helperText;

    if (!resourceValue) {
      return "Select a resource type above to view available attributes";
    }

    return "Select which attributes to monitor for changes";
  };

  const api = resourceValue
    ? {
        url: "/api/ListGraphRequest",
        queryKey: `graph-properties-${resourceValue}`,
        data: {
          Endpoint: resourceValue,
          ListProperties: true,
          IgnoreErrors: true,
        },
        labelField: (item) => item,
        valueField: (item) => item,
        dataKey: "Results",
      }
    : null;

  return (
    <CippFormComponent
      name={name}
      type="autoComplete"
      label={label}
      multiple={multiple}
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

export default CippGraphAttributeSelector;
