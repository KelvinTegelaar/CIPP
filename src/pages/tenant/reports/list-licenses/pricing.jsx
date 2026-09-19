import { useMemo } from 'react'
import { CippIcons } from '../../../../utils/icon-registry'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { SvgIcon, Box } from '@mui/material'
import { CippAutoComplete } from '../../../../components/CippComponents/CippAutocomplete'
import { useLicenseCurrency } from '../../../../hooks/use-license-currency'
import { ApiGetCall } from '../../../../api/ApiCall'
import tabOptions from './tabOptions.json'

const Page = () => {
  const pageTitle = 'License Pricing'
  const apiUrl = '/api/ListLicensePricing'
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
        cardButton={currencySelect}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        tenantInTitle={false}
      />
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
