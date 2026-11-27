import { Alert, Stack } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { ApiPostCall } from '../../api/ApiCall'
import { useSettings } from '../../hooks/use-settings'
import {
  getSetupFixes,
  isCalendarLevelMissing,
} from '../../utils/get-onboarding-fixes'
import { CippApiResults } from '../CippComponents/CippApiResults'
import CippAddEditUser from '../CippFormPages/CippAddEditUser'
import {
  CippWizardOnboardingSetup,
  SETUP_FIELD,
} from './CippWizardOnboardingSetup'
import { CippWizardStepButtons } from './CippWizardStepButtons'

// Hosts the Add User form as the wizard's last step. The form keeps its own state and posts to
// /api/AddUser the way the Add User drawer does, so nothing from the wizard's form is sent.
// Mailbox and OneDrive setup, kept in the wizard's form, is queued as an onboarding job afterwards.
export const CippWizardOnboardingAddUser = (props) => {
  const { formControl, onPreviousStep, onNextStep, currentStep, lastStep } =
    props
  const settings = useSettings()
  const tenant = useWatch({
    control: formControl.control,
    name: 'tenantFilter',
  })?.value
  // The Add User form loads its domains, licenses and groups for the tenant in the tenant selector.
  const tenantMatches = tenant === settings.currentTenant

  const addForm = useForm({
    mode: 'onChange',
    defaultValues: {
      tenantFilter: tenant,
      usageLocation: settings.usageLocation,
    },
  })
  const copied = useWatch({ control: addForm.control, name: 'userProperties' })
  const setup = useWatch({ control: formControl.control, name: SETUP_FIELD })

  // Copy properties from another user, as the Add User drawer does.
  useEffect(() => {
    if (!copied) return
    const { userPrincipalName, usageLocation, ...fields } =
      copied.addedFields || {}
    const [mailNickname, domain] = (userPrincipalName ?? '').split('@')
    if (mailNickname) fields.mailNickname = mailNickname
    if (domain) fields.primDomain = { label: domain, value: domain }
    if (usageLocation)
      fields.usageLocation = { label: usageLocation, value: usageLocation }
    fields.tenantFilter = tenant
    const currentTemplate = addForm.getValues('userTemplate')
    if (currentTemplate) fields.userTemplate = currentTemplate
    addForm.reset(fields)
  }, [copied])

  // Empty fields are left out of the request, as the Add User drawer does.
  const submitControl = useMemo(
    () => ({
      ...addForm,
      getValues: () =>
        Object.fromEntries(
          Object.entries(addForm.getValues()).filter(
            ([, value]) => value !== '' && value !== null
          )
        ),
    }),
    [addForm]
  )
  const queueSetup = ApiPostCall({ relatedQueryKeys: ['OnboardingJobs*'] })
  const [queuedFor, setQueuedFor] = useState(null)
  // Runs only after the user was created (or the creation was scheduled) successfully.
  const resultsEnd = useRef(null)
  const queueSetupAfterCreate = (_response, posted) => {
    // The results render below a long form; bring them into view.
    setTimeout(() => resultsEnd.current?.scrollIntoView({ block: 'end' }), 300)
    const fixes = getSetupFixes(formControl.getValues(SETUP_FIELD))
    const domain = posted?.Domain ?? posted?.primDomain?.value
    if (fixes.length === 0 || !posted?.username || !domain) return
    // A new mailbox takes a while to exist, so the setup runs 15 minutes after the creation.
    const created =
      posted.Scheduled?.enabled && posted.Scheduled?.date
        ? Number(posted.Scheduled.date)
        : Math.floor(Date.now() / 1000)
    const date = created + 15 * 60
    setQueuedFor(date)
    queueSetup.mutate({
      url: '/api/ExecOnboardUser',
      data: {
        tenantFilter: tenant,
        user: `${posted.username}@${domain}`,
        Fixes: fixes,
        Scheduled: { enabled: true, date },
      },
    })
  }

  return (
    <Stack spacing={3}>
      {!tenantMatches && (
        <Alert severity="warning">
          New users are created in the tenant selected in the tenant selector at
          the top of the page. Switch it to {tenant}, or go back and choose that
          tenant, to continue.
        </Alert>
      )}
      {tenantMatches && (
        <CippAddEditUser
          formControl={addForm}
          userSettingsDefaults={settings}
          formType="add"
        />
      )}
      {tenantMatches && (
        <CippWizardOnboardingSetup
          formControl={formControl}
          tenant={tenant}
          note="These run about 15 minutes after the user is created, once the mailbox exists. A step that fails can be run again from the User Onboarding page."
        />
      )}
      <CippWizardStepButtons
        postUrl="/api/AddUser"
        queryKeys={[`Users-${tenant}`]}
        currentStep={currentStep}
        lastStep={lastStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={submitControl}
        noSubmitButton={!tenantMatches}
        submitButtonDisabled={isCalendarLevelMissing(setup)}
        onSuccess={queueSetupAfterCreate}
      />
      {queueSetup.isSuccess && queuedFor && (
        <Alert severity="info">
          Mailbox and OneDrive setup is queued for{' '}
          {new Date(queuedFor * 1000).toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
          . Follow it on the User Onboarding page.
        </Alert>
      )}
      <CippApiResults apiObject={queueSetup} />
      <div ref={resultsEnd} />
    </Stack>
  )
}

export default CippWizardOnboardingAddUser
