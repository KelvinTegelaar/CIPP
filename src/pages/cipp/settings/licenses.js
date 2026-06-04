import tabOptions from './tabOptions'
import { TabbedLayout } from '../../../layouts/TabbedLayout'
import { Layout as DashboardLayout } from '../../../layouts/index.js'
import { CippTablePage } from '../../../components/CippComponents/CippTablePage.jsx'
import { Button, SvgIcon, Stack, Box } from '@mui/material'
import { TrashIcon } from '@heroicons/react/24/outline'
import { Add, RestartAlt, NotificationsOff, Visibility, VisibilityOff } from '@mui/icons-material'
import { CippApiDialog } from '../../../components/CippComponents/CippApiDialog'
import { useDialog } from '../../../hooks/use-dialog'
import CippFormComponent from '../../../components/CippComponents/CippFormComponent'
import { CippFormCondition } from '../../../components/CippComponents/CippFormCondition'
import M365LicensesDefault from '../../../data/M365Licenses.json'
import M365LicensesAdditional from '../../../data/M365Licenses-additional.json'
import { useMemo, useCallback } from 'react'

const Page = () => {
  const pageTitle = 'Excluded Licenses'
  const apiUrl = '/api/ListExcludedLicenses'
  const createDialog = useDialog()
  const resetDialog = useDialog()
  const simpleColumns = ['Product_Display_Name', 'GUID', 'ExclusionType', 'ShowInLicenseDropdown']

  const allLicenseOptions = useMemo(() => {
    const allLicenses = [...M365LicensesDefault, ...M365LicensesAdditional]
    const uniqueLicenses = new Map()

    allLicenses.forEach((license) => {
      if (license.GUID && license.Product_Display_Name) {
        if (!uniqueLicenses.has(license.GUID)) {
          uniqueLicenses.set(license.GUID, {
            label: license.Product_Display_Name,
            value: license.GUID,
          })
        }
      }
    })

    const options = Array.from(uniqueLicenses.values())
    const nameCounts = {}
    options.forEach((opt) => {
      nameCounts[opt.label] = (nameCounts[opt.label] || 0) + 1
    })

    return options
      .map((opt) =>
        nameCounts[opt.label] > 1 ? { ...opt, label: `${opt.label} (${opt.value})` } : opt
      )
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [])

  const actions = [
    {
      label: 'Only Exclude from Alerts',
      type: 'POST',
      url: '/api/ExecExcludeLicenses',
      data: { Action: '!AlertOnly', GUID: 'GUID', SKUName: 'Product_Display_Name' },
      confirmText:
        'This license will remain visible in CIPP but will be excluded from alerts. Continue?',
      icon: <NotificationsOff fontSize="small" />,
    },
    {
      label: 'Show in License Dropdowns',
      type: 'POST',
      url: '/api/ExecExcludeLicenses',
      data: {
        Action: '!SetShowInDropdown',
        GUID: 'GUID',
        SKUName: 'Product_Display_Name',
        ShowInDropdown: true,
      },
      confirmText: '[Product_Display_Name] will be available in license dropdowns. Continue?',
      icon: <Visibility fontSize="small" />,
      condition: (row) => row.ShowInLicenseDropdown !== true,
    },
    {
      label: 'Hide from License Dropdowns',
      type: 'POST',
      url: '/api/ExecExcludeLicenses',
      data: {
        Action: '!SetShowInDropdown',
        GUID: 'GUID',
        SKUName: 'Product_Display_Name',
        ShowInDropdown: false,
      },
      confirmText: '[Product_Display_Name] will be hidden from license dropdowns. Continue?',
      icon: <VisibilityOff fontSize="small" />,
      condition: (row) => row.ShowInLicenseDropdown === true,
    },
    {
      label: 'Delete Exclusion',
      type: 'POST',
      url: '/api/ExecExcludeLicenses',
      data: { Action: '!RemoveExclusion', GUID: 'GUID' },
      confirmText: 'Do you want to delete this exclusion?',
      color: 'error',
      icon: (
        <SvgIcon fontSize="small">
          <TrashIcon />
        </SvgIcon>
      ),
    },
  ]

  const CardButtons = () => {
    return (
      <Stack spacing={2} direction="row">
        <Button
          variant="contained"
          size="small"
          color="primary"
          onClick={createDialog.handleOpen}
          startIcon={
            <SvgIcon fontSize="small">
              <Add />
            </SvgIcon>
          }
        >
          Add Excluded License
        </Button>
        <Button
          variant="outlined"
          size="small"
          color="primary"
          onClick={resetDialog.handleOpen}
          startIcon={<RestartAlt />}
        >
          Restore Defaults
        </Button>
      </Stack>
    )
  }

  const offCanvas = {
    extendedInfoFields: ['Product_Display_Name', 'GUID', 'ExclusionType', 'ShowInLicenseDropdown'],
    actions: actions,
  }

  const addExclusionFormatter = useCallback((row, action, formData) => {
    if (formData.advancedMode) {
      return {
        Action: 'AddExclusion',
        GUID: formData.GUID,
        SKUName: formData.SKUName,
      }
    }
    return {
      Action: 'AddExclusion',
      GUID: formData.selectedLicense?.value,
      SKUName: formData.selectedLicense?.label,
    }
  }, [])

  return (
    <>
      <CippTablePage
        title={pageTitle}
        queryKey="ExcludedLicenses"
        apiUrl={apiUrl}
        cardButton={<CardButtons />}
        actions={actions}
        apiDataKey="Results"
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        tenantInTitle={false}
      />
      <CippApiDialog
        title="Add Excluded License"
        createDialog={createDialog}
        api={{
          url: '/api/ExecExcludeLicenses',
          confirmText:
            'Add a license to the exclusion table. Select from the list or use Advanced Mode to enter a custom GUID.',
          type: 'POST',
          data: { Action: '!AddExclusion' },
          replacementBehaviour: 'removeNulls',
          relatedQueryKeys: ['ExcludedLicenses'],
          customDataformatter: addExclusionFormatter,
        }}
      >
        {({ formHook }) => (
          <>
            <Box sx={{ mb: 2 }}>
              <CippFormComponent
                type="switch"
                name="advancedMode"
                label="Advanced Mode"
                formControl={formHook}
              />
            </Box>

            <CippFormCondition
              field="advancedMode"
              compareType="isNot"
              compareValue={true}
              formControl={formHook}
            >
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
            </CippFormCondition>

            <CippFormCondition
              field="advancedMode"
              compareType="is"
              compareValue={true}
              formControl={formHook}
            >
              <Box sx={{ mb: 2 }}>
                <CippFormComponent
                  type="textField"
                  name="GUID"
                  label="GUID"
                  formControl={formHook}
                  disableVariables={true}
                  validators={{ required: 'GUID is required' }}
                />
              </Box>
              <CippFormComponent
                type="textField"
                name="SKUName"
                label="SKU Name"
                formControl={formHook}
                disableVariables={true}
                validators={{ required: 'SKU Name is required' }}
              />
            </CippFormCondition>
          </>
        )}
      </CippApiDialog>
      <CippApiDialog
        title="Restore Defaults"
        createDialog={resetDialog}
        fields={[
          {
            type: 'switch',
            name: 'FullReset',
            label: 'Full Reset (clear all entries including manually added ones)',
          },
        ]}
        api={{
          url: '/api/ExecExcludeLicenses',
          confirmText:
            "This will restore default licenses from the config file. If 'Full Reset' is enabled, all existing entries will be cleared first.",
          type: 'POST',
          data: { Action: '!RestoreDefaults' },
          relatedQueryKeys: ['ExcludedLicenses'],
        }}
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
