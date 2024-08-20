import { ArrowDropDown } from "@mui/icons-material";
import { Autocomplete, CircularProgress, createFilterOptions, TextField } from "@mui/material";

export const CippAutoComplete = (props) => {
  const {
    size,
    label,
    multiple = true,
    creatable = true,
    defaultValue,
    disableClearable,
    name,
    options,
    onChange,
    ...other
  } = props;
  const filter = createFilterOptions();
  console.log("is fetching?");
  return (
    <Autocomplete
      popupIcon={
        props.isFetching ? <CircularProgress color="inherit" size={20} /> : <ArrowDropDown />
      }
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
      {...other}
      renderInput={(params) => <TextField label={label} {...params} />}
    />
  );
};
