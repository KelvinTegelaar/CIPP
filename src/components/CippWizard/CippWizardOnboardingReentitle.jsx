import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from '@mui/material'
import { Grid } from '@mui/system'
import { useEffect } from 'react'
import { useWatch } from 'react-hook-form'
import { ApiGetCall } from '../../api/ApiCall'
import { CippIcons } from '../../utils/icon-registry'
import { getCippLicenseTranslation } from '../../utils/get-cipp-license-translation'
import {
  getOnboardingFixes,
  getSnapshotDefaults,
  templateGroupsToOptions,
} from '../../utils/get-onboarding-fixes'
import CippFormComponent from '../CippComponents/CippFormComponent'
import { CippFormCondition } from '../CippComponents/CippFormCondition'
import { CippFormUserSelector } from '../CippComponents/CippFormUserSelector'
import { formatOnboardingDate } from './CippWizardOnboardingScan'
import {
  CippWizardOnboardingSetup,
  SETUP_FIELD,
} from './CippWizardOnboardingSetup'
import { CippWizardStepButtons } from './CippWizardStepButtons'

const FIELD = 'HIDDEN_reentitle'
const toggle = (list = [], id) =>
  list.includes(id) ? list.filter((item) => item !== id) : [...list, id]

// Switches, not checkboxes, to match the rest of the app.
const Tick = ({ label, detail, ...checkbox }) => (
  <FormControlLabel
    sx={{ alignItems: 'flex-start', mx: 0 }}
    control={<Switch sx={{ mr: 1 }} {...checkbox} />}
    label={
      <>
        <Typography variant="body2">{label}</Typography>
        {detail && (
          <Typography
            variant="caption"
            component="div"
            sx={{ color: 'text.secondary' }}
          >
            {detail}
          </Typography>
        )}
      </>
    }
  />
)

