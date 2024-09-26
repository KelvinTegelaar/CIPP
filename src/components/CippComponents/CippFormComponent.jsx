import { Radio, Switch, TextField, Typography } from "@mui/material";
import { CippAutoComplete } from "./CippAutocomplete";
import { Controller, useFormState } from "react-hook-form";

export const CippFormComponent = (props) => {
  const { validators, formControl, type = "textField", name, ...other } = props;
  const { errors } = useFormState({ control: formControl.control });
  switch (type) {
    case "hidden":
      return <input type="hidden" {...other} {...formControl.register(name, { ...validators })} />;
    case "textField":
      return (
        <>
          <div>
            <TextField {...other} {...formControl.register(name, { ...validators })} />
          </div>
          <Typography variant="subtitle3" color={"error"}>
            {name.includes(".")
              ? errors[name.split(".")[0]]?.[name.split(".")[1]]?.message
              : errors[name]?.message}
          </Typography>
        </>
      );
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
  }
};

export default CippFormComponent;
