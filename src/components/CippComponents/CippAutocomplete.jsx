import { ArrowDropDown } from "@mui/icons-material";
import { Autocomplete, CircularProgress, createFilterOptions, TextField } from "@mui/material";
import { ApiGetCall } from "../../api/ApiCall";
import { useEffect, useState } from "react";
import { useSettings } from "../../hooks/use-settings";
import { getCippError } from "../../utils/get-cipp-error";

export const CippAutoComplete = (props) => {
  const {
    size,
    api,
    label,
    multiple = true,
    creatable = true,
    defaultValue,
    value,
    placeholder,
    disableClearable,
    name,
    options = [],
    onChange,
    required = false,
    sx,
    ...other
  } = props;
  const filter = createFilterOptions();
  const [usedOptions, setUsedOptions] = useState(options);
  const [getRequestInfo, setGetRequestInfo] = useState({ url: "", waiting: false, queryKey: "" });
  const actionGetRequest = ApiGetCall({
    ...getRequestInfo,
    onResult: (result) => {
      setPartialResults((prevResults) => [...prevResults, result]);
    },
  });
  const currentTenant = useSettings().currentTenant;
  useEffect(() => {
    if (api) {
      setGetRequestInfo({
        url: api.url,
        data: { tenantFilter: currentTenant, ...api.data },
        waiting: true,
        queryKey: api.queryKey,
      });
    }
    if (actionGetRequest.isSuccess) {
      const convertedOptions = actionGetRequest.data?.map((option) => {
        return { label: option[api.labelKey], value: option[api.valueKey] };
      });
      setUsedOptions(convertedOptions);
    }
    if (actionGetRequest.isError) {
      setUsedOptions({ label: "Error", value: getCippError(actionGetRequest.error) });
    }
  }, [api, actionGetRequest.data]);

  return (
    <Autocomplete
      key={defaultValue}
      popupIcon={
        props.isFetching || actionGetRequest.isFetching ? (
          <CircularProgress color="inherit" size={20} />
        ) : (
          <ArrowDropDown />
        )
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
      options={api ? usedOptions : options}
      getOptionLabel={(option) => option.label || option}
      sx={sx}
      renderInput={(params) => (
        <TextField placeholder={placeholder} required={required} label={label} {...params} />
      )}
    />
  );
};
