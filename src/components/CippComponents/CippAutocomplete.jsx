import { ArrowDropDown } from "@mui/icons-material";
import { Autocomplete, CircularProgress, createFilterOptions, TextField } from "@mui/material";

export const CippAutoComplete = (props) => {
  const {
    size,
    label,
    multiple = true,
    creatable = true,
    defaultValue,
    value,
    placeholder,
    disableClearable,
    name,
    options,
    onChange,
    required = false,
    sx,
    ...other
  } = props;
  const filter = createFilterOptions();
  return (
    <Autocomplete
      key={defaultValue}
      popupIcon={
        props.isFetching ? <CircularProgress color="inherit" size={20} /> : <ArrowDropDown />
      }
      value={value}
      filterSelectedOptions
      disableClearable={disableClearable}
      multiple={multiple}
      fullWidth
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        if (params.inputValue !== "" && creatable) {
          filtered.push(params.inputValue);
        }
        return filtered;
      }}
      size="small"
      defaultValue={defaultValue}
      name={name}
      onChange={onChange}
      options={options}
      getOptionLabel={(option) => option.label || option}
      sx={sx}
      renderInput={(params) => (
        <TextField placeholder={placeholder} required={required} label={label} {...params} />
      )}
    />
  );
};
