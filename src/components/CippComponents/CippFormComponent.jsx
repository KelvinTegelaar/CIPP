import { Radio, Switch, TextField, Typography, Checkbox, FormControlLabel } from "@mui/material";
import { CippAutoComplete } from "./CippAutocomplete";
import { Controller, useFormState } from "react-hook-form";

export const CippFormComponent = (props) => {
  const {
    validators,
    formControl,
    type = "textField",
    name,
    label,
    labelLocation = "behind", // Default location for switches
    ...other
  } = props;
  const { errors } = useFormState({ control: formControl.control });

  const renderSwitchWithLabel = (element) => {
    if (!label) return element; // No label for the switch if label prop is not provided

    if (labelLocation === "above") {
      return (
        <>
          <Typography variant="body2" component="label">
            {label}
          </Typography>
          {element}
        </>
      );
    } else if (labelLocation === "behind") {
      return (
        <FormControlLabel
          control={element}
          label={<Typography variant="body2">{label}</Typography>}
          labelPlacement="end"
        />
      );
    }
  };

  switch (type) {
    case "hidden":
      return <input type="hidden" {...other} {...formControl.register(name, { ...validators })} />;

    case "textField":
      return (
        <>
          <div>
            <TextField
              {...other}
              {...formControl.register(name, { ...validators })}
              label={label}
            />
          </div>
          <Typography variant="subtitle3" color="error">
            {name.includes(".")
              ? errors[name.split(".")[0]]?.[name.split(".")[1]]?.message
              : errors[name]?.message}
          </Typography>
        </>
      );

    case "switch":
      return (
        <>
          <div>
            <Controller
              name={name}
              control={formControl.control}
              render={({ field }) =>
                renderSwitchWithLabel(
                  <Switch
                    checked={field.value}
                    {...other}
                    {...formControl.register(name, { ...validators })}
                  />
                )
              }
            />
          </div>
          <Typography variant="subtitle3" color="error">
            {name.includes(".")
              ? errors[name.split(".")[0]]?.[name.split(".")[1]]?.message
              : errors[name]?.message}
          </Typography>
        </>
      );

    case "checkbox":
      return (
        <>
          <div>
            <Checkbox {...other} {...formControl.register(name, { ...validators })} label={label} />
          </div>
          <Typography variant="subtitle3" color="error">
            {name.includes(".")
              ? errors[name.split(".")[0]]?.[name.split(".")[1]]?.message
              : errors[name]?.message}
          </Typography>
        </>
      );

    case "radio":
      return (
        <>
          <div>
            <Radio {...other} {...formControl.register(name, { ...validators })} label={label} />
          </div>
          <Typography variant="subtitle3" color="error">
            {name.includes(".")
              ? errors[name.split(".")[0]]?.[name.split(".")[1]]?.message
              : errors[name]?.message}
          </Typography>
        </>
      );

    case "autoComplete":
      return (
        <>
          <div>
            <Controller
              name={name}
              control={formControl.control}
              render={({ field }) => (
                <CippAutoComplete
                  {...other}
                  defaultValue={field.value}
                  label={label}
                  onChange={(value) => field.onChange(value)}
                />
              )}
            />
          </div>
          <Typography variant="subtitle3" color="error">
            {name.includes(".")
              ? errors[name.split(".")[0]]?.[name.split(".")[1]]?.message
              : errors[name]?.message}
          </Typography>
        </>
      );

    default:
      return null;
  }
};

export default CippFormComponent;
