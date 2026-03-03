import { TextField, IconButton, Typography, Box } from "@mui/material";
import { Controller, useFieldArray } from "react-hook-form";
import { Add, Remove } from "@mui/icons-material";

// Helper function to convert bracket notation to dot notation
const convertBracketsToDots = (name) => {
  return name.replace(/\[(\d+)\]/g, ".$1"); // Replace [0] with .0
};

export const CippFormInputArray = ({
  formControl,
  name,
  label,
  validators,
  mode = "keyValue", // Default to keyValue for backward compatibility
  placeholder,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
  ...other
}) => {
  // Convert the name from bracket notation to dot notation
  const convertedName = convertBracketsToDots(name);

  // Determine initial value based on mode
  const getInitialValue = () => {
    if (mode === "simple") {
      return "";
    } else {
      return { Key: "", Value: "" };
    }
  };

  // Use `useFieldArray` to manage dynamic field arrays
  const { fields, append, remove } = useFieldArray({
    control: formControl.control,
    name: convertedName,
  });

  // Render simple mode (single input field)
  const renderSimpleField = (field, index) => (
    <Box key={field.id} sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
      <Controller
        name={`${convertedName}[${index}]`}
        control={formControl.control}
        rules={validators}
        render={({ field: controllerField, fieldState }) => (
          <TextField
            {...controllerField}
            placeholder={placeholder || "Enter value"}
            fullWidth
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            {...other}
          />
        )}
      />
      <IconButton onClick={() => remove(index)} aria-label="remove item" size="small">
        <Remove />
      </IconButton>
    </Box>
  );

  // Render key-value mode (two input fields) - original functionality
  const renderKeyValueField = (field, index) => (
    <Box key={field.id} sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
      <Controller
        name={`${convertedName}[${index}].Key`}
        control={formControl.control}
        render={({ field: controllerField }) => (
          <TextField
            {...controllerField}
            placeholder={keyPlaceholder}
            fullWidth
            {...other}
            {...formControl.register(`${convertedName}[${index}].Key`, {
              ...validators,
            })}
          />
        )}
      />
      <Controller
        name={`${convertedName}[${index}].Value`}
        control={formControl.control}
        render={({ field: controllerField }) => (
          <TextField
            {...controllerField}
            placeholder={valuePlaceholder}
            fullWidth
            {...other}
            {...formControl.register(`${convertedName}[${index}].Value`, {
              ...validators,
            })}
          />
        )}
      />
      <IconButton onClick={() => remove(index)} aria-label="remove item" size="small">
        <Remove />
      </IconButton>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        {label && <Typography variant="body2">{label}</Typography>}
        <IconButton onClick={() => append(getInitialValue())} variant="outlined" size="small">
          <Add />
        </IconButton>
      </Box>

      {fields.map((field, index) =>
        mode === "simple" ? renderSimpleField(field, index) : renderKeyValueField(field, index)
      )}
    </Box>
  );
};

export default CippFormInputArray;
