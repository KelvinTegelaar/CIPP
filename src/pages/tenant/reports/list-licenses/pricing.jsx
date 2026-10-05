import { useMemo, useRef, useState } from 'react'
import { usePapaParse } from 'react-papaparse'
import { CippIcons } from '../../../../utils/icon-registry'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import {
  SvgIcon,
  Box,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from '@mui/material'
import { CippAutoComplete } from '../../../../components/CippComponents/CippAutocomplete'
import { useLicenseCurrency } from '../../../../hooks/use-license-currency'
import { ApiGetCallWithPagination, ApiPostCall } from '../../../../api/ApiCall'
import { useSettings } from '../../../../hooks/use-settings'
import { getCippError } from '../../../../utils/get-cipp-error'
import { getCippTranslation } from '../../../../utils/get-cipp-translation'
import { CippCsvExportButton } from '../../../../components/CippComponents/CippCsvExportButton'
import tabOptions from './tabOptions.json'

const Page = () => {
  const pageTitle = 'License Pricing'
  const apiUrl = '/api/ListLicensePricing'
  const [currency, setCurrency] = useLicenseCurrency()

  const tenant = useSettings().currentTenant
  const pricingQuery = ApiGetCallWithPagination({
    url: `${apiUrl}?currency=${currency}`,
    queryKey: `LicensePricing-${currency}`,
    data: { tenantFilter: tenant },
  })
  const currencies = pricingQuery.data?.pages?.[0]?.Currencies ?? ['USD']
  const exportRows = useMemo(
    () =>
      pricingQuery.data?.pages?.flatMap((page) =>
        Array.isArray(page.Results)
          ? page.Results.map((row) => ({
              ...row,
              MonthlyPrice: row.MonthlyPrice ?? '',
            }))
          : []
      ) ?? [],
    [pricingQuery.data]
  )
  const fileInput = useRef(null)
  const { readString } = usePapaParse()
  const validateImport = ApiPostCall({})
  const applyImport = ApiPostCall({ relatedQueryKeys: ['LicensePricing*'] })
  const [importOpen, setImportOpen] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [review, setReview] = useState(null)
  const [result, setResult] = useState(null)
  const [importError, setImportError] = useState('')
  const busy = parsing || validateImport.isPending || applyImport.isPending

  const importFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setReview(null)
    setResult(null)
    setImportError('')
    setParsing(true)
    try {
      const csv = await file.text()
      readString(csv, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (header) => header.trim(),
        complete: async ({ data, errors, meta }) => {
          try {
            if (errors.length)
              throw new Error(`Invalid CSV: ${errors[0].message}`)
            if (Object.keys(meta.renamedHeaders ?? {}).length) {
              throw new Error('Duplicate CSV headers are not allowed.')
            }
            const required = [
              'Product_Display_Name',
              'skuPartNumber',
              'skuId',
              'MonthlyPrice',
              'Currency',
            ]
            const missing = required.filter(
              (field) => !meta.fields?.includes(field)
            )
            if (missing.length)
              throw new Error(`Missing required columns: ${missing.join(', ')}`)
            if (!data.length)
              throw new Error('The CSV contains no pricing rows.')
            const response = await validateImport.mutateAsync({
              url: '/api/ExecLicensePricing',
              data: {
                Action: 'BulkImport',
                Mode: 'Validate',
                Currency: currency,
                Rows: data,
              },
            })
            setReview(response.data)
          } catch (error) {
            if (error.response?.data?.Errors) setReview(error.response.data)
            else setImportError(getCippError(error))
          } finally {
            setParsing(false)
          }
        },
      })
    } catch (error) {
      setImportError(getCippError(error))
      setParsing(false)
    }
  }

  const confirmImport = async () => {
    setImportError('')
    try {
      const response = await applyImport.mutateAsync({
        url: '/api/ExecLicensePricing',
        data: {
          Action: 'BulkImport',
          Mode: 'Apply',
          Currency: currency,
          Rows: review.Changes,
        },
      })
      setResult(response.data)
    } catch (error) {
      // A lost response may follow a committed write; refresh and require a new review.
      if (error.response?.data?.Errors) setResult(error.response.data)
      else {
        setReview(null)
        setImportError(getCippError(error))
      }
      pricingQuery.refetch()
    }
  }

  const simpleColumns = [
    'Product_Display_Name',
    'skuPartNumber',
    'MonthlyPrice',
    'Currency',
    'Source',
    'skuId',
  ]

  const actions = [
    {
      label: 'Set / override price',
      type: 'POST',
      url: '/api/ExecLicensePricing',
      icon: (
        <SvgIcon fontSize="small">
          <CippIcons.CurrencyDollarIcon />
        </SvgIcon>
      ),
      fields: [
        {
          type: 'number',
          name: 'MonthlyPrice',
          label: 'Monthly price per seat',
        },
      ],
      // Override is scoped to the currency currently being viewed.
      customDataformatter: (row, action, formData) => ({
        Action: 'SetPrice',
        skuId: row.skuId,
        skuPartNumber: row.skuPartNumber,
        Product_Display_Name: row.Product_Display_Name,
        MonthlyPrice: formData.MonthlyPrice,
        Currency: currency,
      }),
      confirmText:
        'Set a custom ' +
        currency +
        ' monthly price for [Product_Display_Name]. This overrides the shipped estimate for ' +
        currency +
        '.',
      relatedQueryKeys: ['LicensePricing*'],
    },
    {
      label: 'Remove override',
      type: 'POST',
      url: '/api/ExecLicensePricing',
      data: { Action: '!RemovePrice', skuId: 'skuId', Currency: 'Currency' },
      confirmText:
        'Remove the custom [Currency] price for [Product_Display_Name]? It will fall back to the shipped estimate.',
      color: 'error',
      icon: (
        <SvgIcon fontSize="small">
          <CippIcons.TrashIcon />
        </SvgIcon>
      ),
      condition: (row) => row.Source === 'Override',
      relatedQueryKeys: ['LicensePricing*'],
    },
  ]

  const offCanvas = {
    extendedInfoFields: [
      'Product_Display_Name',
      'skuPartNumber',
      'skuId',
      'MonthlyPrice',
      'Currency',
      'Source',
    ],
    actions: actions,
  }

  const currencySelect = (
    <Box sx={{ minWidth: 160 }}>
      <CippAutoComplete
        label="Currency"
        options={currencies.map((c) => ({ label: c, value: c }))}
        value={{ label: currency, value: currency }}
        multiple={false}
        creatable={false}
        disableClearable={true}
        size="small"
        onChange={(option) => {
          if (option?.value) setCurrency(option.value)
        }}
      />
    </Box>
  )

  return (
    <>
      <CippTablePage
        title={pageTitle}
        queryKey={`LicensePricing-${currency}`}
        apiUrl={`${apiUrl}?currency=${currency}`}
        apiDataKey="Results"
        cardButton={
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
            useFlexGap
          >
            {currencySelect}
            <CippCsvExportButton
              label="Export pricing CSV"
              rawData={pricingQuery.isFetching ? [] : exportRows}
              reportName={`LicensePricing-${currency}`}
              includeFields={simpleColumns}
            />
            <Button
              size="small"
              onClick={() => {
                setReview(null)
                setResult(null)
                setImportError('')
                setImportOpen(true)
              }}
            >
              Import CSV
            </Button>
          </Stack>
        }
        actions={actions}
        offCanvas={offCanvas}
        columns={simpleColumns.map((field) => ({
          id: field,
          accessorKey: field,
          header: getCippTranslation(field),
        }))}
        tenantInTitle={false}
      />
      <Dialog
        open={importOpen}
        onClose={() => {
          if (!busy) setImportOpen(false)
        }}
        fullWidth
        maxWidth="md"
        aria-labelledby="license-pricing-import-title"
      >
        <DialogTitle id="license-pricing-import-title">
          Import License Pricing
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {!result && (
              <>
                <Typography variant="body2">
                  Import prices in {currency}. Only changed prices will be
                  saved. Blank prices do not remove overrides.
                </Typography>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  ref={fileInput}
                  hidden
                  onChange={importFile}
                  aria-label="License pricing CSV"
                />
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ alignSelf: 'flex-start' }}
                  onClick={() => fileInput.current?.click()}
                  disabled={busy}
                >
                  Choose CSV
                </Button>
              </>
            )}
            {busy && (
              <Typography role="status">
                {applyImport.isPending
                  ? 'Updating prices...'
                  : 'Validating CSV...'}
              </Typography>
            )}
            {importError && <Alert severity="error">{importError}</Alert>}
            {review && !result && (
              <>
                <Alert severity={review.Valid ? 'info' : 'error'}>
                  {review.Valid
                    ? `Prices to update: ${review.Changes.length}. Unchanged rows ignored: ${review.Unchanged}.`
                    : 'Validation failed. No prices were changed.'}
                </Alert>
                {review.Valid && review.Changes.length > 0 && (
                  <TableContainer>
                    <Table size="small" aria-label="Price changes">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Current price</TableCell>
                          <TableCell>New price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {review.Changes.map((row) => (
                          <TableRow key={row.skuId}>
                            <TableCell>
                              {row.Product_Display_Name}
                              <Typography
                                variant="caption"
                                sx={{ display: 'block' }}
                              >
                                {row.skuId}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {row.Currency} {row.CurrentPrice ?? 'Unknown'}
                            </TableCell>
                            <TableCell>
                              {row.Currency} {row.MonthlyPrice}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
            {result && (
              <Alert
                severity={result.Failed || !result.Valid ? 'error' : 'success'}
              >
                {result.Updated} updated;{' '}
                {(review?.Unchanged ?? 0) + result.Unchanged} unchanged/skipped;{' '}
                {result.Failed} failed.
              </Alert>
            )}
            {(result ?? review)?.Errors?.map((error, index) => (
              <Alert severity="error" key={index}>
                {error.Row ? `Row ${error.Row}: ` : ''}
                {error.skuId ? `${error.skuId}: ` : ''}
                {error.Error}
              </Alert>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            color="inherit"
            disabled={busy}
            onClick={() => setImportOpen(false)}
          >
            Close
          </Button>
          {!result && (
            <Button
              variant="contained"
              disabled={busy || !review?.Valid || !review?.Changes?.length}
              onClick={confirmImport}
            >
              Confirm
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
