import { Radio, Switch, TextField } from "@mui/material";
import { CippAutoComplete } from "./CippAutocomplete";
import { Controller } from "react-hook-form";

export const CippFormComponent = (props) => {
  const { validators, formControl, type = "textField", name, ...other } = props;
  switch (type) {
    case "hidden":
      return <input type="hidden" {...other} {...formControl.register(name, { ...validators })} />;
    case "textField":
      return <TextField {...other} {...formControl.register(name, { ...validators })} />;
    case "switch":
      return (
        <Controller
          name={name}
          control={formControl.control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              {...other}
              {...formControl.register(name, { ...validators })}
            />
          )}
        />
      );
    case "checkbox":
      return <Checkbox {...other} {...formControl.register(name, { ...validators })} />;
    case "radio":
      return <Radio {...other} {...formControl.register(name, { ...validators })} />;
    case "autoComplete":
      //for autoComplete we need to use Controller from react-hook-form as it does not pass the synthetic event
      return (
        <Controller
          name={name}
          control={formControl.control}
          render={({ field }) => (
            <CippAutoComplete
              {...other}
              defaultValue={field.value}
              onChange={(value) => {
                field.onChange(value);
              }}
            />
          )}
        />
      );
    default:
      return <TextField {...other} {...formControl.register(name, { ...validators })} />;
  }
};

export default CippFormComponent;
