import { Button } from '@mui/material'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { Layout as DashboardLayout } from '../../../../layouts/index' // had to add an extra path here because I added an extra folder structure. We should switch to absolute pathing so we dont have to deal with relative.
import Link from 'next/link'
import { ApiGetCall } from '../../../../api/ApiCall'
import { useSettings } from '../../../../hooks/use-settings'
import { CippApiResults } from '../../../../components/CippComponents/CippApiResults'
import { CippDomainCards } from '../../../../components/CippCards/CippDomainCards'
import { CippIcons } from '../../../../utils/icon-registry'
import { DomainAnalyserDialog } from '../../../../components/CippComponents/DomainAnalyserDialog'
import { useDialog } from '../../../../hooks/use-dialog'

const Page = () => {
  const currentTenant = useSettings().currentTenant
  const pageTitle = 'Domains Analyser'
  const analyserDialog = useDialog()
  const apiGetCall = ApiGetCall({
    url: '/api/ExecDomainAnalyser',
    waiting: false,
  })
  const actions = [
    {
      label: 'Add/Modify DKIM Selectors',
      type: 'POST',
      icon: <CippIcons.Settings />,
      url: '/api/ExecDnsConfig',
      data: { Action: '!SetDkimConfig', Domain: 'Domain' },
      confirmText: 'Enter the DKIM selectors for [Domain] (comma-separated)',
      fields: [
        {
          type: 'textField',
          name: 'Selector',
          label: 'DKIM Selectors',
          placeholder: 'selector1, selector2, selector3',
          required: true,
        },
      ],
      multiPost: false,
    },
    {
      label: 'Delete from analyser',
      type: 'POST',
      icon: <CippIcons.Delete />,
      url: '/api/ExecDnsConfig',
      data: { Action: '!RemoveDomain', Domain: 'Domain' },
      confirmText: 'Are you sure you want to delete this domain from the analyser?',
      multiPost: false,
    },
  ]

  const offCanvas = {
    children: (extendedData) => <CippDomainCards domain={extendedData.Domain} fullwidth={true} />,
  }

  const filters = [
    {
      filterName: 'Mail Provider is not Microsoft 365',
      value: [{ id: 'MailProvider', value: 'Microsoft 365', filterFn: 'notEquals' }],
      type: 'column',
    },
    {
      filterName: 'onmicrosoft.com Domains',
      value: [{ id: 'Domain', value: 'onmicrosoft.com' }],
      type: 'column',
    },
    {
      filterName: 'All Except onmicrosoft.com Domains',
      value: [{ id: 'Domain', value: 'onmicrosoft.com', filterFn: 'notContains' }],
      type: 'column',
    },
  ]

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ListDomainAnalyser"
        cardButton={
          <>
            <Button
              component={Link}
              href="/tenant/tools/individual-domains"
              startIcon={<CippIcons.TravelExplore />}
            >
              Check Individual Domain
            </Button>
            <Button onClick={analyserDialog.handleOpen} startIcon={<CippIcons.Refresh />}>
              Run Analysis Now
            </Button>
          </>
        }
        prependComponents={<CippApiResults apiObject={apiGetCall} />}
        queryKey={`ListDomains-${currentTenant}`}
        filters={filters}
        simpleColumns={[
          'Domain',
          'ScorePercentage',
          'MailProvider',
          'SPFPassAll',
          'MXPassTest',
          'DMARCPresent',
          'DMARCActionPolicy',
          'DMARCPercentagePass',
          'DNSSECPresent',
          'DKIMEnabled',
          'EnterpriseEnrollment',
          'EnterpriseRegistration',
        ]}
        offCanvas={offCanvas}
        actions={actions}
      />
      <DomainAnalyserDialog createDialog={analyserDialog} />
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
