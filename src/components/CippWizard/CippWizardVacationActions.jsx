import { useEffect, useState } from 'react'
import {
  Alert,
  Chip,
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
import { CippFormGroupSelector } from '../CippComponents/CippFormGroupSelector'
import { useWatch } from 'react-hook-form'
import { ApiGetCall } from '../../api/ApiCall'
import { getCippValidator } from '../../utils/get-cipp-validator'
import countryList from '../../data/countryList.json'

export const CippWizardVacationActions = (props) => {
  const { postUrl, formControl, onPreviousStep, onNextStep, currentStep, lastStep } = props

  const currentTenant = useWatch({ control: formControl.control, name: 'tenantFilter' })
  const tenantDomain = currentTenant?.value || currentTenant

  const tenantId = currentTenant?.value ?? currentTenant
  const [droppedPolicies, setDroppedPolicies] = useState([])

  const enableCA = useWatch({ control: formControl.control, name: 'enableCAExclusion' })
  const enableLocationAlertExclusion = useWatch({
    control: formControl.control,
    name: 'excludeLocationAuditAlerts',
  })
  const enableMailbox = useWatch({ control: formControl.control, name: 'enableMailboxPermissions' })
  const enableForwarding = useWatch({ control: formControl.control, name: 'enableForwarding' })
  const enableOOO = useWatch({ control: formControl.control, name: 'enableOOO' })
  const enableGroupMembership = useWatch({
    control: formControl.control,
    name: 'enableGroupMembership',
  })
  const vacationGroups = useWatch({ control: formControl.control, name: 'vacationGroups' })
  const dynamicGroups = (Array.isArray(vacationGroups) ? vacationGroups : []).filter((group) =>
    group?.addedFields?.groupTypes?.includes('DynamicMembership')
  )
  const atLeastOneEnabled =
    enableCA ||
    enableLocationAlertExclusion ||
    enableMailbox ||
    enableForwarding ||
    enableOOO ||
    enableGroupMembership

  const users = useWatch({ control: formControl.control, name: 'Users' })
  const firstUser = Array.isArray(users) && users.length > 0 ? users[0] : null
  const firstUserUpn = firstUser?.addedFields?.userPrincipalName || firstUser?.value || null
  const forwardOption = useWatch({ control: formControl.control, name: 'forwardOption' })
  const createTravelPolicy = useWatch({ control: formControl.control, name: 'createTravelPolicy' })
  const addUsageLocation = useWatch({ control: formControl.control, name: 'addUsageLocation' })
  const defaultsSource = useWatch({ control: formControl.control, name: 'HIDDEN_defaultsSource' })

  // Same query key as the policy picker, so this shares its cache entry.
  const caPolicies = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      tenantFilter: tenantDomain,
      Endpoint: 'conditionalAccess/policies',
      AsApp: true,
    },
    queryKey: `ListConditionalAccessPolicies-${tenantDomain}`,
    waiting: !!tenantDomain,
  })

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
      // Pre-populate calendar options from existing config
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

  // Apply tenant defaults once per tenant; later edits by the technician are never overwritten.
  useEffect(() => {
    if (!tenantId || formControl.getValues('HIDDEN_appliedDefaultsForTenant') === tenantId) return
    const defaults = currentTenant?.addedFields?.vacationDefaults
    setDroppedPolicies([])
    if (defaults) {
      const policies = Array.isArray(defaults.PolicyId) ? defaults.PolicyId : []
      formControl.setValue('enableCAExclusion', policies.length > 0)
      formControl.setValue('PolicyId', policies)
      formControl.setValue('createTravelPolicy', !!defaults.createTravelPolicy)
      formControl.setValue('addUsageLocation', !!defaults.addUsageLocation)
      formControl.setValue('excludeLocationAuditAlerts', !!defaults.excludeLocationAuditAlerts)
      formControl.setValue('HIDDEN_defaultsSource', 'tenant')
    } else {
      formControl.setValue('HIDDEN_defaultsSource', null)
    }
    formControl.setValue('HIDDEN_appliedDefaultsForTenant', tenantId)
  }, [tenantId, currentTenant, formControl])

  // Drop default policies that no longer exist, but only once the policy list has really loaded.
  useEffect(() => {
    const policyList = caPolicies.data?.Results
    if (
      !tenantId ||
      defaultsSource !== 'tenant' ||
      formControl.getValues('HIDDEN_staleCheckedForTenant') === tenantId ||
      !caPolicies.isSuccess ||
      caPolicies.isFetching ||
      !Array.isArray(policyList) ||
      policyList.length === 0
    ) {
      return
    }
    const known = new Set(policyList.map((policy) => policy.id))
    const selected = formControl.getValues('PolicyId') || []
    const dropped = selected.filter((policy) => !known.has(policy.value))
    if (dropped.length > 0) {
      formControl.setValue(
        'PolicyId',
        selected.filter((policy) => known.has(policy.value))
      )
      setDroppedPolicies(dropped.map((policy) => policy.label || policy.value))
    }
    formControl.setValue('HIDDEN_staleCheckedForTenant', tenantId)
  }, [tenantId, defaultsSource, caPolicies.isSuccess, caPolicies.isFetching, caPolicies.data, formControl])

  // Seed the users' home countries into the travel destinations, once per code, so a code the
  // technician removes by hand is not added back.
  useEffect(() => {
    if (!createTravelPolicy || !addUsageLocation || !Array.isArray(users)) return
    const validCodes = new Map(countryList.map(({ Code, Name }) => [Code, Name]))
    const seeded = formControl.getValues('HIDDEN_seededUsageLocations') || []
    const fresh = [
      ...new Set(
        users
          .map((user) => user?.addedFields?.usageLocation?.toUpperCase())
          .filter((code) => validCodes.has(code) && !seeded.includes(code))
      ),
    ]
    if (fresh.length === 0) return
    const current = formControl.getValues('travelCountries') || []
    const missing = fresh.filter((code) => !current.some((option) => option.value === code))
    formControl.setValue('travelCountries', [
      ...current,
      ...missing.map((code) => ({ value: code, label: validCodes.get(code) })),
    ])
    formControl.setValue('HIDDEN_seededUsageLocations', [...seeded, ...fresh])
  }, [users, createTravelPolicy, addUsageLocation, formControl])

  useEffect(() => {
    if (enableForwarding && !forwardOption) {
      formControl.setValue('forwardOption', 'internalAddress')
    }
  }, [enableForwarding, forwardOption, formControl])

  return (
    <Stack spacing={4}>
      {/* CA Policy Exclusion Section */}
      <Card variant="outlined">
        <CardHeader
          title={
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <span>Conditional Access Policy Exclusion</span>
              {defaultsSource === 'tenant' && (
                <Chip size="small" variant="outlined" color="primary" label="Using Tenant Defaults" />
              )}
            </Stack>
          }
          subheader="Temporarily exclude users from a CA policy during their vacation"
        />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <CippFormComponent
              type="switch"
              name="enableCAExclusion"
              label="Enable CA Policy Exclusion"
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
                    Vacation mode uses group-based exclusions for reliability. The exclusion group
                    follows the format: &apos;Vacation Exclusion - $Policy.displayName&apos;. For
                    longer policy names the name is shortened and suffixed with the start of the
                    policy ID, e.g. &apos;Vacation Exclusion - CA005-RegisterSecurityInfo: Require...
                    [a1b2c3d4]&apos;
                  </Alert>
                </Grid>
                {droppedPolicies.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="warning">
                      These default policies no longer exist in this tenant and were removed:{' '}
                      {droppedPolicies.join(', ')}
                    </Alert>
                  </Grid>
                )}
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="autoComplete"
                    label={
                      tenantDomain
                        ? `Conditional Access Policies in ${tenantDomain}`
                        : 'Select a tenant first'
                    }
                    name="PolicyId"
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
                        //check if option is an array, if so, ensure at least one is selected
                        if (Array.isArray(option) && option.length === 0) {
                          return 'At least one policy must be selected'
                        }
                        return true
                      },
                    }}
                    required={true}
                    disabled={!tenantDomain}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="switch"
                    label="Create temporary travel policy (only allow sign-ins from the travel destination)"
                    name="createTravelPolicy"
                    formControl={formControl}
                  />
                </Grid>
                <CippFormCondition
                  formControl={formControl}
                  field="createTravelPolicy"
                  compareType="is"
                  compareValue={true}
                  clearOnHide={false}
                >
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="info" sx={{ mb: 1 }}>
                      Excluding a user from a CA policy allows sign-ins from anywhere. This option
                      closes that gap: at the start date a named location and a conditional access
                      policy named &apos;Travel Policy &lt;users&gt; - &lt;start date&gt; - &lt;end
                      date&gt;&apos; are created, blocking sign-ins for the selected users from
                      every location except the travel destination. At the end date, the policy and
                      the named location are deleted automatically. Adding the users&apos; home country
                      keeps them signed in from home.
                    </Alert>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <CippFormComponent
                      type="switch"
                      label="Add users' home country (usage location) to the travel destinations"
                      name="addUsageLocation"
                      formControl={formControl}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <CippFormComponent
                      type="autoComplete"
                      label="Travel destination countries"
                      name="travelCountries"
                      multiple={true}
                      creatable={false}
                      options={countryList.map(({ Code, Name }) => ({
                        value: Code,
                        label: Name,
                      }))}
                      formControl={formControl}
                      validators={{
                        validate: (option) => {
                          if (!Array.isArray(option) || option.length === 0) {
                            return 'At least one travel destination country must be selected'
                          }
                          return true
                        },
                      }}
                      required={true}
                    />
                  </Grid>
                </CippFormCondition>
              </Grid>
            </CippFormCondition>
          </Stack>
        </CardContent>
      </Card>

      {/* Location Alert Exclusion Section */}
      <Card variant="outlined">
        <CardHeader
          title="Location-Based Alerts"
          subheader="Suppress location-based audit log alerts during the vacation"
        />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <CippFormComponent
              type="switch"
              name="excludeLocationAuditAlerts"
              label="Exclude from location-based audit log alerts"
              formControl={formControl}
            />

            <CippFormCondition
              formControl={formControl}
              field="excludeLocationAuditAlerts"
              compareType="is"
              compareValue={true}
              clearOnHide={false}
            >
              <Alert severity="info">
                The users are added to the audit log location alert exclusion list at the start
                date and removed again at the end date, so alerts that fire on sign-ins from an
                unusual location stay quiet while they travel. This works on its own and does not
                require a Conditional Access policy.
              </Alert>
            </CippFormCondition>
          </Stack>
        </CardContent>
      </Card>

      {/* Group Membership Section */}
      <Card variant="outlined">
        <CardHeader
          title="Group Membership"
          subheader="Add the users to groups for the duration of the vacation"
        />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <CippFormComponent
              type="switch"
              name="enableGroupMembership"
              label="Add users to group(s) for the duration of the vacation"
              formControl={formControl}
            />

            <CippFormCondition
              formControl={formControl}
              field="enableGroupMembership"
              compareType="is"
              compareValue={true}
              clearOnHide={false}
            >
              <Stack spacing={2}>
                <Alert severity="info">
                  The users are added to the selected groups at the start date and removed again at
                  the end date. Users who are already members of a group are left untouched.
                  Dynamic membership groups cannot take direct members.
                </Alert>
                <CippFormGroupSelector
                  label={tenantDomain ? `Group(s) in ${tenantDomain}` : 'Select a tenant first'}
                  formControl={formControl}
                  name="vacationGroups"
                  multiple={true}
                  select="id,displayName,groupTypes,mailEnabled,securityEnabled"
                  addedField={{
                    groupTypes: 'groupTypes',
                    mailEnabled: 'mailEnabled',
                    securityEnabled: 'securityEnabled',
                  }}
                  validators={{ required: 'At least one group is required' }}
                  required={true}
                  disabled={!tenantDomain}
                />
                {dynamicGroups.length > 0 && (
                  <Alert severity="warning">
                    {dynamicGroups.map((group) => group.label).join(', ')} use dynamic membership,
                    so the users cannot be added to them directly.
                  </Alert>
                )}
              </Stack>
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

                {/* Delegate(s) */}
                <Grid size={{ xs: 12 }}>
                  <CippFormUserSelector
                    label={
                      tenantDomain ? `Delegate(s) in ${tenantDomain}` : 'Select a tenant first'
                    }
                    formControl={formControl}
                    name="delegates"
                    multiple={true}
                    addedField={{
                      userPrincipalName: 'userPrincipalName',
                    }}
                    validators={{ required: 'At least one delegate is required' }}
                    required={true}
                    disabled={!tenantDomain}
                    showRefresh={true}
                  />
                </Grid>

                {/* Permission Types */}
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

                {/* AutoMap (visible when FullAccess is selected) */}
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

                {/* Include Calendar Permissions */}
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="switch"
                    label="Include Calendar Permissions"
                    name="includeCalendar"
                    formControl={formControl}
                  />
                </Grid>

                {/* Calendar permission details */}
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

                {/* Calendar Options */}
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
