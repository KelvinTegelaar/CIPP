import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippWizardConfirmation } from '../../../../components/CippWizard/CippWizardConfirmation'
import CippWizardPage from '../../../../components/CippWizard/CippWizardPage.jsx'
import { CippTenantStep } from '../../../../components/CippWizard/CippTenantStep.jsx'
import { CippWizardAutopilotImport } from '../../../../components/CippWizard/CippWizardAutopilotImport'
import { CippWizardAutopilotOptions } from '../../../../components/CippWizard/CippWizardAutopilotOptions'
import { CippWizardAutopilotTypeSelection } from '../../../../components/CippWizard/CippWizardAutopilotTypeSelection'
import { CippWizardDevicePrepImport } from '../../../../components/CippWizard/CippWizardDevicePrepImport'

const Page = () => {
  const steps = [
    {
      title: 'Deployment Type',
      description: 'Deployment Type',
      component: CippWizardAutopilotTypeSelection,
    },
    {
      title: 'Tenant Selection',
      description: 'Tenant Selection',
      component: CippTenantStep,
      componentProps: {
        allTenants: false,
        type: 'single',
      },
    },
    {
      title: 'Autopilot Device Import',
      description: 'Device Import',
      component: CippWizardAutopilotImport,
      showStepWhen: (values) => values?.deploymentType !== 'devicePrep',
      componentProps: {
        name: 'autopilotData',
        fields: [
          {
            friendlyName: 'Serialnumber',
            propertyName: 'SerialNumber',
            alternativePropertyNames: ['Device Serial Number'],
          },
          {
            friendlyName: 'Manufacturer',
            propertyName: 'oemManufacturerName',
            alternativePropertyNames: ['Manufacturer name'],
          },
          {
            friendlyName: 'Model',
            propertyName: 'modelName',
            alternativePropertyNames: ['Device model'],
          },
          {
            friendlyName: 'Product ID',
            propertyName: 'productKey',
            alternativePropertyNames: ['Windows Product ID'],
          },
          {
            friendlyName: 'Hardware hash',
            propertyName: 'hardwareHash',
            alternativePropertyNames: ['Hardware Hash'],
          },
          {
            friendlyName: 'Group Tag',
            propertyName: 'groupTag',
            alternativePropertyNames: ['Group Tag'],
          },
        ],
        fileName: 'autopilot-template',
      },
    },
    {
      title: 'Autopilot Options',
      description: 'Extra Options',
      component: CippWizardAutopilotOptions,
      showStepWhen: (values) => values?.deploymentType !== 'devicePrep',
    },
    {
      title: 'Corporate Identifier Import',
      description: 'Device Import',
      component: CippWizardDevicePrepImport,
      showStepWhen: (values) => values?.deploymentType === 'devicePrep',
      componentProps: {
        name: 'devicePrepData',
        fields: [
          {
            friendlyName: 'Manufacturer',
            propertyName: 'manufacturer',
            alternativePropertyNames: [
              'Manufacturer name',
              'oemManufacturerName',
            ],
          },
          {
            friendlyName: 'Model',
            propertyName: 'model',
            alternativePropertyNames: ['Device model', 'modelName'],
          },
          {
            friendlyName: 'Serial Number',
            propertyName: 'serialNumber',
            alternativePropertyNames: [
              'Serial number',
              'Device Serial Number',
              'SerialNumber',
            ],
          },
        ],
        fileName: 'corporate-identifiers-template',
      },
    },
    {
      title: 'Autopilot Confirmation',
      description: 'Confirmation',
      component: CippWizardConfirmation,
      showStepWhen: (values) => values?.deploymentType !== 'devicePrep',
    },
    {
      title: 'Device Prep Confirmation',
      description: 'Confirmation',
      component: CippWizardConfirmation,
      showStepWhen: (values) => values?.deploymentType === 'devicePrep',
      componentProps: {
        postUrl: '/api/AddCorporateDeviceIdentifier',
      },
    },
  ]

  return (
    <>
      <CippWizardPage
        initialState={{ deploymentType: 'autopilot' }}
        steps={steps}
        postUrl="/api/AddAPDevice"
        wizardTitle="Add Autopilot device wizard"
      />
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
