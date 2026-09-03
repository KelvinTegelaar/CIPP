import { useCallback, useMemo } from 'react'
import { CippIcons } from '../../../../utils/icon-registry'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { Button, SvgIcon, Box, Stack } from '@mui/material'
import { CippApiDialog } from '../../../../components/CippComponents/CippApiDialog'
import { CippAutoComplete } from '../../../../components/CippComponents/CippAutocomplete'
import { useDialog } from '../../../../hooks/use-dialog'
import CippFormComponent from '../../../../components/CippComponents/CippFormComponent'
import { getM365Licenses } from '../../../../utils/m365-licenses-data'
import { useLicenseCurrency } from '../../../../hooks/use-license-currency'
import { ApiGetCall } from '../../../../api/ApiCall'
import tabOptions from './tabOptions.json'

const Page = () => {
  const pageTitle = 'License Pricing'
  const apiUrl = '/api/ListLicensePricing'
  const addDialog = useDialog()
  const [currency, setCurrency] = useLicenseCurrency()

  // Currencies present in the price data drive the selector.
  const currenciesQuery = ApiGetCall({
    url: apiUrl,
    queryKey: 'LicensePricingCurrencies',
  })
  const currencies = useMemo(() => {
    const list = currenciesQuery.data?.Currencies
    return Array.isArray(list) && list.length ? list : ['USD']
  }, [currenciesQuery.data])

  const simpleColumns = [
    'Product_Display_Name',
    'skuPartNumber',
    'MonthlyPrice',
    'Currency',
    'Source',
    'skuId',
  ]

  const allLicenseOptions = useMemo(() => {
    const uniqueLicenses = new Map()
    getM365Licenses().forEach((license) => {
      if (
        license.GUID &&
        license.Product_Display_Name &&
        !uniqueLicenses.has(license.GUID)
      ) {
        uniqueLicenses.set(license.GUID, {
          label: license.Product_Display_Name,
          value: license.GUID,
        })
      }
    })
    return Array.from(uniqueLicenses.values()).sort((a, b) =>
      a.label.localeCompare(b.label)
    )
  }, [])

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
    <CippAutoComplete
      label="Currency"
      options={currencies.map((c) => ({ label: c, value: c }))}
      value={{ label: currency, value: currency }}
      multiple={false}
      creatable={false}
      disableClearable={true}
      size="small"
      sx={{ minWidth: 140 }}
      onChange={(option) => {
        if (option?.value) setCurrency(option.value)
      }}
    />
  )

  const addButton = (
    <Button
      variant="contained"
      size="small"
      color="primary"
      onClick={addDialog.handleOpen}
      startIcon={
        <SvgIcon fontSize="small">
          <CippIcons.CurrencyDollarIcon />
        </SvgIcon>
      }
    >
      Add Price Override
    </Button>
  )

  const cardButton = (
    <Stack direction="row" spacing={2} sx={{
      alignItems: "center"
    }}>
      {currencySelect}
      {addButton}
    </Stack>
  )

  const addPriceFormatter = useCallback(
    (row, action, formData) => ({
      Action: 'SetPrice',
      skuId: formData.selectedLicense?.value,
      Product_Display_Name: formData.selectedLicense?.label,
      MonthlyPrice: formData.MonthlyPrice,
      Currency: formData.Currency || currency,
    }),
    [currency]
  )

  return (
    <>
      <CippTablePage
        title={pageTitle}
        queryKey={`LicensePricing-${currency}`}
        apiUrl={`${apiUrl}?currency=${currency}`}
        apiDataKey="Results"
        cardButton={cardButton}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        tenantInTitle={false}
      />
      <CippApiDialog
        title="Add Price Override"
        createDialog={addDialog}
        api={{
          url: '/api/ExecLicensePricing',
          confirmText: 'Set a custom monthly price for a license SKU.',
          type: 'POST',
          replacementBehaviour: 'removeNulls',
          relatedQueryKeys: ['LicensePricing*'],
          customDataformatter: addPriceFormatter,
        }}
      >
        {({ formHook }) => (
          <>
            <Box sx={{ mb: 2 }}>
              <CippFormComponent
                type="autoComplete"
                name="selectedLicense"
                label="Select License"
                options={allLicenseOptions}
                formControl={formHook}
                multiple={false}
                creatable={false}
                validators={{ required: 'Please select a license' }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <CippFormComponent
                type="number"
                name="MonthlyPrice"
                label="Monthly price per seat"
                formControl={formHook}
                validators={{ required: 'Please enter a price' }}
              />
            </Box>
            <CippFormComponent
              type="textField"
              name="Currency"
              label="Currency (ISO code)"
              defaultValue={currency}
              formControl={formHook}
              disableVariables={true}
            />
          </>
        )}
      </CippApiDialog>
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