export const CippWizardOnboardingReentitle = (props) => {
  const { formControl, onPreviousStep, onNextStep, currentStep } = props
  const tenant = useWatch({
    control: formControl.control,
    name: 'tenantFilter',
  })?.value
  const user = useWatch({ control: formControl.control, name: 'user' })
  const selection = useWatch({
    control: formControl.control,
    name: 'HIDDEN_scanSelection',
  })
  const reentitle =
    useWatch({ control: formControl.control, name: FIELD }) ?? {}
  const setup = useWatch({ control: formControl.control, name: SETUP_FIELD })
  const fixes = useWatch({ control: formControl.control, name: 'Fixes' }) ?? []

  // Same key as the scan step, so this reads the scan the technician just reviewed.
  const userId = user?.addedFields?.id ?? user?.value
  const scan = ApiGetCall({
    url: '/api/ListUserOnboardingScan',
    data: { tenantFilter: tenant, UserId: userId },
    queryKey: `OnboardingScan-${tenant}-${userId}`,
    waiting: Boolean(tenant && userId),
    refetchOnMount: false,
  })
  const results = scan.data?.Results
  const snapshot = results?.Snapshot

  const userTemplates = ApiGetCall({
    url: `/api/ListNewUserDefaults?TenantFilter=${tenant}`,
    queryKey: `UserDefaults-${tenant}`,
    refetchOnReconnect: false,
    waiting: Boolean(tenant),
  })
  const integrationSettings = ApiGetCall({
    url: '/api/ListExtensionsConfig',
    queryKey: 'ListExtensionsConfig',
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  // Start each user from the snapshot when there is one.
  useEffect(() => {
    if (!results || reentitle.user === userId) return
    formControl.setValue(FIELD, {
      user: userId,
      mode: snapshot ? 'snapshot' : 'template',
      ...getSnapshotDefaults(snapshot),
    })
  }, [results, userId])

  // Choosing a template pre-fills licences and groups once; later edits are kept.
  const templateKey = reentitle.userTemplate?.value
  useEffect(() => {
    if (!templateKey || reentitle.appliedTemplate === templateKey) return
    const template = reentitle.userTemplate.addedFields
    formControl.setValue(`${FIELD}.appliedTemplate`, templateKey)
    formControl.setValue(
      `${FIELD}.licenses`,
      Array.isArray(template?.licenses) ? template.licenses : []
    )
    formControl.setValue(
      `${FIELD}.AddToGroups`,
      templateGroupsToOptions(template)
    )
  }, [templateKey])

  useEffect(() => {
    if (!results) return
    const next = getOnboardingFixes({
      findings: results.Findings,
      ticked: selection?.user === userId ? selection.ticked : {},
      reentitle,
      snapshot,
      setup,
    })
    if (
      JSON.stringify(next) !== JSON.stringify(formControl.getValues('Fixes'))
    ) {
      formControl.setValue('Fixes', next)
    }
  }, [results, selection, reentitle, setup])

  return (
    <Stack spacing={3}>
      <Card variant="outlined">
        <CardHeader title="Licences and groups" />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <CippFormComponent
              type="radio"
              name={`${FIELD}.mode`}
              formControl={formControl}
              options={[
                ...(snapshot
                  ? [
                      {
                        label: `Restore from the offboarding snapshot (${formatOnboardingDate(snapshot.OffboardedAt)})`,
                        value: 'snapshot',
                      },
                    ]
                  : []),
                {
                  label: 'Use a template or copy from another user',
                  value: 'template',
                },
              ]}
            />

            {reentitle.mode === 'snapshot' && snapshot && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2">Licences</Typography>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {(snapshot.Licenses ?? []).map((licence) => (
                      <Tick
                        key={licence.skuId}
                        label={licence.displayName || licence.skuPartNumber}
                        detail={`${licence.available} available`}
                        checked={
                          reentitle.snapshotLicenses?.includes(licence.skuId) ??
                          false
                        }
                        onChange={() =>
                          formControl.setValue(
                            `${FIELD}.snapshotLicenses`,
                            toggle(reentitle.snapshotLicenses, licence.skuId)
                          )
                        }
                      />
                    ))}
                    {!snapshot.Licenses?.length && (
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                      >
                        The user had no licences.
                      </Typography>
                    )}
                  </Stack>
                  {snapshot.Manager && (
                    <>
                      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                        Manager
                      </Typography>
                      <Tick
                        label={snapshot.Manager.displayName}
                        detail={snapshot.Manager.userPrincipalName}
                        checked={reentitle.snapshotManager === true}
                        onChange={(event) =>
                          formControl.setValue(
                            `${FIELD}.snapshotManager`,
                            event.target.checked
                          )
                        }
                      />
                    </>
                  )}
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2">Groups</Typography>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {(snapshot.Groups ?? []).map((group) => (
                      <Tick
                        key={group.id}
                        label={group.displayName}
                        detail={
                          group.restorable ? group.groupType : group.skipReason
                        }
                        disabled={!group.restorable}
                        checked={
                          group.restorable &&
                          (reentitle.snapshotGroups?.includes(group.id) ??
                            false)
                        }
                        onChange={() =>
                          formControl.setValue(
                            `${FIELD}.snapshotGroups`,
                            toggle(reentitle.snapshotGroups, group.id)
                          )
                        }
                      />
                    ))}
                    {!snapshot.Groups?.length && (
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                      >
                        The user was in no groups.
                      </Typography>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            )}

            {reentitle.mode === 'template' && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CippFormComponent
                    type="autoComplete"
                    label="User Template (optional)"
                    name={`${FIELD}.userTemplate`}
                    multiple={false}
                    creatable={false}
                    options={
                      userTemplates.data?.map?.((template) => ({
                        label: template.templateName,
                        value: template.GUID,
                        addedFields: template,
                      })) ?? []
                    }
                    customAction={{
                      icon: <CippIcons.Sync />,
                      tooltip: 'Refresh templates',
                      onClick: () => userTemplates.refetch(),
                      position: 'outside',
                    }}
                    isFetching={userTemplates.isFetching}
                    formControl={formControl}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CippFormUserSelector
                    formControl={formControl}
                    name={`${FIELD}.copyFrom`}
                    label="Copy groups from user"
                    multiple={false}
                    showRefresh={true}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="autoComplete"
                    label="Licenses"
                    name={`${FIELD}.licenses`}
                    multiple={true}
                    creatable={false}
                    formControl={formControl}
                    api={{
                      tenantFilter: tenant,
                      url: '/api/ListLicenses',
                      labelField: (option) =>
                        `${getCippLicenseTranslation([option])} (${option?.availableUnits} available)`,
                      valueField: 'skuId',
                      queryKey: `ListLicenses-${tenant}`,
                      data: {
                        Endpoint: 'subscribedSkus',
                        $count: true,
                        IncludeExcluded: true,
                      },
                      showRefresh: true,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="autoComplete"
                    label="Add to Groups"
                    name={`${FIELD}.AddToGroups`}
                    multiple={true}
                    creatable={false}
                    formControl={formControl}
                    api={{
                      tenantFilter: tenant,
                      url: '/api/ListGroups',
                      queryKey: `OnboardingGroups-${tenant}`,
                      labelField: (group) =>
                        group.mail
                          ? `${group.displayName} - ${group.mail}`
                          : group.displayName,
                      valueField: 'id',
                      addedField: {
                        groupType: 'groupType',
                        displayName: 'displayName',
                      },
                      showRefresh: true,
                    }}
                  />
                </Grid>
              </Grid>
            )}
          </Stack>
        </CardContent>
      </Card>

      <CippWizardOnboardingSetup formControl={formControl} tenant={tenant} />

      <Card variant="outlined">
        <CardHeader title="Scheduling & Notifications" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                name="Scheduled.enabled"
                label="Schedule this onboarding"
                type="switch"
                formControl={formControl}
              />
            </Grid>
            <CippFormCondition
              formControl={formControl}
              field="Scheduled.enabled"
              compareType="is"
              compareValue={true}
            >
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2">
                  Scheduled Onboarding Date
                </Typography>
                <CippFormComponent
                  name="Scheduled.date"
                  type="datePicker"
                  formControl={formControl}
                  fullWidth
                />
              </Grid>
            </CippFormCondition>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2">Send results to:</Typography>
              <CippFormComponent
                name="postExecution.webhook"
                label="Webhook"
                type="switch"
                formControl={formControl}
              />
              <CippFormComponent
                name="postExecution.email"
                label="E-mail"
                type="switch"
                formControl={formControl}
              />
              <CippFormComponent
                name="postExecution.psa"
                label="PSA"
                type="switch"
                formControl={formControl}
              />
              <CippFormComponent
                name="postExecution.push"
                label="Push notification to my devices"
                type="switch"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="textField"
                fullWidth
                label="Reference"
                name="reference"
                placeholder="Enter a reference that will be added to the notification title and scheduled task"
                formControl={formControl}
              />
            </Grid>
            {integrationSettings?.data?.HaloPSA?.Enabled === true && (
              <CippFormCondition
                formControl={formControl}
                field="postExecution.psa"
                compareType="is"
                compareValue={true}
              >
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="number"
                    fullWidth
                    label="HaloPSA Ticket"
                    name="PsaTicketId"
                    placeholder="Enter the related HaloPSA Ticket ID"
                    helperText="The results are added to the associated ticket in HaloPSA as a note instead of raising a new ticket."
                    formControl={formControl}
                  />
                </Grid>
              </CippFormCondition>
            )}
          </Grid>
        </CardContent>
      </Card>

      {fixes.length === 0 && (
        <Alert severity="info">
          Nothing is selected yet. Tick a fix on the previous step, or choose
          licences or groups here, to continue.
        </Alert>
      )}

      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
        nextButtonDisabled={fixes.length === 0}
      />
    </Stack>
  )
}

export default CippWizardOnboardingReentitle
