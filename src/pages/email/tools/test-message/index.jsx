import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { Alert, Typography } from '@mui/material'
import { Grid } from '@mui/system'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import CippFormPage from '../../../../components/CippFormPages/CippFormPage'
import CippFormComponent from '../../../../components/CippComponents/CippFormComponent'
import { useSettings } from '../../../../hooks/use-settings'
import { CippTestMessageResults } from '../../../../components/CippComponents/CippTestMessageResults'

// Exchange's Test-Message pushes a message through the mail flow / DLP rule pipeline, drops it,
// and emails a report. The dropped message's trace carries the rules that acted, which is what
// the results panel below shows once it appears.
const Page = () => {
  const tenant = useSettings().currentTenant
  const router = useRouter()
  const [jobId, setJobId] = useState(null)
  const formControl = useForm({
    mode: 'onChange',
    defaultValues: { TransportRules: true, UnifiedDlpRules: false },
  })

  useEffect(() => {
    if (!router.isReady) return
    const { sender, recipient, subject } = router.query
    if (sender) formControl.setValue('Sender', String(sender))
    if (recipient)
      formControl.setValue(
        'Recipients',
        String(recipient)
          .split(',')
          .map((address) => ({ label: address.trim(), value: address.trim() }))
      )
    if (subject) formControl.setValue('Subject', String(subject))
  }, [router.isReady, router.query])

  return (
    <CippFormPage
      formControl={formControl}
      queryKey={`TestMessage-${tenant}`}
      title="Test Mail Flow Rules"
      hidePageType
      hideBackButton
      allowResubmit
      postUrl="/api/ExecTestMessage"
      onSubmitResult={(result) => setJobId(result?.DeploymentId ?? null)}
      customDataformatter={(values) => ({
        tenantFilter: tenant,
        Sender: values.Sender,
        Recipients: (values.Recipients ?? []).map(
          (recipient) => recipient.value
        ),
        SendReportTo: values.SendReportTo,
        Subject: values.Subject,
        Body: values.Body,
        TransportRules: values.TransportRules,
        UnifiedDlpRules: values.UnifiedDlpRules,
      })}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" color="text.secondary">
            Sends a test message through the tenant's mail flow rule pipeline
            without delivering it. Exchange emails a report of every rule that
            matched to the address you choose. To test a real message, open it
            in the Message Viewer and use Test Mail Flow Rules there.
          </Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Alert severity="warning">
            The message really enters the pipeline, so rule actions such as
            block, moderate or notify can fire for it, and any configured
            notifications are sent.
          </Alert>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="textField"
            label="Sender"
            name="Sender"
            placeholder="sender@contoso.com"
            formControl={formControl}
            validators={{ required: 'A sender address is required' }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="autoComplete"
            label="Recipients"
            name="Recipients"
            placeholder="Type an address and press Enter"
            multiple
            creatable
            options={[]}
            formControl={formControl}
            validators={{ required: 'At least one recipient is required' }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="textField"
            label="Send report to"
            name="SendReportTo"
            placeholder="admin@contoso.com"
            helperText="A mailbox in this tenant. The rule evaluation report is emailed here."
            formControl={formControl}
            validators={{ required: 'A report address is required' }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="textField"
            label="Subject"
            name="Subject"
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Body"
            name="Body"
            multiline
            rows={4}
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="switch"
            label="Evaluate mail flow rules"
            name="TransportRules"
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="switch"
            label="Evaluate unified DLP rules"
            name="UnifiedDlpRules"
            formControl={formControl}
          />
        </Grid>
      </Grid>
      <CippTestMessageResults jobId={jobId} />
    </CippFormPage>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
