import { Radio, Switch, TextField } from "@mui/material";
import { CippAutoComplete } from "./CippAutocomplete";

export const CippFormComponent = (props) => {
  const { validators, formControl, type = "textField", ...other } = props;

  switch (type) {
    case "hidden":
      return (
        <input type="hidden" {...other} {...formControl.register(other.name, { ...validators })} />
      );
    case "textField":
      return <TextField {...other} {...formControl.register(other.name, { ...validators })} />;
    case "switch":
      return <Switch {...other} {...formControl.register(other.name, { ...validators })} />;
    case "checkbox":
      return <Checkbox {...other} {...formControl.register(other.name, { ...validators })} />;
    case "radio":
      return <Radio {...other} {...formControl.register(other.name, { ...validators })} />;
    case "autoComplete":
      return (
        <CippAutoComplete {...other} {...formControl.register(other.name, { ...validators })} />
      );
    default:
      return <TextField {...other} {...formControl.register(other.name, { ...validators })} />;
  }
};

export default CippFormComponent;
