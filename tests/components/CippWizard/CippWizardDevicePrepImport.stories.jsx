import React from 'react'
import { http, HttpResponse } from 'msw'
import { useForm } from 'react-hook-form'
import { CippWizardDevicePrepImport } from '../../../src/components/CippWizard/CippWizardDevicePrepImport'

// The three the device prep wizard passes — a corporate identifier is exactly this triplet.
const fields = [
  { friendlyName: 'Manufacturer', propertyName: 'manufacturer' },
  { friendlyName: 'Model', propertyName: 'model' },
  { friendlyName: 'Serial Number', propertyName: 'serialNumber' },
]

const handlers = [
  http.get('*/api/ListGraphRequest', () => HttpResponse.json({ Results: [] })),
  http.get('*/api/ListGraphExplorerPresets', () => HttpResponse.json({ Results: [] })),
]

const Harness = ({ defaultValues }) => {
  const formControl = useForm({
    mode: 'onChange',
    defaultValues: { devicePrepData: [], ...defaultValues },
  })
  return (
    <CippWizardDevicePrepImport
      formControl={formControl}
      name="devicePrepData"
      fields={fields}
      fileName="corporate-identifiers-template"
      currentStep={1}
      lastStep={2}
      onNextStep={() => {}}
      onPreviousStep={() => {}}
    />
  )
}

export default {
  title: 'Components/CippWizard/CippWizardDevicePrepImport',
  component: CippWizardDevicePrepImport,
  parameters: { msw: { handlers } },
}

export const Empty = {
  render: () => <Harness />,
}

export const WithDevices = {
  render: () => (
    <Harness
      defaultValues={{
        devicePrepData: [
          { manufacturer: 'Dell', model: 'XPS 13 9345', serialNumber: 'SN0001' },
          { manufacturer: 'HP', model: 'EliteBook 840 G11', serialNumber: 'SN0002' },
        ],
      }}
    />
  ),
}
