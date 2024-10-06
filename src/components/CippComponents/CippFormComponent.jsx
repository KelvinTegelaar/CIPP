import {
  Radio,
  Switch,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  FormControl,
  FormLabel,
  RadioGroup,
} from "@mui/material";
import { CippAutoComplete } from "./CippAutocomplete";
import { Controller, useFormState } from "react-hook-form";
import { DateTimePicker } from "@mui/x-date-pickers"; // Make sure to install @mui/x-date-pickers
import { Scrollbar } from "../scrollbar";
import CSVReader from "../CSVReader";

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
          <FormControl>
            <FormLabel>{label}</FormLabel>
            <RadioGroup {...other}>
              {props.options.map((option, idx) => {
                return (
                  <FormControlLabel
                    key={`${option.value}-${idx}`}
                    value={option.value}
                    defaultValue={option.value}
                    control={<Radio />}
                    label={option.label}
                    {...formControl.register(name, { ...validators })}
                  />
                );
              })}
            </RadioGroup>
          </FormControl>
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
    case "CSVReader":
      return (
        <>
          <div>
            <Controller
              name={name}
              control={formControl.control}
              render={({ field }) => (
                <>
                  <CSVReader
                    config={{ header: true, skipEmptyLines: true }}
                    onFileLoaded={(data) => {
                      field.onChange(data);
                    }}
                    onDrop={(data) => {
                      field.onChange(data);
                    }}
                    {...other}
                  >
                    {label}
                  </CSVReader>
                </>
              )}
            />
          </div>
          <Typography variant="subtitle3" color="error">
            {errors[name]?.message}
          </Typography>
        </>
      );
    // Add case for datePicker
    case "datePicker":
      return (
        <>
          <div>
            <Controller
              name={name}
              control={formControl.control}
              render={({ field }) => (
                <Scrollbar>
                  <DateTimePicker
                    views={["year", "month", "day", "hours", "minutes"]}
                    label={label}
                    value={field.value ? new Date(field.value * 1000) : null} // Convert Unix timestamp to Date object
                    onChange={(date) => {
                      if (date) {
                        const unixTimestamp = Math.floor(date.getTime() / 1000); // Convert to Unix timestamp
                        field.onChange(unixTimestamp); // Pass the Unix timestamp to the form
                      } else {
                        field.onChange(null); // Handle the case where no date is selected
                      }
                    }}
                    ampm={false}
                    minutesStep={15}
                    inputFormat="yyyy/MM/dd HH:mm" // Display format
                    renderInput={(inputProps) => (
                      <TextField
                        {...inputProps}
                        {...other}
                        error={!!errors[name]}
                        helperText={errors[name]?.message}
                        fullWidth
                      />
                    )}
                  />
                </Scrollbar>
              )}
            />
          </div>
          <Typography variant="subtitle3" color="error">
            {errors[name]?.message}
          </Typography>
        </>
      );

    default:
      return null;
  }
};

export default CippFormComponent;
