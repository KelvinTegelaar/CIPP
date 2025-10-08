import { ArrowDropDown } from "@mui/icons-material";
import {
  Autocomplete,
  CircularProgress,
  createFilterOptions,
  TextField,
  IconButton,
} from "@mui/material";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
    sortOptions = false,
    preselectedValue,
    groupBy,
    renderGroup,
    ...other
  } = props;

  const [usedOptions, setUsedOptions] = useState(options);
  const [getRequestInfo, setGetRequestInfo] = useState({ url: "", waiting: false, queryKey: "" });
  const hasPreselectedRef = useRef(false);
  const autocompleteRef = useRef(null); // Ref for focusing input after selection
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
          ...(!api.excludeTenantFilter ? { tenantFilter: currentTenant } : null),
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
                : option[api?.labelField]
                ? option[api?.labelField]
                : option[api?.altLabelField] ||
                  option[api?.valueField] ||
                  "No label found - Are you missing a labelField?",
            value:
              typeof api?.valueField === "function"
                ? api.valueField(option)
                : option[api?.valueField],
            addedFields,
          };
        });

        if (api?.dataFilter) {
          setUsedOptions(api.dataFilter(convertedOptions));
        } else {
          setUsedOptions(convertedOptions);
        }
      }
    }

    if (actionGetRequest.isError) {
      setUsedOptions([{ label: getCippError(actionGetRequest.error), value: "error" }]);
    }
  }, [
    api,
    actionGetRequest.data,
    actionGetRequest.isSuccess,
    actionGetRequest.isError,
    preselectedValue,
    defaultValue,
    value,
    multiple,
    onChange,
  ]);

  const memoizedOptions = useMemo(() => {
    let finalOptions = api ? usedOptions : options;
    if (removeOptions && removeOptions.length) {
      finalOptions = finalOptions.filter((o) => !removeOptions.includes(o.value));
    }
    if (sortOptions) {
      finalOptions.sort((a, b) => a.label?.localeCompare(b.label));
    }
    return finalOptions;
  }, [api, usedOptions, options, removeOptions, sortOptions]);

  // Dedicated effect for handling preselected value or auto-select first item - only runs once
  useEffect(() => {
    if (memoizedOptions.length > 0 && !hasPreselectedRef.current) {
      // Check if we should skip preselection due to existing defaultValue
      const hasDefaultValue =
        defaultValue && (Array.isArray(defaultValue) ? defaultValue.length > 0 : true);

      if (!hasDefaultValue) {
        // For multiple mode, check if value is empty array or null/undefined
        // For single mode, check if value is null/undefined
        const shouldPreselect = multiple
          ? !value || (Array.isArray(value) && value.length === 0)
          : !value;

        if (shouldPreselect) {
          let preselectedOption;

          // Handle explicit preselected value
          if (preselectedValue) {
            preselectedOption = memoizedOptions.find((option) => option.value === preselectedValue);
          }
          // Handle auto-select first item from API
          else if (api?.autoSelectFirstItem && memoizedOptions.length > 0) {
            preselectedOption = memoizedOptions[0];
          }

          if (preselectedOption) {
            const newValue = multiple ? [preselectedOption] : preselectedOption;
            hasPreselectedRef.current = true; // Mark that we've preselected
            if (onChange) {
              onChange(newValue, newValue?.addedFields);
            }
          }
        }
      }
    }
  }, [
    preselectedValue,
    defaultValue,
    value,
    memoizedOptions,
    multiple,
    onChange,
    api?.autoSelectFirstItem,
  ]);

  // Create a stable key that only changes when necessary inputs change
  const stableKey = useMemo(() => {
    // Only regenerate the key when these values change
    const keyParts = [
      JSON.stringify(defaultValue),
      JSON.stringify(preselectedValue),
      api?.url,
      currentTenant,
    ];
    return keyParts.join("-");
  }, [defaultValue, preselectedValue, api?.url, currentTenant]);

  const lookupOptionByValue = useCallback(
    (value) => {
      const foundOption = memoizedOptions.find((option) => option.value === value);
      return foundOption || { label: value, value: value };
    },
    [memoizedOptions]
  );

  return (
    <Autocomplete
      ref={autocompleteRef}
      key={stableKey}
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
          const newOption = {
            label: `Add option: "${params.inputValue}"`,
            value: params.inputValue,
            manual: true,
          };
          if (!filtered.some((option) => option.value === newOption.value)) {
            filtered.push(newOption);
          }
        }

        return filtered;
      }}
      size="small"
      defaultValue={
        Array.isArray(defaultValue)
          ? defaultValue.map((item) =>
              typeof item === "string" ? lookupOptionByValue(item) : item
            )
          : typeof defaultValue === "object" && multiple
          ? [defaultValue]
          : typeof defaultValue === "string"
          ? lookupOptionByValue(defaultValue)
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
                item = onCreateOption(item, item?.addedFields);
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
              newValue = onCreateOption(newValue, newValue?.addedFields);
            }
          }
          if (!newValue?.value || newValue.value === "error") {
            newValue = null;
          }
        }
        if (onChange) {
          onChange(newValue, newValue?.addedFields);
        }

        // In multiple mode, refocus the input after selection to allow continuous adding
        if (multiple && newValue && autocompleteRef.current) {
          // Use setTimeout to ensure the selection is processed first
          setTimeout(() => {
            const input = autocompleteRef.current?.querySelector("input");
            if (input) {
              input.focus();
            }
          }, 0);
        }
      }}
      options={memoizedOptions}
      getOptionLabel={useCallback(
        (option) => {
          if (!option) return "";
          // For static options (non-API), the option should already have a label
          if (!api && option.label !== undefined) {
            return option.label === null ? "" : String(option.label);
          }
          // For API options, use the existing logic
          if (api) {
            return option.label === null
              ? ""
              : option.label || "Label not found - Are you missing a labelField?";
          }
          // Fallback for any edge cases
          return option.label || option.value || "";
        },
        [api]
      )}
      onKeyDown={(event) => {
        // Handle Tab key to select highlighted option
        if (event.key === "Tab" && !event.shiftKey) {
          // Check if there's a highlighted option
          const listbox = document.querySelector('[role="listbox"]');
          const highlightedOption = listbox?.querySelector('[data-focus="true"], .Mui-focused');

          if (highlightedOption && listbox?.style.display !== "none") {
            event.preventDefault();
            // Trigger a click on the highlighted option
            highlightedOption.click();
          }
        }
      }}
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
      groupBy={groupBy}
      renderGroup={renderGroup}
      {...other}
    />
  );
};
