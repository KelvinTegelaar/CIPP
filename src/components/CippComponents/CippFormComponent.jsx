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
  Button,
  Box,
} from "@mui/material";
import { CippAutoComplete } from "./CippAutocomplete";
import { Controller, useFormState } from "react-hook-form";
import { DateTimePicker } from "@mui/x-date-pickers";
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
import React, { useMemo, useEffect, useState } from "react";
import { AccessTime } from "@mui/icons-material";

// Helper function to convert bracket notation to dot notation
// Improved to correctly handle nested bracket notations
const convertBracketsToDots = (name) => {
  if (!name) return "";
  return name.replace(/\[(\d+)\]/g, ".$1");
};

// Helper function to check if dependent field conditions are met
const isDependentFieldReady = (dependsOn, formValues) => {
  if (!dependsOn) return true;
  
  if (Array.isArray(dependsOn)) {
    return dependsOn.every(field => {
      const value = formValues[field];
      return value && value !== '' && value !== null && value !== undefined;
    });
  }
  
  const value = formValues[dependsOn];
  return value && value !== '' && value !== null && value !== undefined;
};

// Helper function to resolve dynamic API configuration
const resolveDynamicApiConfig = (api, formValues) => {
  if (!api) return null;
  
  const resolvedConfig = { ...api };
  
  // Handle dynamic data function
  if (typeof api.data === 'function') {
    const resolvedData = api.data(formValues);
    if (!resolvedData) return null; // Don't make API call if function returns null
    resolvedConfig.data = resolvedData;
  } else if (api.data && typeof api.data === 'object') {
    // Handle string references in data object
    const resolvedData = { ...api.data };
    Object.keys(resolvedData).forEach(key => {
      const value = resolvedData[key];
      if (typeof value === 'string' && formValues[value]) {
        const formValue = formValues[value];
        if (formValue && typeof formValue === 'object' && formValue.value) {
          resolvedData[key] = formValue.value;
        } else if (formValue && typeof formValue === 'object' && formValue.addedFields) {
          resolvedData[key] = formValue.addedFields;
        } else {
          resolvedData[key] = formValue;
        }
      }
    });
    resolvedConfig.data = resolvedData;
  }
  
  // Handle dynamic query key
  if (typeof api.queryKey === 'function') {
    const resolvedQueryKey = api.queryKey(formValues);
    if (!resolvedQueryKey) return null;
    resolvedConfig.queryKey = resolvedQueryKey;
  } else if (typeof api.queryKey === 'string') {
    // Replace placeholder patterns like {fieldName}
    resolvedConfig.queryKey = api.queryKey.replace(/\{(\w+)\}/g, (match, fieldName) => {
      const value = formValues[fieldName];
      if (value && typeof value === 'object' && value.value) {
        return value.value;
      }
      return value || match;
    });
  }
  
  return resolvedConfig;
};

const MemoizedCippAutoComplete = React.memo((props) => {
  return <CippAutoComplete {...props} />;
});

export const CippFormComponent = (props) => {
  const {
    validators,
    formControl,
    type = "textField",
    name,
    label,
    labelLocation = "behind",
    defaultValue,
    helperText,
    dependsOn, // New prop for dependent fields
    api, // API configuration that might be dynamic
    ...other
  } = props;
  
  const { errors } = useFormState({ control: formControl.control });
  // Convert the name from bracket notation to dot notation
  const convertedName = convertBracketsToDots(name);
  
  // Watch all form values for dependent field logic
  const watchedValues = formControl?.watch ? formControl.watch() : {};
  
  // Check if this field should be visible based on dependencies
  const shouldShowField = useMemo(() => {
    return isDependentFieldReady(dependsOn, watchedValues);
  }, [dependsOn, watchedValues]);
  
  // Resolve dynamic API configuration for autoComplete fields
  const [dynamicApiConfig, setDynamicApiConfig] = useState(null);
  
  useEffect(() => {
    if (type === "autoComplete" && api && shouldShowField) {
      const resolved = resolveDynamicApiConfig(api, watchedValues);
      setDynamicApiConfig(resolved);
    } else if (type === "autoComplete" && !shouldShowField) {
      setDynamicApiConfig(null);
    }
  }, [type, api, shouldShowField, watchedValues]);

  // Don't render field if dependencies aren't met
  if (!shouldShowField) {
    return null;
  }

  const renderSwitchWithLabel = (element) => {
    if (!label) return element;

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
    case "number":
      return (
        <>
          <div>
            <TextField
              type="number"
              variant="filled"
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
          {helperText && (
            <Typography variant="subtitle3" color="text.secondary">
              {helperText}
            </Typography>
          )}
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
              defaultValue={defaultValue}
              rules={validators}
              render={({ field }) => {
                return (
                  <RadioGroup
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    {...other}
                  >
                    {props.options.map((option, idx) => (
                      <FormControlLabel
                        key={`${option.value}-${idx}`}
                        value={option.value}
                        control={<Radio disabled={other?.disabled || option?.disabled} />}
                        label={option.label}
                      />
                    ))}
                  </RadioGroup>
                );
              }}
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
                  api={dynamicApiConfig || api} // Use dynamic config if available
                  isFetching={other.isFetching}
                  variant="filled"
                  defaultValue={field.value}
                  label={label}
                  multiple={false}
                  onChange={(value) => field.onChange(value?.value)}
                  helperText={helperText}
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
                  api={dynamicApiConfig || api} // Use dynamic config if available
                  isFetching={other.isFetching}
                  variant="filled"
                  defaultValue={field.value}
                  label={label}
                  onChange={(value) => field.onChange(value)}
                  helperText={helperText}
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <DateTimePicker
                      slotProps={{ textField: { fullWidth: true } }}
                      views={
                        other.dateTimeType === "date"
                          ? ["year", "month", "day"]
                          : ["year", "month", "day", "hours", "minutes"]
                      }
                      label={label}
                      value={field.value ? new Date(field.value * 1000) : null}
                      onChange={(date) => {
                        if (date) {
                          const unixTimestamp = Math.floor(date.getTime() / 1000);
                          field.onChange(unixTimestamp);
                        } else {
                          field.onChange(null);
                        }
                      }}
                      ampm={false}
                      minutesStep={15}
                      inputFormat="yyyy/MM/dd HH:mm"
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
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={other?.disabled}
                    onClick={() => {
                      const now = new Date();
                      // Round to nearest 15-minute interval
                      const minutes = now.getMinutes();
                      const roundedMinutes = Math.round(minutes / 15) * 15;
                      now.setMinutes(roundedMinutes, 0, 0); // Set seconds and milliseconds to 0
                      const unixTimestamp = Math.floor(now.getTime() / 1000);
                      field.onChange(unixTimestamp);
                    }}
                    sx={{
                      height: '42px',
                      minWidth: '42px',
                      padding: '8px 12px',
                      alignSelf: 'flex-end',
                      marginBottom: '0px',
                    }}
                    title="Set to current date and time"
                  >
                    Now
                  </Button>
                </Box>
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
