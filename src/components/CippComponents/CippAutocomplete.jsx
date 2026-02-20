import { ArrowDropDown, Visibility } from "@mui/icons-material";
import {
  Autocomplete,
  CircularProgress,
  createFilterOptions,
  TextField,
  IconButton,
  Tooltip,
  Box,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSettings } from "../../hooks/use-settings";
import { getCippError } from "../../utils/get-cipp-error";
import { ApiGetCallWithPagination } from "../../api/ApiCall";
import { Sync } from "@mui/icons-material";
import { Stack } from "@mui/system";
import React from "react";
import { CippOffCanvas } from "./CippOffCanvas";
import CippJsonView from "../CippFormPages/CippJSONView";

const MemoTextField = React.memo(function MemoTextField({
  params,
  label,
  placeholder,
  ...otherProps
}) {
  const { InputProps, ...otherParams } = params;

  return (
    <Tooltip title={label || ""} placement="top" arrow>
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
    </Tooltip>
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
    customAction,
    ...other
  } = props;

  const [usedOptions, setUsedOptions] = useState(options);
  const [getRequestInfo, setGetRequestInfo] = useState({ url: "", waiting: false, queryKey: "" });
  const hasPreselectedRef = useRef(false);
  const autocompleteRef = useRef(null); // Ref for focusing input after selection
  const filter = createFilterOptions({
    stringify: (option) => JSON.stringify(option),
  });

  const [offCanvasVisible, setOffCanvasVisible] = useState(false);
  const [fullObject, setFullObject] = useState(null);
  const [internalValue, setInternalValue] = useState(null); // Track selected value internally
  const [open, setOpen] = useState(false); // Control popover open state

  // Sync internalValue when external value or defaultValue prop changes (e.g., when editing a form)
  useEffect(() => {
    const currentValue = value !== undefined && value !== null ? value : defaultValue;
    if (currentValue !== undefined && currentValue !== null) {
      setInternalValue(currentValue);
    }
  }, [value, defaultValue]);

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
        // Convert each item into your { label, value, addedFields, rawData } shape
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
            description:
              typeof api?.descriptionField === "function"
                ? api.descriptionField(option)
                : api?.descriptionField
                  ? option[api?.descriptionField]
                  : undefined,
            addedFields,
            rawData: option, // Store the full original object
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
    [memoizedOptions],
  );

  return (
    <>
      <Autocomplete
        ref={autocompleteRef}
        key={stableKey}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={(event, reason) => {
          // Keep open if Tab was used in multiple mode
          if (reason === "selectOption" && multiple && event?.type === "click") {
            return;
          }
          setOpen(false);
        }}
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
              (option) => params.inputValue === option.value || params.inputValue === option.label,
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
                typeof item === "string" ? lookupOptionByValue(item) : item,
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
              (item) =>
                item.value && item.value !== "" && item.value !== "error" && item.value !== -1,
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

          // Track the internal value for the template view
          setInternalValue(newValue);

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
          [api],
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

              // In multiple mode, keep the popover open and refocus
              if (multiple) {
                setTimeout(() => {
                  setOpen(true);
                  const input = autocompleteRef.current?.querySelector("input");
                  if (input) {
                    input.focus();
                  }
                }, 50);
              }
            }
          }
        }}
        sx={sx}
        renderInput={(params) => {
          // Handle custom action button inside the TextField
          const { InputProps, ...otherParams } = params;
          const modifiedInputProps =
            customAction && customAction.position === "inside"
              ? {
                  ...InputProps,
                  endAdornment: (
                    <>
                      {customAction && (
                        <Tooltip title={customAction.tooltip || ""} placement="bottom" arrow>
                          <IconButton
                            component={customAction.link ? Link : "button"}
                            href={customAction.link || undefined}
                            size="small"
                            onClick={
                              customAction.onClick && !customAction.link
                                ? (e) => {
                                    e.stopPropagation();
                                    customAction.onClick(value || internalValue);
                                  }
                                : (e) => e.stopPropagation()
                            }
                            sx={{
                              opacity: 0,
                              transition: "all 0.2s",
                              p: "4px",
                              mr: "-4px",
                              mt: -1,
                              cursor: "pointer",
                              color: "inherit",
                              textDecoration: "none",
                              "&:hover": {
                                opacity: 1,
                                backgroundColor: "action.hover",
                              },
                              ".MuiAutocomplete-root:hover &": {
                                opacity: 0.6,
                              },
                              ".MuiAutocomplete-root:hover &:hover": {
                                opacity: 1,
                                backgroundColor: "action.hover",
                              },
                            }}
                          >
                            {customAction.icon}
                          </IconButton>
                        </Tooltip>
                      )}
                      {InputProps?.endAdornment}
                    </>
                  ),
                }
              : InputProps;

          return (
            <Stack direction="row" spacing={1}>
              <MemoTextField
                params={{ ...otherParams, InputProps: modifiedInputProps }}
                label={label}
                placeholder={placeholder}
                required={required}
                {...other}
              />
              {api?.url && api?.showRefresh && (
                <Tooltip title="Refresh">
                  <IconButton
                    size="small"
                    onClick={() => {
                      actionGetRequest.refetch();
                    }}
                  >
                    <Sync />
                  </IconButton>
                </Tooltip>
              )}
              {api?.templateView && (
                <Tooltip title={`View ${api?.templateView.title}` || "View details"}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      // Use internalValue if value prop is not available
                      const currentValue = value || internalValue;

                      // Get the full object from the selected value
                      if (multiple) {
                        // For multiple selection, get all full objects
                        const fullObjects = currentValue
                          .map((v) => {
                            const valueToFind = v?.value || v;
                            const found = usedOptions.find((opt) => opt.value === valueToFind);
                            let rawData = found?.rawData;

                            // If property is specified, extract and parse JSON from that property
                            if (rawData && api?.templateView?.property) {
                              try {
                                const propertyValue = rawData[api.templateView.property];
                                if (typeof propertyValue === "string") {
                                  rawData = JSON.parse(propertyValue);
                                } else {
                                  rawData = propertyValue;
                                }
                              } catch (e) {
                                console.error("Failed to parse JSON from property:", e);
                                // Keep original rawData if parsing fails
                              }
                            }

                            return rawData;
                          })
                          .filter(Boolean);
                        setFullObject(fullObjects);
                      } else {
                        // For single selection, get the full object
                        const valueToFind = currentValue?.value || currentValue;
                        const selectedOption = usedOptions.find((opt) => opt.value === valueToFind);
                        let rawData = selectedOption?.rawData || null;

                        // If property is specified, extract and parse JSON from that property
                        if (rawData && api?.templateView?.property) {
                          try {
                            const propertyValue = rawData[api.templateView.property];
                            if (typeof propertyValue === "string") {
                              rawData = JSON.parse(propertyValue);
                            } else {
                              rawData = propertyValue;
                            }
                          } catch (e) {
                            console.error("Failed to parse JSON from property:", e);
                            // Keep original rawData if parsing fails
                          }
                        }

                        setFullObject(rawData);
                      }
                      setOffCanvasVisible(true);
                    }}
                    title={api?.templateView.title || "View details"}
                  >
                    <Visibility />
                  </IconButton>
                </Tooltip>
              )}
              {customAction && customAction.position === "outside" && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (customAction.onClick) {
                      customAction.onClick(value || internalValue);
                    }
                  }}
                  title={customAction.tooltip || ""}
                >
                  {customAction.icon}
                </IconButton>
              )}
            </Stack>
          );
        }}
        groupBy={groupBy}
        renderGroup={renderGroup}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <Box component="li" key={key} {...optionProps}>
              <Box>
                <Typography variant="body1">{option.label}</Typography>
                {option.description && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    {option.description}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        }}
        {...other}
      />
      {api?.templateView && (
        <CippOffCanvas
          visible={offCanvasVisible}
          onClose={() => setOffCanvasVisible(false)}
          title={api?.templateView?.title || "Details"}
          size="xl"
        >
          <CippJsonView
            object={fullObject}
            defaultOpen={true}
            type={api?.templateView?.type ?? "default"}
          />
        </CippOffCanvas>
      )}
    </>
  );
};
