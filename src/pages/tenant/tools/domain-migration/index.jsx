import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Button, Stack } from '@mui/material'
import { Grid } from '@mui/system'
import { useForm, useWatch } from 'react-hook-form'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import CippButtonCard from '../../../../components/CippCards/CippButtonCard'
import CippFormComponent from '../../../../components/CippComponents/CippFormComponent'
import { CippFormDomainSelector } from '../../../../components/CippComponents/CippFormDomainSelector'
import { CippApiResults } from '../../../../components/CippComponents/CippApiResults'
import { CippDataTable } from '../../../../components/CippTable/CippDataTable'
import { ApiPostCall } from '../../../../api/ApiCall'
import { useSettings } from '../../../../hooks/use-settings'
import { CippIcons } from '../../../../utils/icon-registry'

const apiUrl = '/api/ExecEmailDomainMigration'
const maxPerRequest = 500
const defaultValues = {
  Action: 'Move',
  SourceDomain: null,
  TargetDomain: null,
  SkipCollisions: true,
  IncludeSharedMailboxes: false,
  IncludeGroups: false,
}
const simpleColumns = [
  'displayName',
  'type',
  'status',
  'userPrincipalName',
  'newUserPrincipalName',
  'primarySmtpAddress',
  'newPrimarySmtpAddress',
  'reason',
]
const aliasColumns = [
  'displayName',
  'type',
  'status',
  'userPrincipalName',
  'primarySmtpAddress',
  'newAlias',
  'reason',
]

