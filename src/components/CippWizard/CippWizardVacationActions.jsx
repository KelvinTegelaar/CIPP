import { useEffect } from 'react'
import {
  Alert,
  Skeleton,
  Stack,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from '@mui/material'
import { Grid } from '@mui/system'
import CippWizardStepButtons from './CippWizardStepButtons'
import CippFormComponent from '../CippComponents/CippFormComponent'
import { CippFormCondition } from '../CippComponents/CippFormCondition'
import { CippFormUserSelector } from '../CippComponents/CippFormUserSelector'
import { useWatch } from 'react-hook-form'
import { ApiGetCall } from '../../api/ApiCall'
import { getCippValidator } from '../../utils/get-cipp-validator'
import { countryCodes } from '../../data/countryCodes'

export const CippWizardVacationActions = (props) => {
  const { postUrl, formControl, onPreviousStep, onNextStep, currentStep, lastStep } = props

  const currentTenant = useWatch({ control: formControl.control, name: 'tenantFilter' })
  const tenantDomain = currentTenant?.value || currentTenant

  const enableCA = useWatch({ control: formControl.control, name: 'enableCAExclusion' })
  const enableMailbox = useWatch({ control: formControl.control, name: 'enableMailboxPermissions' })
  const enableForwarding = useWatch({ control: formControl.control, name: 'enableForwarding' })
  const enableOOO = useWatch({ control: formControl.control, name: 'enableOOO' })
  const atLeastOneEnabled = enableCA || enableMailbox || enableForwarding || enableOOO

  const users = useWatch({ control: formControl.control, name: 'Users' })
  const firstUser = Array.isArray(users) && users.length > 0 ? users[0] : null
  const firstUserUpn = firstUser?.addedFields?.userPrincipalName || firstUser?.value || null
  const forwardOption = useWatch({ control: formControl.control, name: 'forwardOption' })

  const oooData = ApiGetCall({
    url: '/api/ListOoO',
    data: { UserId: firstUserUpn, tenantFilter: tenantDomain },
    queryKey: `OOO-${firstUserUpn}-${tenantDomain}`,
    waiting: !!(enableOOO && firstUserUpn && tenantDomain),
  })

  const isFetchingOOO = oooData.isFetching

  const forwardingUsers = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: 'users',
      tenantFilter: tenantDomain,
      $select: 'id,displayName,userPrincipalName,mail',
      $top: 999,
    },
    queryKey: `VacationForwardingUsers-${tenantDomain}`,
    waiting: !!(enableForwarding && tenantDomain),
  })

  const forwardingContacts = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: 'contacts',
      tenantFilter: tenantDomain,
      $select: 'displayName,mail,mailNickname',
      $top: 999,
    },
    queryKey: `VacationForwardingContacts-${tenantDomain}`,
    waiting: !!(enableForwarding && tenantDomain),
  })

  const internalAddressOptions = [
    ...((forwardingUsers.data?.Results || []).map((user) => ({
      value: user.userPrincipalName,
      label: `${user.displayName} (${user.userPrincipalName}) - User`,
    })) || []),
    ...((forwardingContacts.data?.Results || []).map((contact) => ({
      value: contact.mail || contact.emailAddress,
      label: `${contact.displayName} (${contact.mail || contact.emailAddress}) - Contact`,
    })) || []),
  ]

  useEffect(() => {
    if (oooData.isSuccess && oooData.data) {
      const currentInternal = formControl.getValues('oooInternalMessage')
      const currentExternal = formControl.getValues('oooExternalMessage')
      if (!currentInternal) {
        formControl.setValue('oooInternalMessage', oooData.data.InternalMessage || '')
      }
      if (!currentExternal) {
        formControl.setValue('oooExternalMessage', oooData.data.ExternalMessage || '')
      }
      if (oooData.data.CreateOOFEvent != null) {
        formControl.setValue('oooCreateOOFEvent', !!oooData.data.CreateOOFEvent)
      }
      if (oooData.data.OOFEventSubject) {
        formControl.setValue('oooOOFEventSubject', oooData.data.OOFEventSubject)
      }
      if (oooData.data.AutoDeclineFutureRequestsWhenOOF != null) {
        formControl.setValue(
          'oooAutoDeclineFutureRequests',
          !!oooData.data.AutoDeclineFutureRequestsWhenOOF
        )
      }
      if (oooData.data.DeclineEventsForScheduledOOF != null) {
        formControl.setValue('oooDeclineEvents', !!oooData.data.DeclineEventsForScheduledOOF)
      }
      if (oooData.data.DeclineMeetingMessage) {
        formControl.setValue('oooDeclineMeetingMessage', oooData.data.DeclineMeetingMessage)
      }
    }
  }, [oooData.isSuccess, oooData.data, formControl])

  useEffect(() => {
    if (enableForwarding && !forwardOption) {
      formControl.setValue('forwardOption', 'internalAddress')
    }
  }, [enableForwarding, forwardOption, formControl])

  return (
    <Stack spacing={4}>
      {/* Travel CA Policy Section */}
      <Card variant="outlined">
        <CardHeader
          title="Conditional Access Travel Policy"
          subheader="Creates a temporary CA policy allowing login only from selected travel destinations"
        />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <CippFormComponent
              type="switch"
              name="enableCAExclusion"
              label="Enable Travel CA Policy"
              formControl={formControl}
            />
            <CippFormCondition
              formControl={formControl}
              field="enableCAExclusion"
              compareType="is"
              compareValue={true}
              clearOnHide={false}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" sx={{ mb: 1 }}>
                    This will create a security group <strong>CIPP_TravelingUsers</strong> (if it
                    does not exist), exclude it from the selected blocking policies, and create a
                    temporary CA policy <strong>CIPP_TravelPolicy_[start]_[end]</strong> that
                    allows login only from the selected locations. The policy and group membership
                    are automatically cleaned up on the end date.
                  </Alert>
                </Grid>

                {/* Blocking CA policies - group will be excluded from these */}
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="autoComplete"
                    label={
                      tenantDomain
                        ? `Blocking CA Policies to exclude travelers from (${tenantDomain})`
                        : 'Select a tenant first'
                    }
                    name="BlockPolicies"
                    api={
                      tenantDomain
                        ? {
                            queryKey: `ListConditionalAccessPolicies-${tenantDomain}`,
                            url: '/api/ListGraphRequest',
                            data: {
                              tenantFilter: tenantDomain,
                              Endpoint: 'conditionalAccess/policies',
                              AsApp: true,
                            },
                            dataKey: 'Results',
                            labelField: (option) => `${option.displayName}`,
                            valueField: 'id',
                            showRefresh: true,
                          }
                        : null
                    }
                    multiple={true}
                    formControl={formControl}
                    validators={{
                      validate: (option) => {
                        if (!Array.isArray(option) || option.length === 0) {
                          return 'At least one blocking policy must be selected'
                        }
                        return true
                      },
                    }}
                    required={true}
                    disabled={!tenantDomain}
                  />
                </Grid>

                {/* Existing Named Locations from tenant */}
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="autoComplete"
                    label={
                      tenantDomain
                        ? `Named Locations in ${tenantDomain} (optional)`
                        : 'Select a tenant first'
                    }
                    name="NamedLocations"
                    api={
                      tenantDomain
                        ? {
                            queryKey: `ListNamedLocations-${tenantDomain}`,
                            url: '/api/ListGraphRequest',
                            data: {
                              tenantFilter: tenantDomain,
                              Endpoint: 'identity/conditionalAccess/namedLocations',
                              AsApp: true,
                            },
                            dataKey: 'Results',
                            labelField: (option) =>
                              `${option.displayName}${option.isTrusted ? ' (Trusted)' : ''}`,
                            valueField: 'id',
                            showRefresh: true,
                          }
                        : null
                    }
                    multiple={true}
                    formControl={formControl}
                    disabled={!tenantDomain}
                  />
                </Grid>

                {/* Include all Trusted Locations automatically */}
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="switch"
                    label="Include all Trusted Locations automatically"
                    name="IncludeTrusted"
                    formControl={formControl}
                  />
                </Grid>

                {/* Country selector - countries not covered by Named Locations */}
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="autoComplete"
                    label="Additional countries to allow (ISO codes)"
                    name="CountryCodes"
                    multiple={true}
                    creatable={false}
                    options={countryCodes}
                    formControl={formControl}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Alert severity="warning">
                    At least one Named Location or country must be selected, otherwise the travel
                    policy will allow login from anywhere.
                  </Alert>
                </Grid>
              </Grid>
            </CippFormCondition>
          </Stack>
        </CardContent>
      </Card>

      {/* Mailbox Permissions Section */}
      <Card variant="outlined">
        <CardHeader
          title="Mailbox Permissions"
          subheader="Grant temporary mailbox and calendar access to delegates"
        />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <CippFormComponent
              type="switch"
              name="enableMailboxPermissions"
              label="Enable Mailbox Permissions"
              formControl={formControl}
            />
            <CippFormCondition
              formControl={formControl}
              field="enableMailboxPermissions"
              compareType="is"
              compareValue={true}
              clearOnHide={false}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" sx={{ mb: 1 }}>
                    Grant temporary mailbox permissions (Full Access, Send As, Send On Behalf) and
                    optional calendar access to delegates. Permissions are automatically added at
                    the start date and removed at the end date.
                  </Alert>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <CippFormUserSelector
                    label={
                      tenantDomain ? `Delegate(s) in ${tenantDomain}` : 'Select a tenant first'
                    }
                    formControl={formControl}
                    name="delegates"
                    multiple={true}
                    addedField={{ userPrincipalName: 'userPrincipalName' }}
                    validators={{ required: 'At least one delegate is required' }}
                    required={true}
                    disabled={!tenantDomain}
                    showRefresh={true}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="autoComplete"
                    label="Permission Types"
                    name="permissionTypes"
                    formControl={formControl}
                    multiple={true}
                    creatable={false}
                    options={[
                      { label: 'Full Access', value: 'FullAccess' },
                      { label: 'Send As', value: 'SendAs' },
                      { label: 'Send On Behalf', value: 'SendOnBehalf' },
                    ]}
                    validators={{ required: 'At least one permission type is required' }}
                    required={true}
                  />
                </Grid>
                <CippFormCondition
                  formControl={formControl}
                  field="permissionTypes"
                  compareType="valueEq"
                  compareValue="FullAccess"
                  clearOnHide={false}
                >
                  <Grid size={{ xs: 12 }}>
                    <CippFormComponent
                      type="switch"
                      label="Auto-Map Mailbox (Outlook auto-adds the mailbox)"
                      name="autoMap"
                      formControl={formControl}
                    />
                  </Grid>
                </CippFormCondition>
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="switch"
                    label="Include Calendar Permissions"
                    name="includeCalendar"
                    formControl={formControl}
                  />
                </Grid>
                <CippFormCondition
                  formControl={formControl}
                  field="includeCalendar"
                  compareType="is"
                  compareValue={true}
                >
                  <Grid size={{ md: 6, xs: 12 }}>
                    <CippFormComponent
                      type="autoComplete"
                      label="Calendar Permission Level"
                      name="calendarPermission"
                      formControl={formControl}
                      multiple={false}
                      creatable={false}
                      options={[
                        { label: 'Author', value: 'Author' },
                        { label: 'Contributor', value: 'Contributor' },
                        { label: 'Editor', value: 'Editor' },
                        { label: 'Non Editing Author', value: 'NonEditingAuthor' },
                        { label: 'Owner', value: 'Owner' },
                        { label: 'Publishing Author', value: 'PublishingAuthor' },
                        { label: 'Publishing Editor', value: 'PublishingEditor' },
                        { label: 'Reviewer', value: 'Reviewer' },
                        { label: 'Available Only', value: 'AvailabilityOnly' },
                        { label: 'Limited Details', value: 'LimitedDetails' },
                      ]}
                      validators={{
                        validate: (option) => {
                          if (!option?.value) {
                            return 'Calendar permission level is required'
                          }
                          return true
                        },
                      }}
                      required={true}
                    />
                  </Grid>
                  <CippFormCondition
                    formControl={formControl}
                    field="calendarPermission"
                    compareType="valueEq"
                    compareValue="Editor"
                  >
                    <Grid size={{ md: 6, xs: 12 }}>
                      <CippFormComponent
                        type="switch"
                        label="Can View Private Items"
                        name="canViewPrivateItems"
                        formControl={formControl}
                      />
                    </Grid>
                  </CippFormCondition>
                </CippFormCondition>
              </Grid>
            </CippFormCondition>
          </Stack>
        </CardContent>
      </Card>

      {/* Mail Forwarding Section */}
      <Card variant="outlined">
        <CardHeader
          title="Mail Forwarding"
          subheader="Forward email to another recipient during the vacation period"
        />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <CippFormComponent
              type="switch"
              name="enableForwarding"
              label="Enable Mail Forwarding"
              formControl={formControl}
            />
            <CippFormCondition
              formControl={formControl}
              field="enableForwarding"
              compareType="is"
              compareValue={true}
              clearOnHide={false}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" sx={{ mb: 1 }}>
                    Vacation mode will enable forwarding at the start date and disable forwarding
                    again at the end date. Existing forwarding settings are not restored after the
                    vacation ends.
                  </Alert>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="radio"
                    name="forwardOption"
                    formControl={formControl}
                    options={[
                      { label: 'Forward to Internal Address', value: 'internalAddress' },
                      {
                        label: 'Forward to External Address (Tenant must allow this)',
                        value: 'ExternalAddress',
                      },
                    ]}
                  />
                </Grid>
                <CippFormCondition
                  formControl={formControl}
                  field="forwardOption"
                  compareType="is"
                  compareValue="internalAddress"
                >
                  <Grid size={{ xs: 12 }}>
                    <CippFormComponent
                      type="autoComplete"
                      label={
                        tenantDomain
                          ? `Forward to user or contact in ${tenantDomain}`
                          : 'Select a tenant first'
                      }
                      name="forwardInternal"
                      multiple={false}
                      options={internalAddressOptions}
                      formControl={formControl}
                      creatable={false}
                      disabled={!tenantDomain}
                      validators={{
                        validate: (option) => {
                          if (!option?.value && !option) {
                            return 'Forwarding target is required'
                          }
                          return true
                        },
                      }}
                      required={true}
                    />
                  </Grid>
                </CippFormCondition>
                <CippFormCondition
                  formControl={formControl}
                  field="forwardOption"
                  compareType="is"
                  compareValue="ExternalAddress"
                >
                  <Grid size={{ xs: 12 }}>
                    <CippFormComponent
                      type="textField"
                      label="External Email Address"
                      name="forwardExternal"
                      formControl={formControl}
                      validators={{
                        required: 'Email is required',
                        validate: (value) => getCippValidator(value, 'email'),
                      }}
                      required={true}
                    />
                  </Grid>
                </CippFormCondition>
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="switch"
                    label="Keep a Copy of the Forwarded Mail in the Source Mailbox"
                    name="forwardKeepCopy"
                    formControl={formControl}
                  />
                </Grid>
              </Grid>
            </CippFormCondition>
          </Stack>
        </CardContent>
      </Card>

      {/* Out of Office Section */}
      <Card variant="outlined">
        <CardHeader
          title="Out of Office"
          subheader="Automatically enable and disable auto-reply messages during vacation"
        />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <CippFormComponent
              type="switch"
              name="enableOOO"
              label="Enable Out of Office"
              formControl={formControl}
            />
            <CippFormCondition
              formControl={formControl}
              field="enableOOO"
              compareType="is"
              compareValue={true}
              clearOnHide={false}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" sx={{ mb: 1 }}>
                    Out of office will be enabled with the messages below at the start date and
                    automatically disabled at the end date. The disable task preserves any message
                    updates the user may have made during their vacation.
                  </Alert>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  {isFetchingOOO ? (
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        Internal Message
                      </Typography>
                      <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 1 }} />
                    </>
                  ) : (
                    <CippFormComponent
                      type="richText"
                      name="oooInternalMessage"
                      label="Internal Message"
                      formControl={formControl}
                      multiline
                      rows={4}
                    />
                  )}
                </Grid>
                <Grid size={{ xs: 12 }}>
                  {isFetchingOOO ? (
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        External Message (optional)
                      </Typography>
                      <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 1 }} />
                    </>
                  ) : (
                    <CippFormComponent
                      type="richText"
                      name="oooExternalMessage"
                      label="External Message (optional)"
                      formControl={formControl}
                      multiline
                      rows={4}
                    />
                  )}
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    Calendar Options
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="switch"
                    name="oooCreateOOFEvent"
                    label="Block my calendar for this period"
                    formControl={formControl}
                  />
                </Grid>
                <CippFormCondition
                  formControl={formControl}
                  field="oooCreateOOFEvent"
                  compareType="is"
                  compareValue={true}
                >
                  <Grid size={{ xs: 12 }}>
                    <CippFormComponent
                      type="textField"
                      name="oooOOFEventSubject"
                      label="Calendar Event Subject"
                      formControl={formControl}
                    />
                  </Grid>
                </CippFormCondition>
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="switch"
                    name="oooAutoDeclineFutureRequests"
                    label="Automatically decline new invitations during this period"
                    formControl={formControl}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="switch"
                    name="oooDeclineEvents"
                    label="Decline and cancel my meetings during this period"
                    formControl={formControl}
                  />
                </Grid>
                <CippFormCondition
                  formControl={formControl}
                  field="oooDeclineEvents"
                  compareType="is"
                  compareValue={true}
                >
                  <Grid size={{ xs: 12 }}>
                    <CippFormComponent
                      type="richText"
                      name="oooDeclineMeetingMessage"
                      label="Decline Message"
                      formControl={formControl}
                      multiline
                      rows={3}
                    />
                  </Grid>
                </CippFormCondition>
              </Grid>
            </CippFormCondition>
          </Stack>
        </CardContent>
      </Card>

      <CippWizardStepButtons
        currentStep={currentStep}
        lastStep={lastStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
        nextButtonDisabled={!atLeastOneEnabled}
      />
    </Stack>
  )
}
