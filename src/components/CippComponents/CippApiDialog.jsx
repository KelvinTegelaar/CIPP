import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { Stack } from '@mui/system'
import { CippApiResults } from './CippApiResults'
import { CippIcons } from '../../utils/icon-registry'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { useForm, useFormState } from 'react-hook-form'
import { useSettings } from '../../hooks/use-settings'
import CippFormComponent from './CippFormComponent'
import { CippFormCondition } from './CippFormCondition'
import {
  getNestedValue as getRowPath,
  getRowTenant,
  withRowTenant,
} from '../../utils/resolve-row-templates'
import { tenantScope } from '../../utils/tenant-selection'
import {
  extractCsvColumnValues,
  mergeCsvFormFields,
  normalizeAutoCompleteValues,
} from '../../utils/csv-field-values'

const BULK_LABEL_KEYS = [
  'displayName',
  'DisplayName',
  'Displayname',
  'userPrincipalName',
  'UPN',
  'name',
  'Name',
  'templateName',
  'TemplateName',
  'title',
  'Title',
  'applicationName',
  'productName',
  'RoleName',
  'mail',
]

export const CippApiDialog = (props) => {
  const {
    createDialog,
    title,
    fields,
    api,
    row = {},
    relatedQueryKeys,
    dialogAfterEffect,
    allowResubmit = false,
    children,
    defaultvalues,
    // Optional. Supplying a form lets the caller watch and drive the dialog's fields while it is
    // open - the custom variables page uses it to default a variable's type from how the same name
    // is typed elsewhere. Omitted, the dialog owns its form exactly as before.
    formHook: externalFormHook,
    // Selected rows the table's current search or filter hides; listed first in a bulk confirmation.
    hiddenRows,
    ...other
  } = props
  const router = useRouter()
  const linkOpenedRef = useRef(false)
  const [addedFieldData, setAddedFieldData] = useState({})
  const [partialResults, setPartialResults] = useState([])
  const [isFormSubmitted, setIsFormSubmitted] = useState(false)
  // null until toggled, so the list follows whether any selected row is hidden
  const [bulkListOpen, setBulkListOpen] = useState(null)
  const mdDown = useMediaQuery((theme) => theme.breakpoints.down('md'))

  if (mdDown) {
    other.fullScreen = true
  }

  const internalFormHook = useForm({
    defaultValues: typeof defaultvalues === 'function' ? defaultvalues(row) : defaultvalues || {},
    mode: 'onChange', // Enable real-time validation
  })
  const formHook = externalFormHook ?? internalFormHook

  // Get form state for validation
  const { isValid } = useFormState({ control: formHook.control })

  useEffect(() => {
    if (createDialog.open) {
      setIsFormSubmitted(false)
      formHook.reset(typeof defaultvalues === 'function' ? defaultvalues(row) : defaultvalues || {})
    }
  }, [createDialog.open, defaultvalues])

  const [getRequestInfo, setGetRequestInfo] = useState({
    url: '',
    waiting: false,
    queryKey: '',
    relatedQueryKeys: relatedQueryKeys ?? api.relatedQueryKeys ?? title,
    bulkRequest: api.multiPost === false,
    onResult: (result) => setPartialResults((prev) => [...prev, result]),
  })

  const actionPostRequest = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: relatedQueryKeys ?? api.relatedQueryKeys ?? title,
    bulkRequest: api.multiPost === false,
    onResult: (result, meta) => {
      setPartialResults((prev) => [...prev, result])
      if (!meta?.failed) api?.onSuccess?.(result)
    },
  })

  const actionGetRequest = ApiGetCall({
    ...getRequestInfo,
    relatedQueryKeys: relatedQueryKeys ?? api.relatedQueryKeys ?? title,
    bulkRequest: api.multiPost === false,
    onResult: (result, meta) => {
      setPartialResults((prev) => [...prev, result])
      if (!meta?.failed) api?.onSuccess?.(result)
    },
  })

  // Whenever the dialog is (re)opened, discard any results from a previous run
  // so a freshly created window never shows stale output from an earlier action.
  // The POST mutation and GET query retain their last result while this component
  // stays mounted, so clear both alongside the streamed partial results.
  useEffect(() => {
    if (createDialog.open) {
      setPartialResults([])
      actionPostRequest.reset()
      setGetRequestInfo((prev) => ({ ...prev, waiting: false, queryKey: '' }))
    }
  }, [createDialog.open])

  const processActionData = (dataObject, row, replacementBehaviour) => {
    if (typeof api?.dataFunction === 'function') return api.dataFunction(row, dataObject)

    let newData = {}
    if (api?.postEntireRow) {
      return row
    }

    if (!dataObject) {
      return dataObject
    }

    Object.keys(dataObject).forEach((key) => {
      const value = dataObject[key]

      if (typeof value === 'string' && value.startsWith('!')) {
        newData[key] = value.slice(1)
      } else if (typeof value === 'string') {
        const nested = getRowPath(row, value)
        newData[key] = nested !== undefined ? nested : value
      } else if (typeof value === 'boolean') {
        newData[key] = value
      } else if (typeof value === 'object' && value !== null) {
        const processedValue = processActionData(value, row, replacementBehaviour)
        if (replacementBehaviour !== 'removeNulls' || Object.keys(processedValue).length > 0) {
          newData[key] = processedValue
        }
      } else if (replacementBehaviour !== 'removeNulls') {
        newData[key] = value
      }
    })

    return newData
  }

  const tenantFilter = useSettings().currentTenant

  const handleActionClick = (row, action, rawFormData) => {
    setIsFormSubmitted(true)
    // The typed-confirmation field only gates the submit button; it never reaches the API.
    const { __confirmPhrase, ...formData } = rawFormData ?? {}
    const resolvedFormData = mergeCsvFormFields(formData, fields)
    let finalData = {}
    let isBulkRequest = false
    if (typeof api?.customDataformatter === 'function') {
      finalData = api.customDataformatter(row, action, resolvedFormData)
      isBulkRequest = Array.isArray(finalData)
    } else {
      if (action.multiPost === undefined) action.multiPost = false

      if (api.customFunction) {
        action.customFunction(row, action, resolvedFormData)
        createDialog.handleClose()
        return
      }

      const processedActionData = processActionData(action.data, row, action.replacementBehaviour)

      if (!processedActionData || Object.keys(processedActionData).length === 0) {
        console.warn('No data to process for action:', action)
      } else {
        // MULTI ROW CASES
        if (Array.isArray(row)) {
          const arrayData = row.map((singleRow) => {
            const commonData = {
              ...tenantScope(getRowTenant(singleRow, tenantFilter)),
              ...resolvedFormData,
              ...addedFieldData,
            }
            const itemData = { ...commonData }
            Object.keys(processedActionData).forEach((key) => {
              const mapped = processedActionData[key]
              const rowValue =
                typeof mapped === 'string' ? getRowPath(singleRow, mapped) : undefined
              itemData[key] = rowValue !== undefined ? rowValue : mapped
            })
            return itemData
          })

          const payload = {
            url: action.url,
            bulkRequest: !action.multiPost,
            data: arrayData,
          }

          if (action.type === 'POST') {
            actionPostRequest.mutate(payload)
          } else if (action.type === 'GET') {
            setGetRequestInfo({
              ...payload,
              waiting: true,
              queryKey: Date.now(),
            })
          }

          return
        }
      }

      // SINGLE ROW CASE
      const commonData = {
        ...tenantScope(getRowTenant(row, tenantFilter)),
        ...resolvedFormData,
        ...addedFieldData,
      }

      finalData = {
        ...commonData,
        ...processedActionData,
      }
    }

    if (action.type === 'POST') {
      actionPostRequest.mutate({
        url: action.url,
        bulkRequest: isBulkRequest,
        data: finalData,
      })
    } else if (action.type === 'GET') {
      setGetRequestInfo({
        url: action.url,
        waiting: true,
        queryKey: Date.now(),
        bulkRequest: isBulkRequest,
        data: finalData,
      })
    }
  }

  useEffect(() => {
    if (dialogAfterEffect && (actionPostRequest.isSuccess || actionGetRequest.isSuccess)) {
      dialogAfterEffect(actionPostRequest.data?.data || actionGetRequest.data)
    }
  }, [actionPostRequest.isSuccess, actionGetRequest.isSuccess])

  const onSubmit = (data) => handleActionClick(row, api, data)
  const selectedType = api.type === 'POST' ? actionPostRequest : actionGetRequest

  useEffect(() => {
    if (api?.setDefaultValues && createDialog.open) {
      fields.forEach((field) => {
        const targetName = field.name.replace(/\[(\w+)\]/g, '.$1')
        const val = targetName
          .split('.')
          .reduce((acc, key) => (acc != null ? acc[key] : undefined), row)
        if (
          (typeof val === 'string' && field.type === 'textField') ||
          (typeof val === 'boolean' && field.type === 'switch')
        ) {
          formHook.setValue(targetName, val)
        } else if (Array.isArray(val) && field.type === 'autoComplete') {
          const values = val
            .map((el) =>
              el?.label && el?.value
                ? el
                : typeof el === 'string' || typeof el === 'number'
                  ? { label: el, value: el }
                  : null
            )
            .filter(Boolean)
          formHook.setValue(targetName, values)
        } else if (field.type === 'autoComplete' && val) {
          formHook.setValue(
            targetName,
            typeof val === 'string'
              ? { label: val, value: val }
              : val.label && val.value
                ? val
                : undefined
          )
        }
      })
    }
  }, [createDialog.open, api?.setDefaultValues])

  // Values land in React text nodes, which escape on render; pre-escaping shows &amp; to the user.
  const getRawNestedValue = (obj, path) => {
    return path
      .split('.')
      .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj)
  }
  const getNestedValue = getRawNestedValue

  // Handle link actions - opens the link when dialog opens, using ref to prevent duplicates
  useEffect(() => {
    if (
      api.link &&
      createDialog.open &&
      row &&
      Object.keys(row).length > 0 &&
      !linkOpenedRef.current
    ) {
      linkOpenedRef.current = true
      const placeholder = /\[([^\]]+)\]/g
      const hasValue = (value) => value !== undefined && value !== null && value !== ''
      if (api.link.startsWith('/') && !api?.external) {
        // Internal routes only ever substitute ids and query values, so encode them: the row
        // is tenant data and must not be able to inject path segments or a second origin.
        const internalLink = api.link.replace(placeholder, (_, key) => {
          const value = getRawNestedValue(row, key)
          return hasValue(value) ? encodeURIComponent(String(value)) : `[${key}]`
        })
        router.push(withRowTenant(internalLink, row, tenantFilter), undefined, { shallow: true })
      } else {
        // External links may substitute a whole URL (e.g. [webUrl]) and are left as-is.
        const externalLink = api.link.replace(placeholder, (_, key) => {
          const value = getRawNestedValue(row, key)
          return hasValue(value) ? value : `[${key}]`
        })
        window.open(externalLink, api.target || '_blank')
      }
      createDialog.handleClose()
    }
  }, [api.link, createDialog.open, row, router])

  // Reset the ref when dialog closes so the same link can be opened again
  useEffect(() => {
    if (!createDialog.open) {
      linkOpenedRef.current = false
    }
  }, [createDialog.open])

  useEffect(() => {
    if (api.noConfirm && !api.link) {
      formHook.handleSubmit(onSubmit)()
      createDialog.handleClose()
    }
  }, [api.noConfirm, api.link])

  const handleClose = () => {
    createDialog.handleClose()
    setPartialResults([])
    setBulkListOpen(null)
  }

  // Bulk: a placeholder shared by every selected row keeps its value, unless that would leave
  // no placeholder showing the selection count.
  const bulkReplace = (text) => {
    const countPhrase = `the ${row.length} selected rows`
    const sharedValue = (key) => {
      const values = new Set(row.map((r) => getNestedValue(r, key)))
      const [value] = values
      return values.size === 1 ? value : undefined
    }
    const keys = [...text.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1])
    if (keys.every((key) => sharedValue(key))) return text.replace(/\[([^\]]+)\]/g, countPhrase)
    return text.replace(/\[([^\]]+)\]/g, (_, key) => sharedValue(key) || countPhrase)
  }

  // confirmText may be a function of the row / selected rows; its result is interpolated as usual.
  const rawConfirmText =
    typeof api?.confirmText === 'function' ? api.confirmText(row) : api?.confirmText

  let confirmText
  if (typeof rawConfirmText === 'string') {
    if (!Array.isArray(row)) {
      confirmText = rawConfirmText.replace(
        /\[([^\]]+)\]/g,
        (_, key) => getNestedValue(row, key) || `[${key}]`
      )
    } else if (row.length > 1) {
      confirmText = bulkReplace(rawConfirmText)
    } else if (row.length === 1) {
      confirmText = rawConfirmText.replace(
        /\[([^\]]+)\]/g,
        (_, key) => getNestedValue(row[0], key) || `[${key}]`
      )
    }
  } else {
    const replaceTextInElement = (element) => {
      if (!element) return element
      if (typeof element === 'string') {
        if (Array.isArray(row)) {
          return row.length > 1
            ? bulkReplace(element)
            : element.replace(
                /\[([^\]]+)\]/g,
                (_, key) => getNestedValue(row[0], key) || `[${key}]`
              );
        }
        return element.replace(/\[([^\]]+)\]/g, (_, key) => getNestedValue(row, key) || `[${key}]`);
      }
      if (React.isValidElement(element)) {
        const newChildren = React.Children.map(element.props.children, replaceTextInElement)
        return React.cloneElement(element, {}, newChildren)
      }
      return element
    }
    confirmText = replaceTextInElement(rawConfirmText)
  }

  // Optional typed confirmation: api.confirmPhrase is a string (with [field] interpolation from
  // the row) or a function of the row / selected rows returning the phrase, or null/'' to skip.
  // While set, the Confirm button stays disabled until the user types the phrase exactly.
  let confirmPhrase = null
  if (api?.confirmPhrase) {
    if (typeof api.confirmPhrase === 'function') {
      confirmPhrase = api.confirmPhrase(row)
    } else if (Array.isArray(row)) {
      confirmPhrase =
        row.length > 1
          ? `CONFIRM ${row.length} ITEMS`
          : api.confirmPhrase.replace(/\[([^\]]+)\]/g, (_, key) => getNestedValue(row[0], key) || '')
    } else {
      confirmPhrase = api.confirmPhrase.replace(
        /\[([^\]]+)\]/g,
        (_, key) => getNestedValue(row, key) || ''
      )
    }
    if (typeof confirmPhrase !== 'string' || confirmPhrase.trim() === '') confirmPhrase = null
  }

  // Bulk confirmations name every selected row so nothing is acted on unseen.
  let bulkRowList = null
  if (Array.isArray(row) && row.length > 1) {
    const usable = (value) =>
      value !== undefined && value !== null && value !== '' && typeof value !== 'object'
    // The confirm text's placeholders describe the row best, so their values are joined first.
    const placeholderKeys =
      typeof rawConfirmText === 'string'
        ? [...new Set([...rawConfirmText.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]))]
        : []
    const fallbackKeys = [
      ...BULK_LABEL_KEYS,
      // then the fields the action posts, which identify the row it acts on
      ...Object.values(api?.data ?? {}).filter((v) => typeof v === 'string' && !v.startsWith('!')),
      'id',
    ]
    const placeholderLabel = (r) => {
      const parts = placeholderKeys.map((key) => getNestedValue(r, key)).filter(usable)
      return parts.length ? [...new Set(parts.map(String))].join(' · ') : null
    }
    const fallbackLabel = (r) => {
      const value = fallbackKeys.map((key) => getNestedValue(r, key)).find(usable)
      return value === undefined ? null : String(value)
    }
    const isHidden = (r) => Boolean(hiddenRows?.has(r))
    const ordered = [...row.filter(isHidden), ...row.filter((r) => !isHidden(r))]
    const hiddenCount = ordered.filter(isHidden).length
    const byPlaceholder = ordered.map(placeholderLabel)
    // Placeholders that leave a row unnamed or two rows alike can't tell rows apart.
    const labels =
      byPlaceholder.every(Boolean) && new Set(byPlaceholder).size === byPlaceholder.length
        ? byPlaceholder
        : ordered.map(fallbackLabel)
    // Without a name for every row a partial list misleads, so only the counts show.
    const canName = labels.every(Boolean)
    const listOpen = bulkListOpen ?? hiddenCount > 0
    const summary = (
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {row.length} selected
        {hiddenCount > 0 && (
          <Box component="span" sx={{ color: 'warning.main' }}>
            , {hiddenCount} hidden by the current search or filter
          </Box>
        )}
      </Typography>
    )
    bulkRowList = canName ? (
      <Accordion
        disableGutters
        variant="outlined"
        expanded={listOpen}
        onChange={(_, expanded) => setBulkListOpen(expanded)}
        slotProps={{ transition: { unmountOnExit: true } }}
      >
        <AccordionSummary expandIcon={<CippIcons.ExpandMore />}>{summary}</AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <Box component="ul" sx={{ m: 0, pl: 2.5, maxHeight: 240, overflowY: 'auto' }}>
            {ordered.map((r, index) => (
              <Typography component="li" variant="body2" key={index}>
                {labels[index]}
                {isHidden(r) && (
                  <Box component="span" sx={{ color: 'warning.main' }}>
                    {' '}
                    (hidden)
                  </Box>
                )}
              </Typography>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
    ) : (
      summary
    )
  }

  return (
    <>
      {!api?.link && (
        <Dialog fullWidth maxWidth="sm" onClose={handleClose} open={createDialog.open} {...other}>
          <form onSubmit={formHook.handleSubmit(onSubmit)}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                {/* wrapped so Stack spacing applies: it styles element children, not bare text */}
                {confirmText && <Box>{confirmText}</Box>}
                {bulkRowList}
              </Stack>
            </DialogContent>
            <DialogContent>
              <Stack spacing={2}>
                {children ? (
                  typeof children === 'function' ? (
                    children({
                      formHook,
                      row,
                    })
                  ) : (
                    children
                  )
                ) : (
                  <>
                    {fields?.map((fieldProps, i) => {
                      const { condition, component, csvColumn, ...rest } = fieldProps

                      if (csvColumn && rest.type === 'autoComplete') {
                        const csvFieldName = `${rest.name}__csv`
                        const origValidate = rest.validators?.validate
                        rest.validators = {
                          ...rest.validators,
                          validate: (value, formValues) => {
                            const hasAC = normalizeAutoCompleteValues(value).length > 0
                            const csvRows = formValues[csvFieldName]
                            const csvValues = extractCsvColumnValues(csvRows, csvColumn)
                            const hasCsvValues = csvValues.length > 0
                            const hasCsvRows =
                              Array.isArray(csvRows) && csvRows.length > 0

                            if (hasAC || hasCsvValues) {
                              if (typeof origValidate === 'function' && hasAC) {
                                return origValidate(value, formValues)
                              }
                              return true
                            }
                            if (hasCsvRows) {
                              return `CSV must include a ${csvColumn} column with at least one value`
                            }
                            return `Select at least one option or upload a CSV with a ${csvColumn} column`
                          },
                          deps: [csvFieldName],
                        }
                      }

                      if (rest.api) {
                        let nextApi = rest.api
                        if (
                          nextApi.processFieldData &&
                          nextApi.data &&
                          row &&
                          !Array.isArray(row)
                        ) {
                          const processedData = processActionData(nextApi.data, row)
                          nextApi = {
                            ...nextApi,
                            data: processedData,
                            queryKey:
                              nextApi.queryKey ??
                              `${nextApi.url}-${JSON.stringify(processedData)}`,
                          }
                        }
                        if (nextApi.tenantFilter === undefined && nextApi.url) {
                          nextApi = {
                            ...nextApi,
                            tenantFilter: getRowTenant(row, tenantFilter),
                          }
                        }
                        rest.api = nextApi
                      }
                      const FieldComponent = component ?? CippFormComponent
                      const fieldElement = (
                        <FieldComponent
                          formControl={formHook}
                          addedFieldData={addedFieldData}
                          setAddedFieldData={setAddedFieldData}
                          row={row}
                          {...rest}
                        />
                      )

                      const csvElement = csvColumn ? (
                        <Box sx={{ mt: 1 }}>
                          <CippFormComponent
                            type="CSVReader"
                            name={`${rest.name}__csv`}
                            label={`Or upload a CSV with a ${csvColumn} column`}
                            formControl={formHook}
                          />
                        </Box>
                      ) : null

                      return (
                        <Box key={i} sx={{ width: '100%' }}>
                          {condition ? (
                            <CippFormCondition {...condition} formControl={formHook}>
                              {fieldElement}
                              {csvElement}
                            </CippFormCondition>
                          ) : (
                            <>
                              {fieldElement}
                              {csvElement}
                            </>
                          )}
                        </Box>
                      )
                    })}
                  </>
                )}
              </Stack>
            </DialogContent>
            {confirmPhrase && (
              <DialogContent>
                <CippFormComponent
                  type="textField"
                  name="__confirmPhrase"
                  label={`Type ${confirmPhrase} to confirm`}
                  formControl={formHook}
                  autoComplete="off"
                  validators={{
                    validate: (value) =>
                      (value ?? '').trim() === confirmPhrase ||
                      `Type ${confirmPhrase} exactly to enable Confirm`,
                  }}
                />
              </DialogContent>
            )}
            <DialogContent>
              <CippApiResults apiObject={{ ...selectedType, data: partialResults }} />
            </DialogContent>
            <DialogActions>
              <Button color="inherit" onClick={handleClose}>
                Close
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={!isValid || (isFormSubmitted && !allowResubmit)}
              >
                {isFormSubmitted && allowResubmit ? 'Reconfirm' : 'Confirm'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </>
  )
}
