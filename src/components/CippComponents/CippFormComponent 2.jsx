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
import CSVReader from "../CSVReader";
import get from "lodash/get";
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
} from "mui-tiptap";
import StarterKit from "@tiptap/starter-kit";
import { CippDataTable } from "../CippTable/CippDataTable";
import React from "react";

// Helper function to convert bracket notation to dot notation
const convertBracketsToDots = (name) => {
  return name.replace(/\[(\d+)\]/g, ".$1"); // Replace [0] with .0
};

const MemoizedCippAutoComplete = React.memo((props) => {
  return <CippAutoComplete {...props} />;
});

export const CippFormComponent = (props) => {
  const {
    validators,
    formControl,
    type = "textField",
    name, // The name that may have bracket notation
    label,
    labelLocation = "behind", // Default location for switches
    defaultValue,
    ...other
  } = props;
  const { errors } = useFormState({ control: formControl.control });
  // Convert the name from bracket notation to dot notation
  const convertedName = convertBracketsToDots(name);

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
      return (
        <input
          type="hidden"
          {...other}
          {...formControl.register(convertedName, { ...validators })}
        />
      );

    case "cippDataTable":
      return (
        <>
          <div>
            <Controller
              name={convertedName}
              control={formControl.control}
              render={({ field }) => (
                <>
                  <label>{label}</label>
                  <CippDataTable
                    noCard={true}
                    {...other}
                    onChange={(value) => field.onChange(value)}
                    simple={false}
                  />
                </>
              )}
            />
          </div>
          <Typography variant="subtitle3" color="error">
            {get(errors, convertedName, {})?.message}
          </Typography>
        </>
      );

    case "textField":
      return (
        <>
          <div>
            <TextField
              variant="filled"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              {...other}
              {...formControl.register(convertedName, { ...validators })}
              label={label}
              defaultValue={defaultValue}
            />
          </div>
          <Typography variant="subtitle3" color="error">
            {get(errors, convertedName, {})?.message}
          </Typography>
        </>
      );
    case "password":
      return (
        <>
          <div>
            <TextField
              type="password"
              variant="filled"
              fullWidth
              {...other}
              {...formControl.register(convertedName, { ...validators })}
              label={label}
            />
          </div>
          <Typography variant="subtitle3" color="error">
            {get(errors, convertedName, {})?.message}
          </Typography>
        </>
      );
    case "number":
      return (
        <>
          <div>
            <TextField
              type="number"
              variant="filled"
              {...other}
              {...formControl.register(convertedName, { ...validators })}
              label={label}
              defaultValue={defaultValue}
            />
          </div>
          <Typography variant="subtitle3" color="error">
            {get(errors, convertedName, {})?.message}
          </Typography>
        </>
      );

    case "switch":
      return (
        <>
          <div>
            <Controller
              name={convertedName}
              control={formControl.control}
              defaultValue={defaultValue}
              render={({ field }) =>
                renderSwitchWithLabel(
                  <Switch
                    checked={field.value}
                    {...other}
                    {...formControl.register(convertedName, { ...validators })}
                  />
                )
              }
            />
          </div>
          <Typography variant="subtitle3" color="error">
            {get(errors, convertedName, {})?.message}
          </Typography>
        </>
      );

    case "checkbox":
      return (
        <>
          <div>
            <Checkbox {...other} {...formControl.register(convertedName, { ...validators })} />
            <label>{label}</label>
          </div>
          <Typography variant="subtitle3" color="error">
            {get(errors, convertedName, {})?.message}
          </Typography>
        </>
      );

    case "radio":
      return (
        <>
          <FormControl>
            <FormLabel>{label}</FormLabel>
            <Controller
              name={convertedName}
              control={formControl.control}
              rules={validators}
              render={({ field }) => (
                <RadioGroup {...field} {...other}>
                  {props.options.map((option, idx) => (
                    <FormControlLabel
                      key={`${option.value}-${idx}`}
                      value={option.value}
                      control={<Radio />}
                      label={option.label}
                    />
                  ))}
                </RadioGroup>
              )}
            />
          </FormControl>
          <Typography variant="subtitle3" color="error">
            {get(errors, convertedName, {})?.message}
          </Typography>
        </>
      );

    case "select":
      return (
        <>
          <div>
            <Controller
              name={convertedName}
              control={formControl.control}
              rules={validators}
              render={({ field }) => (
                <MemoizedCippAutoComplete
                  {...other}
                  isFetching={other.isFetching}
                  variant="filled"
                  defaultValue={field.value}
                  label={label}
                  multiple={false}
                  onChange={(value) => field.onChange(value?.value)}
                />
              )}
            />
          </div>
          <Typography variant="subtitle3" color="error">
            {get(errors, convertedName, {}).message}
          </Typography>
        </>
      );

    case "autoComplete":
      return (
        <>
          <div>
            <Controller
              name={convertedName}
              control={formControl.control}
              rules={validators}
              render={({ field }) => (
                <MemoizedCippAutoComplete
                  {...other}
                  isFetching={other.isFetching}
                  variant="filled"
                  defaultValue={field.value}
                  label={label}
                  onChange={(value) => field.onChange(value)}
                />
              )}
            />
          </div>
          <Typography variant="subtitle3" color="error">
            {get(errors, convertedName, {}).message}
          </Typography>
        </>
      );

    case "richText":
      return (
        <>
          <div>
            <Controller
              name={convertedName}
              control={formControl.control}
              rules={validators}
              render={({ field }) => (
                <>
                  <Typography variant="subtitle2">{label}</Typography>
                  <RichTextEditor
                    {...other}
                    ref={field.ref}
                    key={field.value ? "edit" : ""}
                    extensions={[StarterKit]}
                    content={field.value || ""}
                    onUpdate={({ editor }) => {
                      field.onChange(editor.getHTML());
                    }}
                    label={label}
                    renderControls={() => (
                      <MenuControlsContainer>
                        <MenuSelectHeading />
                        <MenuDivider />
                        <MenuButtonBold />
                        <MenuButtonItalic />
                      </MenuControlsContainer>
                    )}
                  />
                </>
              )}
            />
          </div>
          <Typography variant="subtitle3" color="error">
            {get(errors, convertedName, {}).message}
          </Typography>
        </>
      );

    case "CSVReader":
      const remapData = (data, nameToCSVMapping) => {
        if (nameToCSVMapping && data) {
          const csvHeaderToNameMapping = Object.entries(nameToCSVMapping).reduce(
            (acc, [internalKey, csvHeader]) => {
              acc[csvHeader] = internalKey;
              return acc;
            },
            {}
          );

          return data.map((row) => {
            const newRow = {};
            for (const [key, value] of Object.entries(row)) {
              const newKey = csvHeaderToNameMapping[key] || key;
              newRow[newKey] = value;
            }
            return newRow;
          });
        }
        return data;
      };
      return (
        <>
          <div>
            <Controller
              name={convertedName}
              control={formControl.control}
              render={({ field }) => (
                <>
                  <CSVReader
                    config={{ header: true, skipEmptyLines: true }}
                    onFileLoaded={(data) => {
                      const remappedData = remapData(data, other.nameToCSVMapping);
                      field.onChange(remappedData);
                    }}
                    onDrop={(data) => {
                      const remappedData = remapData(data, other.nameToCSVMapping);
                      field.onChange(remappedData);
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
            {get(errors, convertedName, {})?.message}
          </Typography>
        </>
      );

    case "datePicker":
      return (
        <>
          <div>
            <Controller
              name={convertedName}
              control={formControl.control}
              rules={validators}
              render={({ field }) => (
                <DateTimePicker
                  slotProps={{ textField: { fullWidth: true } }}
                  views={
                    other.dateTimeType === "date"
                      ? ["year", "month", "day"]
                      : ["year", "month", "day", "hours", "minutes"]
                  }
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
                      fullWidth
                      error={!!errors[convertedName]}
                      helperText={get(errors, convertedName, {})?.message}
                      variant="filled"
                    />
                  )}
                  {...other}
                />
              )}
            />
          </div>
          <Typography variant="subtitle3" color="error">
            {get(errors, convertedName, {})?.message}
          </Typography>
        </>
      );

    default:
      return null;
  }
};

export default CippFormComponent;
