import { ArrowDropDown, Visibility } from '@mui/icons-material'
import {
  Autocomplete,
  CircularProgress,
  createFilterOptions,
  TextField,
  IconButton,
  Tooltip,
  Box,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { useEffect, useState, useMemo, useCallback, useRef, useImperativeHandle } from 'react'
import { useSettings } from '../../hooks/use-settings'
import { getCippError } from '../../utils/get-cipp-error'
import { ApiGetCallWithPagination } from '../../api/ApiCall'
import { Sync } from '@mui/icons-material'
import { Stack } from '@mui/system'
import React from 'react'
import { CippOffCanvas } from './CippOffCanvas'
import CippJsonView from '../CippFormPages/CippJSONView'

const MemoTextField = React.memo(function MemoTextField({
  params,
  label,
  placeholder,
  // Field-level required: asterisk on the label. HTML5 required is separate because
  // Autocomplete (especially multiple) clears the input after selection — a static
  // required on the input would falsely block submit even when chips/value exist.
  required = false,
  htmlRequired = false,
  // Autocomplete-specific props that must not be forwarded to TextField/DOM
  getOptionLabel,
  isOptionEqualToValue,
  filterOptions,
  getOptionDisabled,
  groupBy,
  renderGroup,
  renderOption,
  ...otherProps
}) {
  const { InputProps, ...otherParams } = params

  return (
    <Tooltip title={label || ''} placement="top" arrow>
      <TextField
        {...otherParams}
        label={label}
        placeholder={placeholder}
        {...otherProps}
        required={htmlRequired}
        slotProps={{
          inputLabel: {
            shrink: true,
            sx: { transition: 'none' },
            required,
          },
          input: {
            ...InputProps,
            sx: {
              transition: 'none',
              '& .MuiOutlinedInput-notchedOutline': {
                transition: 'none',
              },
            },
          },
        }}
      />
    </Tooltip>
  )
})

export const CippAutoComplete = React.forwardRef((props, ref) => {
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
    handleHomeEndKeys = false,
    ...other
  } = props

  const [usedOptions, setUsedOptions] = useState(options)
  const [getRequestInfo, setGetRequestInfo] = useState({ url: '', waiting: false, queryKey: '' })
  const hasPreselectedRef = useRef(false)
  const autocompleteRef = useRef(null) // Ref for focusing input after selection

  useImperativeHandle(
    ref,
    () => ({
      focus() {
        const input = autocompleteRef.current?.querySelector('input')
        input?.focus()
        input?.select()
      },
    }),
    []
  )
  const listboxRef = useRef(null) // Ref for the listbox to preserve scroll position
  const scrollPositionRef = useRef(0) // Store scroll position
  const filter = createFilterOptions({
    stringify: (option) => JSON.stringify(option),
  })

  const [offCanvasVisible, setOffCanvasVisible] = useState(false)
  const [fullObject, setFullObject] = useState(null)
  const [internalValue, setInternalValue] = useState(null) // Track selected value internally
  const [open, setOpen] = useState(false) // Control popover open state

  // Sync internalValue when external value or defaultValue prop changes (e.g., when editing a form)
  useEffect(() => {
    const currentValue = value !== undefined && value !== null ? value : defaultValue
    if (currentValue !== undefined && currentValue !== null) {
      setInternalValue((prev) => {
        // Compare by value to avoid infinite re-render loops when the parent
        // passes an object with the same contents but a new reference.
        if (prev && typeof prev === 'object' && typeof currentValue === 'object') {
          if (prev.value === currentValue.value && prev.label === currentValue.label) {
            return prev
          }
        }
        if (prev === currentValue) return prev
        return currentValue
      })
    }
  }, [value, defaultValue])

  // Controlled value wins; otherwise use the onChange-tracked selection (FormComponent
  // often drives via defaultValue + onChange rather than a controlled value prop).
  const currentSelection = value !== undefined && value !== null ? value : internalValue
  const hasSelection = multiple
    ? Array.isArray(currentSelection) && currentSelection.length > 0
    : currentSelection != null && currentSelection !== ''

  // This is our paginated call
  const actionGetRequest = ApiGetCallWithPagination({
    ...getRequestInfo,
  })

  const currentTenant = api?.tenantFilter ? api.tenantFilter : useSettings().currentTenant
  useEffect(() => {
    if (actionGetRequest.isSuccess && !actionGetRequest.isFetching) {
      // Guard against a non-paginated cache shape (e.g. when a queryKey is accidentally shared
      // with a useQuery/ApiGetCall consumer that stores a plain array instead of { pages }).
      const pages = actionGetRequest.data?.pages
      const lastPage = Array.isArray(pages) ? pages[pages.length - 1] : undefined
      const nextLinkExists = lastPage?.Metadata?.nextLink
      if (nextLinkExists) {
        actionGetRequest.fetchNextPage()
      }
    }
  }, [actionGetRequest.data?.pages?.length, actionGetRequest.isFetching, api?.queryKey])

  const apiRef = useRef(api)
  apiRef.current = api

  const apiUrl = api?.url
  const apiQueryKey = api?.queryKey
  useEffect(() => {
    const currentApi = apiRef.current
    if (currentApi) {
      const tenantScoped = !currentApi.excludeTenantFilter
      setGetRequestInfo({
        url: currentApi.url,
        data: {
          ...(tenantScoped ? { tenantFilter: currentTenant } : null),
          ...currentApi.data,
        },
        waiting: true,
        queryKey:
          tenantScoped && currentApi.queryKey
            ? `${currentApi.queryKey}-${currentTenant}`
            : currentApi.queryKey,
      })
    }
  }, [apiUrl, apiQueryKey, currentTenant])

  // After the data is fetched, combine and map it
  useEffect(() => {
    if (actionGetRequest.isSuccess) {
      const currentApi = apiRef.current
      // E.g., allPages is an array of pages returned by the pagination
      const allPages = actionGetRequest.data?.pages || []

      // Helper to get nested data if you have something like "response.data.items"
      const getNestedValue = (obj, path) => {
        if (!path) return obj
        const keys = path.split('.')
        let result = obj
        for (const key of keys) {
          if (result && typeof result === 'object' && key in result) {
            result = result[key]
          } else {
            return undefined
          }
        }
        return result
      }

      // Flatten the results from all pages. A dataKey can be present but null (e.g. an API
      // returning {"Accounts":null}), which must read as "no options", not as a null option.
      const combinedResults = allPages.flatMap((page) => {
        const nestedData = getNestedValue(page, currentApi?.dataKey)
        return nestedData ?? []
      })

      if (!Array.isArray(combinedResults)) {
        setUsedOptions([
          {
            label: 'Error: The API returned data we cannot map to this field',
            value: 'Error',
          },
        ])
      } else {
        // Convert each item into your { label, value, addedFields, rawData } shape.
        // Null items would throw on the label/value field lookups below.
        const convertedOptions = combinedResults
          .filter((option) => option !== null && option !== undefined)
          .map((option) => {
          const addedFields = {}
          if (currentApi?.addedField) {
            Object.keys(currentApi.addedField).forEach((key) => {
              addedFields[key] = option[currentApi.addedField[key]]
            })
          }

          return {
            label:
              typeof currentApi?.labelField === 'function'
                ? currentApi.labelField(option)
                : option[currentApi?.labelField]
                  ? option[currentApi?.labelField]
                  : option[currentApi?.altLabelField] ||
                    option[currentApi?.valueField] ||
                    'No label found - Are you missing a labelField?',
            value:
              typeof currentApi?.valueField === 'function'
                ? currentApi.valueField(option)
                : option[currentApi?.valueField],
            description:
              typeof currentApi?.descriptionField === 'function'
                ? currentApi.descriptionField(option)
                : currentApi?.descriptionField
                  ? option[currentApi?.descriptionField]
                  : undefined,
            addedFields,
            rawData: option, // Store the full original object
          }
        })

        if (currentApi?.dataFilter) {
          setUsedOptions(currentApi.dataFilter(convertedOptions))
        } else {
          setUsedOptions(convertedOptions)
        }
      }
    }

    if (actionGetRequest.isError) {
      setUsedOptions([{ label: getCippError(actionGetRequest.error), value: 'error' }])
    }
  }, [actionGetRequest.data, actionGetRequest.isSuccess, actionGetRequest.isError, actionGetRequest.error, apiRef])

  const memoizedOptions = useMemo(() => {
    let finalOptions = api ? usedOptions : options
    if (removeOptions && removeOptions.length) {
      finalOptions = finalOptions.filter((o) => !removeOptions.includes(o.value))
    }
    if (sortOptions) {
      finalOptions.sort((a, b) => String(a.label ?? "").localeCompare(String(b.label ?? "")))
    }
    return finalOptions
  }, [api, usedOptions, options, removeOptions, sortOptions])

  // Dedicated effect for handling preselected value or auto-select first item - only runs once
  useEffect(() => {
    if (memoizedOptions.length > 0 && !hasPreselectedRef.current) {
      // Check if we should skip preselection due to existing defaultValue
      const hasDefaultValue =
        defaultValue && (Array.isArray(defaultValue) ? defaultValue.length > 0 : true)

      if (!hasDefaultValue) {
        // For multiple mode, check if value is empty array or null/undefined
        // For single mode, check if value is null/undefined
        const shouldPreselect = multiple
          ? !value || (Array.isArray(value) && value.length === 0)
          : !value

        if (shouldPreselect) {
          let preselectedOption

          // Handle explicit preselected value
          if (preselectedValue) {
            preselectedOption = memoizedOptions.find((option) => option.value === preselectedValue)
          }
          // Handle auto-select first item from API
          else if (api?.autoSelectFirstItem && memoizedOptions.length > 0) {
            preselectedOption = memoizedOptions[0]
          }

          if (preselectedOption) {
            const newValue = multiple ? [preselectedOption] : preselectedOption
            hasPreselectedRef.current = true // Mark that we've preselected
            if (onChange) {
              onChange(newValue, newValue?.addedFields)
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
  ])

  // single mode: live options win over the form-held copy, a stored label goes stale
  // when its option refetches under it (e.g. renamed preset), resolve by value id
  const resolvedDefaultValue = useMemo(() => {
    if (
      multiple ||
      Array.isArray(defaultValue) ||
      typeof defaultValue !== 'object' ||
      defaultValue === null
    ) {
      return defaultValue
    }
    return memoizedOptions.find((option) => option.value === defaultValue.value) ?? defaultValue
  }, [defaultValue, multiple, memoizedOptions])

  // Create a stable key that only changes when necessary inputs change
  const stableKey = useMemo(() => {
    // Only regenerate the key when these values change
    const keyParts = [
      JSON.stringify(resolvedDefaultValue),
      JSON.stringify(preselectedValue),
      api?.url,
      currentTenant,
    ]
    return keyParts.join('-')
  }, [resolvedDefaultValue, preselectedValue, api?.url, currentTenant])

  // keyed remount orphans an open single-mode popup (input unfocused, no close path), multiple refocuses in onChange
  useEffect(() => {
    if (!multiple) {
      setOpen(false)
    }
  }, [stableKey, multiple])

  const lookupOptionByValue = useCallback(
    (value) => {
      const foundOption = memoizedOptions.find((option) => option.value === value)
      return foundOption || { label: value, value: value }
    },
    [memoizedOptions]
  )

  // shape the seed for MUI: option arrays stay arrays, single objects wrap in multiple mode, strings resolve to options
  const normalizedDefaultValue = useMemo(() => {
    if (Array.isArray(resolvedDefaultValue)) {
      return resolvedDefaultValue.map((item) =>
        typeof item === 'string' ? lookupOptionByValue(item) : item
      )
    }
    if (typeof resolvedDefaultValue === 'object' && multiple) {
      return [resolvedDefaultValue]
    }
    if (typeof resolvedDefaultValue === 'string') {
      return lookupOptionByValue(resolvedDefaultValue)
    }
    return resolvedDefaultValue
  }, [resolvedDefaultValue, multiple, lookupOptionByValue])

  return (
    <>
      <Autocomplete
        ref={autocompleteRef}
        key={stableKey}
        handleHomeEndKeys={handleHomeEndKeys}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={(event, reason) => {
          // Keep open if Tab was used in multiple mode
          if (reason === 'selectOption' && multiple && event?.type === 'click') {
            return
          }
          setOpen(false)
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
        value={typeof value === 'string' ? lookupOptionByValue(value) : value}
        filterSelectedOptions
        disableClearable={disableClearable}
        multiple={multiple}
        fullWidth
        placeholder={placeholder}
        filterOptions={(options, params) => {
          const filtered = filter(options, params)
          const isExisting =
            options?.length > 0 &&
            options.some(
              (option) => params.inputValue === option.value || params.inputValue === option.label
            )
          if (params.inputValue !== '' && creatable && !isExisting) {
            const newOption = {
              label: `Add option: "${params.inputValue}"`,
              value: params.inputValue,
              manual: true,
            }
            if (!filtered.some((option) => option.value === newOption.value)) {
              filtered.push(newOption)
            }
          }

          return filtered
        }}
        size="small"
        defaultValue={normalizedDefaultValue}
        name={name}
        onChange={(event, newValue) => {
          // Store scroll position before processing the change
          if (multiple && listboxRef.current) {
            scrollPositionRef.current = listboxRef.current.scrollTop
          }

          if (Array.isArray(newValue)) {
            newValue = newValue.map((item) => {
              // If user typed a new item or missing label
              if (item?.manual || !item?.label) {
                item = {
                  label: item?.label ? item.value : item,
                  value: item?.label ? item.value : item,
                }
                if (onCreateOption) {
                  item = onCreateOption(item, item?.addedFields)
                }
              }
              return item
            })
            newValue = newValue.filter(
              (item) =>
                item.value !== null &&
                item.value !== undefined &&
                item.value !== '' &&
                item.value !== 'error' &&
                item.value !== -1
            )
          } else {
            if (newValue?.manual || !newValue?.label) {
              newValue = {
                label: newValue?.label ? newValue.value : newValue,
                value: newValue?.label ? newValue.value : newValue,
              }
              if (onCreateOption) {
                newValue = onCreateOption(newValue, newValue?.addedFields)
              }
            }
            if (newValue?.value === null || newValue?.value === undefined || newValue?.value === '' || newValue.value === 'error') {
              newValue = null
            }
          }

          // Track the internal value for the template view
          setInternalValue(newValue)

          if (onChange) {
            onChange(newValue, newValue?.addedFields)
          }

          // In multiple mode, refocus the input and restore scroll position
          if (multiple && newValue && autocompleteRef.current) {
            // Use setTimeout to ensure the selection is processed first
            setTimeout(() => {
              const input = autocompleteRef.current?.querySelector('input')
              if (input) {
                input.focus()
              }

              // Restore the scroll position
              if (listboxRef.current && scrollPositionRef.current > 0) {
                listboxRef.current.scrollTop = scrollPositionRef.current
              }
            }, 0)
          }
        }}
        options={memoizedOptions}
        getOptionLabel={useCallback(
          (option) => {
            if (!option) return ''
            // For static options (non-API), the option should already have a label
            if (!api && option.label !== undefined) {
              return option.label === null ? '' : String(option.label)
            }
            // For API options, use the existing logic. An empty/valueless option renders
            // blank; the debug hint only shows when a real value is missing its label.
            if (api) {
              if (option.label === null || option.label === '') return ''
              if (option.label === undefined && (option.value === undefined || option.value === null || option.value === '')) {
                return ''
              }
              return option.label || 'Label not found - Are you missing a labelField?'
            }
            // Fallback for any edge cases (e.g. preset filter objects with filterName)
            return (
              option.label ||
              option.filterName ||
              (typeof option.value === 'string' ? option.value : '') ||
              ''
            )
          },
          [api]
        )}
        onKeyDown={(event) => {
          // Handle Tab key to select highlighted option
          if (event.key === 'Tab' && !event.shiftKey) {
            // Check if there's a highlighted option
            const listbox = document.querySelector('[role="listbox"]')
            const highlightedOption = listbox?.querySelector('[data-focus="true"], .Mui-focused')

            if (highlightedOption && listbox?.style.display !== 'none') {
              event.preventDefault()
              // Trigger a click on the highlighted option
              highlightedOption.click()

              // In multiple mode, keep the popover open and refocus
              if (multiple) {
                setTimeout(() => {
                  setOpen(true)
                  const input = autocompleteRef.current?.querySelector('input')
                  if (input) {
                    input.focus()
                  }
                }, 50)
              }
            }
          }
        }}
        sx={sx}
        renderInput={(params) => {
          // Handle custom action button inside the TextField
          const { InputProps, ...otherParams } = params
          const modifiedInputProps =
            customAction && customAction.position === 'inside'
              ? {
                  ...InputProps,
                  endAdornment: (
                    <>
                      {customAction && (
                        <Tooltip title={customAction.tooltip || ''} placement="bottom" arrow>
                          <IconButton
                            component={customAction.link ? Link : 'button'}
                            href={customAction.link || undefined}
                            size="small"
                            onClick={
                              customAction.onClick && !customAction.link
                                ? (e) => {
                                    e.stopPropagation()
                                    customAction.onClick(value || internalValue)
                                  }
                                : (e) => e.stopPropagation()
                            }
                            sx={{
                              opacity: 0,
                              transition: 'all 0.2s',
                              p: '4px',
                              mr: '-4px',
                              mt: -1,
                              cursor: 'pointer',
                              color: 'inherit',
                              textDecoration: 'none',
                              '&:hover': {
                                opacity: 1,
                                backgroundColor: 'action.hover',
                              },
                              '.MuiAutocomplete-root:hover &': {
                                opacity: 0.6,
                              },
                              '.MuiAutocomplete-root:hover &:hover': {
                                opacity: 1,
                                backgroundColor: 'action.hover',
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
              : InputProps

          return (
            <Stack direction="row" spacing={1}>
              <MemoTextField
                params={{ ...otherParams, InputProps: modifiedInputProps }}
                label={label}
                placeholder={placeholder}
                required={required}
                htmlRequired={required && !hasSelection}
                {...other}
              />
              {api?.url && api?.showRefresh && (
                <Tooltip title="Refresh">
                  <IconButton
                    size="small"
                    onClick={() => {
                      actionGetRequest.refetch()
                    }}
                  >
                    <Sync />
                  </IconButton>
                </Tooltip>
              )}
              {api?.templateView && (
                <Tooltip title={`View ${api?.templateView.title}` || 'View details'}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      // Use internalValue if value prop is not available
                      const currentValue = value || internalValue

                      // Get the full object from the selected value
                      if (multiple) {
                        // For multiple selection, get all full objects
                        const fullObjects = currentValue
                          .map((v) => {
                            const valueToFind = v?.value || v
                            const found = usedOptions.find((opt) => opt.value === valueToFind)
                            let rawData = found?.rawData

                            // If property is specified, extract and parse JSON from that property
                            if (rawData && api?.templateView?.property) {
                              try {
                                const propertyValue = rawData[api.templateView.property]
                                if (typeof propertyValue === 'string') {
                                  rawData = JSON.parse(propertyValue)
                                } else {
                                  rawData = propertyValue
                                }
                              } catch (e) {
                                console.error('Failed to parse JSON from property:', e)
                                // Keep original rawData if parsing fails
                              }
                            }

                            return rawData
                          })
                          .filter(Boolean)
                        setFullObject(fullObjects)
                      } else {
                        // For single selection, get the full object
                        const valueToFind = currentValue?.value || currentValue
                        const selectedOption = usedOptions.find((opt) => opt.value === valueToFind)
                        let rawData = selectedOption?.rawData || null

                        // If property is specified, extract and parse JSON from that property
                        if (rawData && api?.templateView?.property) {
                          try {
                            const propertyValue = rawData[api.templateView.property]
                            if (typeof propertyValue === 'string') {
                              rawData = JSON.parse(propertyValue)
                            } else {
                              rawData = propertyValue
                            }
                          } catch (e) {
                            console.error('Failed to parse JSON from property:', e)
                            // Keep original rawData if parsing fails
                          }
                        }

                        setFullObject(rawData)
                      }
                      setOffCanvasVisible(true)
                    }}
                    title={api?.templateView.title || 'View details'}
                  >
                    <Visibility />
                  </IconButton>
                </Tooltip>
              )}
              {customAction && customAction.position === 'outside' && (
                <Tooltip title={customAction.tooltip || ''} placement="bottom" arrow>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (customAction.onClick) {
                        customAction.onClick(value || internalValue)
                      }
                    }}
                    {...customAction.buttonProps}
                  >
                    {customAction.icon}
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          )
        }}
        groupBy={groupBy}
        renderGroup={renderGroup}
        slotProps={{
          listbox: {
            ref: listboxRef,
            onScroll: (e) => {
              if (listboxRef.current) {
                scrollPositionRef.current = e.target.scrollTop
              }
            },
          },
        }}
        renderOption={(props, option, { index }) => {
          const { key, ...optionProps } = props
          return (
            <Box component="li" key={`${option.value}-${index}`} {...optionProps}>
              <Box>
                <Typography variant="body1">{option.label}</Typography>
                {option.description && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {option.description}
                  </Typography>
                )}
              </Box>
            </Box>
          )
        }}
        {...other}
      />
      {api?.templateView && (
        <CippOffCanvas
          visible={offCanvasVisible}
          onClose={() => setOffCanvasVisible(false)}
          title={api?.templateView?.title || 'Details'}
          size="xl"
        >
          <CippJsonView
            object={fullObject}
            defaultOpen={true}
            type={api?.templateView?.type ?? 'default'}
          />
        </CippOffCanvas>
      )}
    </>
  )
})
CippAutoComplete.displayName = 'CippAutoComplete'