const EmailDomainMigration = ({ tenantFilter }) => {
  const [request, setRequest] = useState(null)
  const [rows, setRows] = useState([])
  const formControl = useForm({ mode: 'onChange', defaultValues })
  const targetDomain = useRouter().query.targetDomain
  const formAliasMode =
    useWatch({ control: formControl.control, name: 'Action' }) === 'AddAlias'
  const aliasMode = request?.Action === 'AddAlias'

  useEffect(() => {
    if (targetDomain) {
      formControl.setValue('TargetDomain', {
        label: targetDomain,
        value: targetDomain,
      })
    }
  }, [targetDomain, formControl])

  const preview = ApiPostCall({
    queryKey: `EmailDomainMigrationPreview-${tenantFilter}`,
    onResult: (result) => setRows(result?.Results ?? []),
  })

  const runPreview = formControl.handleSubmit((values) => {
    const nextRequest = {
      tenantFilter,
      Action: values.Action,
      SourceDomain: values.SourceDomain?.value,
      TargetDomain: values.TargetDomain?.value,
      SkipCollisions: values.SkipCollisions,
      IncludeSharedMailboxes: values.IncludeSharedMailboxes,
      IncludeGroups: values.IncludeGroups,
    }
    setRequest(nextRequest)
    setRows([])
    preview.mutate({ url: apiUrl, data: { ...nextRequest, Preview: true } })
  })

  const postAction = {
    type: 'POST',
    url: apiUrl,
    bulkFilterEligible: true,
    multiPost: true,
    relatedQueryKeys: ['ListUsers*', 'groups-*'],
    onSuccess: () => runPreview(),
  }
  // The endpoint changes up to 500 objects per request; an array is sent as one request per chunk.
  const withAction = (Action) => (selected) => {
    const ids = [selected].flat().map((row) => row.id)
    const chunks = []
    for (let i = 0; i < ids.length; i += maxPerRequest) {
      chunks.push({
        ...request,
        Action,
        Users: ids.slice(i, i + maxPerRequest),
      })
    }
    return chunks.length > 1 ? chunks : { ...request, Action, Users: ids }
  }
  const aliasActions = [
    {
      ...postAction,
      label: 'Add the alias',
      icon: <CippIcons.AlternateEmail />,
      condition: (row) => row.status === 'Ready',
      confirmText: `Add a ${request?.TargetDomain} email address to the selected users and groups? Their sign-in name and primary email address do not change, so nobody has to sign in again.`,
      customDataformatter: withAction('AddAlias'),
    },
  ]
  const moveActions = [
    {
      ...postAction,
      label: 'Move to the new domain',
      icon: <CippIcons.ArrowRightIcon />,
      condition: (row) => row.status === 'Ready',
      confirmText: `Move the selected users and groups from ${request?.SourceDomain} to ${request?.TargetDomain}? A changed sign-in name takes effect straight away, so these users will have to sign in again with their new name.`,
      customDataformatter: withAction('Move'),
    },
    {
      ...postAction,
      label: 'Use the sign-in name as the email address',
      icon: <CippIcons.AlternateEmail />,
      condition: (row) => row.mismatch,
      confirmText:
        'Make the sign-in name of the selected users their primary email address? Their current primary email address stays on the mailbox as an alias, so mail sent to it still arrives. Their sign-in name does not change.',
      customDataformatter: withAction('UseSignInNameAsEmail'),
    },
    {
      ...postAction,
      label: 'Use the email address as the sign-in name',
      icon: <CippIcons.Badge />,
      condition: (row) => row.mismatch,
      confirmText:
        'Make the primary email address of the selected users their sign-in name? A changed sign-in name takes effect straight away, so these users will have to sign in again with their email address. Their email addresses do not change.',
      customDataformatter: withAction('UseEmailAsSignInName'),
    },
  ]

  return (
    <Stack spacing={2} sx={{ px: 3 }}>
      <CippButtonCard
        title="Move users and groups to another domain"
        CardButton={
          <Button
            variant="contained"
            onClick={runPreview}
            disabled={preview.isPending}
            startIcon={<CippIcons.EyeIcon />}
          >
            Preview changes
          </Button>
        }
      >
        <Grid container spacing={2}>
          <Grid size={12}>
            <CippFormComponent
              type="radio"
              name="Action"
              label="What to do"
              options={[
                {
                  label:
                    'Move to the new domain (sign-in name and primary email address)',
                  value: 'Move',
                },
                {
                  label: 'Add the new domain as an alias only',
                  value: 'AddAlias',
                },
              ]}
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormDomainSelector
              formControl={formControl}
              name="SourceDomain"
              label={
                formAliasMode
                  ? 'Domain of the current primary email address'
                  : 'Move from domain'
              }
              preselectDefaultDomain={false}
              showRefresh={true}
              validators={{ required: 'Choose the domain to move from' }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormDomainSelector
              formControl={formControl}
              name="TargetDomain"
              label={formAliasMode ? 'Domain to add' : 'Move to domain'}
              preselectDefaultDomain={false}
              showRefresh={true}
              validators={{
                required: 'Choose the domain to move to',
                validate: (value) =>
                  value?.value !==
                    formControl.getValues('SourceDomain')?.value ||
                  'Choose a different domain from the one you are moving from',
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="switch"
              name="SkipCollisions"
              label="Skip users and groups whose new address is already in use"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="switch"
              name="IncludeSharedMailboxes"
              label="Include shared mailboxes"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="switch"
              name="IncludeGroups"
              label="Include Microsoft 365 groups and distribution lists (only their email address changes)"
              formControl={formControl}
            />
          </Grid>
          <Grid size={12}>
            <CippApiResults apiObject={preview} errorsOnly={true} />
          </Grid>
        </Grid>
      </CippButtonCard>
      {request && (
        <CippDataTable
          title={
            aliasMode
              ? `Planned ${request.TargetDomain} aliases for ${request.SourceDomain} addresses`
              : `Planned changes from ${request.SourceDomain} to ${request.TargetDomain}`
          }
          simpleColumns={aliasMode ? aliasColumns : simpleColumns}
          data={rows}
          isFetching={preview.isPending}
          refreshFunction={runPreview}
          actions={aliasMode ? aliasActions : moveActions}
          mobileCard={{ primary: 'displayName', secondary: 'status' }}
        />
      )}
    </Stack>
  )
}

// Keyed on the tenant so switching tenants starts a fresh form and preview.
const Page = () => {
  const tenantFilter = useSettings().currentTenant
  return <EmailDomainMigration key={tenantFilter} tenantFilter={tenantFilter} />
}

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>
)

export default Page
