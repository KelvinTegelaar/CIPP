import { Radio, Switch, TextField } from "@mui/material";
import { CippAutoComplete } from "./CippAutocomplete";

export const CippFormComponent = (props) => {
  const { formControl, type = "textField", ...other } = props;

  switch (type) {
    case "textField":
      return <TextField {...other} {...formControl.register(other.name)} />;
    case "switch":
      return <Switch {...other} {...formControl.register(other.name)} />;
    case "checkbox":
      return <Checkbox {...other} {...formControl.register(other.name)} />;
    case "radio":
      return <Radio {...other} {...formControl.register(other.name)} />;
    case "autoComplete":
      return <CippAutoComplete {...other} {...formControl.register(other.name)} />;
    default:
      return <TextField {...other} {...formControl.register(other.name)} />;
  }
};

export default CippFormComponent;
