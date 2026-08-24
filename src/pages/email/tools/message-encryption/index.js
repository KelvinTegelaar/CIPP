import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Alert, Button, Link, Typography } from '@mui/material'
import { Grid } from '@mui/system'
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import CippFormPage from '../../../../components/CippFormPages/CippFormPage'
import CippFormComponent from '../../../../components/CippComponents/CippFormComponent'
import { CippPropertyListCard } from '../../../../components/CippCards/CippPropertyListCard'
import { CippApiResults } from '../../../../components/CippComponents/CippApiResults'
import { ApiGetCall, ApiPostCall } from '../../../../api/ApiCall'
import { useSettings } from '../../../../hooks/use-settings.js'

const yesNo = (value) => (value ? 'Yes' : 'No')

const Page = () => {
  const tenant = useSettings().currentTenant
  const queryKey = `IRMConfiguration-${tenant}`

  const formControl = useForm({ mode: 'onChange' })

  const irmRequest = ApiGetCall({
    url: '/api/ListIRMConfiguration',
    data: { tenantFilter: tenant },
    queryKey: queryKey,
  })

  const irm = irmRequest.data

  const testCall = ApiPostCall({ datafromUrl: true })

  useEffect(() => {
    // Blank everything the moment the tenant changes, before the new GET lands. Otherwise a
    // switch toggled for tenant A stays dirty and Submit stays enabled, which would write A's
    // pending value against B's tenantFilter, and A's test output would read as B's.
    formControl.reset({
      AzureRMSLicensingEnabled: false,
      SimplifiedClientAccessEnabled: false,
      Sender: '',
      Recipient: '',
    })
    testCall.reset()
  }, [tenant])

  useEffect(() => {
    if (irmRequest.isSuccess) {
      // Spread the current values so a refetch does not wipe a half-typed test address.
      formControl.reset({
        ...formControl.getValues(),
        AzureRMSLicensingEnabled: !!irm?.AzureRMSLicensingEnabled,
        SimplifiedClientAccessEnabled: !!irm?.SimplifiedClientAccessEnabled,
      })
    }
  }, [irmRequest.isSuccess, irm])

  const [testSender, testRecipient] = formControl.watch(['Sender', 'Recipient'])

  const runTest = () => {
    testCall.mutate({
      url: '/api/ExecIRMConfiguration',
      data: {
        tenantFilter: tenant,
        Action: 'Test',
        Sender: testSender?.value ?? testSender,
        Recipient: testRecipient?.value ?? testRecipient,
      },
    })
  }

  const propertyItems = [
    {
      label: 'Purview Message Encryption',
      value: irm?.AzureRMSLicensingEnabled ? 'Enabled' : 'Disabled',
    },
    {
      label: 'Internal Licensing Enabled',
      value: yesNo(irm?.InternalLicensingEnabled),
    },
    {
      label: 'External Licensing Enabled',
      value: yesNo(irm?.ExternalLicensingEnabled),
    },
    {
      label: 'Encrypt Button in Outlook',
      value: yesNo(irm?.SimplifiedClientAccessEnabled),
    },
    {
      label: 'Transport Decryption',
      value: irm?.TransportDecryptionSetting ?? 'Unknown',
    },
    {
      label: 'Journal Report Decryption',
      value: yesNo(irm?.JournalReportDecryptionEnabled),
    },
    {
      label: 'Licensing Location',
      value: irm?.LicensingLocation?.length
        ? irm.LicensingLocation.join(', ')
        : 'None',
    },
  ]

  return (
    <CippFormPage
      title="Message Encryption"
      hidePageType={true}
      hideBackButton={true}
      formControl={formControl}
      resetForm={false}
      postUrl="/api/ExecIRMConfiguration"
      queryKey={queryKey}
      customDataformatter={(values) => ({
        tenantFilter: tenant,
        Action: 'Set',
        AzureRMSLicensingEnabled: !!values?.AzureRMSLicensingEnabled,
        SimplifiedClientAccessEnabled: !!values?.SimplifiedClientAccessEnabled,
      })}
      addedButtons={
        <Button
          variant="outlined"
          disabled={!testSender || !testRecipient || testCall.isPending}
          onClick={runTest}
        >
          Run Test
        </Button>
      }
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" color="text.secondary">
            Microsoft Purview Message Encryption lets users send protected email
            to any recipient, including Gmail and Outlook.com. The only
            prerequisite is that Azure Rights Management is active for the
            tenant.
          </Typography>
        </Grid>
        {irmRequest.isError && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="error">
              Failed to load the IRM configuration for this tenant.
            </Alert>
          </Grid>
        )}
        {irm?.AdRmsDetected && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="warning">
              This tenant has an on-premises AD RMS licensing location ({' '}
              {irm.LicensingLocation.join(', ')} ). Purview Message Encryption
              is not compatible with AD RMS, so the tenant has to be{' '}
              <Link
                href="https://learn.microsoft.com/en-us/azure/information-protection/migrate-from-ad-rms-to-azure-rms"
                target="_blank"
                rel="noreferrer"
              >
                migrated to Azure RMS
              </Link>{' '}
              before enabling it.
            </Alert>
          </Grid>
        )}
        {(irm || irmRequest.isFetching) && (
          <Grid size={{ xs: 12 }}>
            <CippPropertyListCard
              title="Current Configuration"
              propertyItems={propertyItems}
              isFetching={irmRequest.isFetching}
              layout="two"
              showDivider={false}
            />
          </Grid>
        )}
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="switch"
            name="AzureRMSLicensingEnabled"
            label="Enable Purview Message Encryption (Azure RMS licensing)"
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="switch"
            name="SimplifiedClientAccessEnabled"
            label="Show the Encrypt button in Outlook (simplified client access)"
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2">Test the configuration</Typography>
          <Typography variant="body2" color="text.secondary">
            Runs Test-IRMConfiguration, which verifies that RMS templates can be
            acquired and that encryption and decryption both work. Use any
            mailbox in the tenant for both addresses.
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="autoComplete"
            name="Sender"
            label="Sender"
            formControl={formControl}
            multiple={false}
            creatable={false}
            api={{
              url: '/api/ListMailboxes',
              queryKey: 'MessageEncryption-Mailboxes',
              labelField: (option) => `${option.displayName} (${option.UPN})`,
              valueField: 'UPN',
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="autoComplete"
            name="Recipient"
            label="Recipient"
            formControl={formControl}
            multiple={false}
            creatable={false}
            api={{
              url: '/api/ListMailboxes',
              queryKey: 'MessageEncryption-Mailboxes',
              labelField: (option) => `${option.displayName} (${option.UPN})`,
              valueField: 'UPN',
            }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <CippApiResults apiObject={testCall} />
        </Grid>
      </Grid>
    </CippFormPage>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
