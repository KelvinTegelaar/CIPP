import { TextField, IconButton, Typography, SvgIcon } from "@mui/material";
import { Controller, useFieldArray } from "react-hook-form";
import { Add, Remove } from "@mui/icons-material";

// Helper function to convert bracket notation to dot notation
const convertBracketsToDots = (name) => {
  return name.replace(/\[(\d+)\]/g, ".$1"); // Replace [0] with .0
};

export const CippFormInputArray = ({ formControl, name, label, validators, ...other }) => {
  // Convert the name from bracket notation to dot notation
  const convertedName = convertBracketsToDots(name);

  // Use `useFieldArray` to manage dynamic field arrays
  const { fields, append, remove } = useFieldArray({
    control: formControl.control,
    name: convertedName, // Specify the converted name for useFieldArray
  });

  return (
    <>
      <div>
        {label && <Typography variant="body2">{label}</Typography>}
        <IconButton onClick={() => append({ Key: "", Value: "" })} variant="outlined">
          <Add />
        </IconButton>
      </div>

      {fields.map((field, index) => (
        <div
          key={field.id}
          style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px" }}
        >
          <Controller
            name={`${convertedName}[${index}].Key`}
            control={formControl.control}
            render={({ field }) => (
              <TextField
                {...field}
                placeholder="Key"
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
            render={({ field }) => (
              <TextField
                {...field}
                placeholder="Value"
                fullWidth
                {...other}
                {...formControl.register(`${convertedName}[${index}].Value`, {
                  ...validators,
                })}
              />
            )}
          />
          <IconButton onClick={() => remove(index)} aria-label="remove item">
            <SvgIcon>
              <Remove />
            </SvgIcon>
          </IconButton>
        </div>
      ))}
    </>
  );
};

export default CippFormInputArray;
