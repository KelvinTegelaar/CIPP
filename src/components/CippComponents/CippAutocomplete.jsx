import { ArrowDropDown } from "@mui/icons-material";
import {
  Autocomplete,
  CircularProgress,
  createFilterOptions,
  TextField,
  IconButton,
} from "@mui/material";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useSettings } from "../../hooks/use-settings";
import { getCippError } from "../../utils/get-cipp-error";
import { ApiGetCallWithPagination } from "../../api/ApiCall";
import { Sync } from "@mui/icons-material";
import { Stack } from "@mui/system";
import React from "react";

const MemoTextField = React.memo(function MemoTextField({
  params,
  label,
  placeholder,
  ...otherProps
}) {
  const { InputProps, ...otherParams } = params;

  return (
    <TextField
      {...otherParams}
      label={label}
      placeholder={placeholder}
      {...otherProps}
      slotProps={{
        inputLabel: {
          shrink: true,
          sx: { transition: "none" },
          required: otherProps.required,
        },
        input: {
          ...InputProps,
          notched: true,
          sx: {
            transition: "none",
            "& .MuiOutlinedInput-notchedOutline": {
              transition: "none",
            },
          },
        },
      }}
    />
  );
});

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
    disabled,
    name,
    options = [],
    onChange,
    onCreateOption,
    required = false,
    isFetching = false,
    sx,
    removeOptions = [],
    ...other
  } = props;

  const [usedOptions, setUsedOptions] = useState(options);
  const [getRequestInfo, setGetRequestInfo] = useState({ url: "", waiting: false, queryKey: "" });
  const filter = createFilterOptions({
    stringify: (option) => JSON.stringify(option),
  });

  // This is our paginated call
  const actionGetRequest = ApiGetCallWithPagination({
    ...getRequestInfo,
  });

  const currentTenant = api?.tenantFilter ? api.tenantFilter : useSettings().currentTenant;
  useEffect(() => {
    if (actionGetRequest.isSuccess && !actionGetRequest.isFetching) {
      const lastPage = actionGetRequest.data?.pages[actionGetRequest.data.pages.length - 1];
      const nextLinkExists = lastPage?.Metadata?.nextLink;
      if (nextLinkExists) {
        actionGetRequest.fetchNextPage();
      }
    }
  }, [actionGetRequest.data?.pages?.length, actionGetRequest.isFetching, api?.queryKey]);

  useEffect(() => {
    if (api) {
      setGetRequestInfo({
        url: api.url,
        data: {
          ...(!api.excludeTenantFilter ? { TenantFilter: currentTenant } : null),
          ...api.data,
        },
        waiting: true,
        queryKey: api.queryKey,
      });
    }
  }, [api, currentTenant]);

  // After the data is fetched, combine and map it
  useEffect(() => {
    if (actionGetRequest.isSuccess) {
      // E.g., allPages is an array of pages returned by the pagination
      const allPages = actionGetRequest.data?.pages || [];

      // Helper to get nested data if you have something like "response.data.items"
      const getNestedValue = (obj, path) => {
        if (!path) return obj;
        const keys = path.split(".");
        let result = obj;
        for (const key of keys) {
          if (result && typeof result === "object" && key in result) {
            result = result[key];
          } else {
            return undefined;
          }
        }
        return result;
      };

      // Flatten the results from all pages
      const combinedResults = allPages.flatMap((page) => {
        const nestedData = getNestedValue(page, api?.dataKey);
        return nestedData !== undefined ? nestedData : [];
      });

      if (!Array.isArray(combinedResults)) {
        setUsedOptions([
          {
            label: "Error: The API returned data we cannot map to this field",
            value: "Error",
          },
        ]);
      } else {
        // Convert each item into your { label, value, addedFields } shape
        const convertedOptions = combinedResults.map((option) => {
          const addedFields = {};
          if (api?.addedField) {
            Object.keys(api.addedField).forEach((key) => {
              addedFields[key] = option[api.addedField[key]];
            });
          }

          return {
            label:
              typeof api?.labelField === "function"
                ? api.labelField(option)
                : option[api?.labelField],
            value:
              typeof api?.valueField === "function"
                ? api.valueField(option)
                : option[api?.valueField],
            addedFields,
          };
        });
        setUsedOptions(convertedOptions);
      }
    }

    if (actionGetRequest.isError) {
      setUsedOptions([{ label: getCippError(actionGetRequest.error), value: "error" }]);
    }
  }, [api, actionGetRequest.data, actionGetRequest.isSuccess, actionGetRequest.isError]);

  const memoizedOptions = useMemo(() => {
    let finalOptions = api ? usedOptions : options;
    if (removeOptions && removeOptions.length) {
      finalOptions = finalOptions.filter((o) => !removeOptions.includes(o.value));
    }
    return finalOptions;
  }, [api, usedOptions, options, removeOptions]);

  const rand = Math.random().toString(36).substring(5);

  return (
    <Autocomplete
      key={`${defaultValue}-${rand}`}
      disabled={disabled || actionGetRequest.isFetching || isFetching}
      popupIcon={
        actionGetRequest.isFetching || isFetching ? (
          <CircularProgress color="inherit" size={20} />
        ) : (
          <ArrowDropDown />
        )
      }
      isOptionEqualToValue={(option, val) => option.value === val.value}
      value={typeof value === "string" ? { label: value, value: value } : value}
      filterSelectedOptions
      disableClearable={disableClearable}
      multiple={multiple}
      fullWidth
      placeholder={placeholder}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        const isExisting =
          options?.length > 0 &&
          options.some(
            (option) => params.inputValue === option.value || params.inputValue === option.label
          );
        if (params.inputValue !== "" && creatable && !isExisting) {
          filtered.push({
            label: `Add option: "${params.inputValue}"`,
            value: params.inputValue,
            manual: true,
          });
        }

        return filtered;
      }}
      size="small"
      defaultValue={
        typeof defaultValue === "string"
          ? { label: defaultValue, value: defaultValue }
          : defaultValue
      }
      name={name}
      onChange={(event, newValue) => {
        if (Array.isArray(newValue)) {
          newValue = newValue.map((item) => {
            // If user typed a new item or missing label
            if (item?.manual || !item?.label) {
              item = {
                label: item?.label ? item.value : item,
                value: item?.label ? item.value : item,
              };
              if (onCreateOption) {
                onCreateOption(item, item?.addedFields);
              }
            }
            return item;
          });
          newValue = newValue.filter(
            (item) => item.value && item.value !== "" && item.value !== "error" && item.value !== -1
          );
        } else {
          if (newValue?.manual || !newValue?.label) {
            newValue = {
              label: newValue?.label ? newValue.value : newValue,
              value: newValue?.label ? newValue.value : newValue,
            };
            if (onCreateOption) {
              onCreateOption(newValue, newValue?.addedFields);
            }
          }
          if (!newValue?.value || newValue.value === "error") {
            newValue = null;
          }
        }
        if (onChange) {
          onChange(newValue, newValue?.addedFields);
        }
      }}
      options={memoizedOptions}
      getOptionLabel={useCallback(
        (option) =>
          option
            ? option.label === null
              ? ""
              : option.label || "Label not found - Are you missing a labelField?"
            : "",
        []
      )}
      sx={sx}
      renderInput={(params) => (
        <Stack direction="row" spacing={1}>
          <MemoTextField
            params={params}
            label={label}
            placeholder={placeholder}
            required={required}
            {...other}
          />
          {api?.url && api?.showRefresh && (
            <IconButton
              size="small"
              onClick={() => {
                actionGetRequest.refetch();
              }}
            >
              <Sync />
            </IconButton>
          )}
        </Stack>
      )}
      {...other}
    />
  );
};
