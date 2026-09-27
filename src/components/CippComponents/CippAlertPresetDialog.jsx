import { Stack, Typography } from '@mui/material'
import { CippApiDialog } from './CippApiDialog'
import CippFormComponent from './CippFormComponent'
import auditLogTemplates from '../../data/AuditLogTemplates.json'
import alertActions from '../../data/alertActions.json'

const logbookLabels = {
  'Audit.AzureActiveDirectory': 'Azure AD',
  'Audit.Exchange': 'Exchange',
  'Audit.SharePoint': 'SharePoint',
}

// The alert rule for a preset is the preset's own template from AuditLogTemplates.json, exactly
// what the alert configuration page loads. An operation without a preset gets a single
// "Operation equals" condition.
export const alertTemplateFor = ({ preset, operation, logbook }) => {
  const entry = auditLogTemplates.find((template) => template.value === preset)
  if (entry?.template) return { name: entry.name, ...entry.template }
  return {
    name: `${operation} is recorded in the audit log`,
    preset: null,
    logbook: { value: logbook, label: logbookLabels[logbook] ?? logbook },
    conditions: [
      {
        Property: { value: 'List:Operation', label: 'Operation' },
        Operator: { value: 'EQ', label: 'Equals to' },
        Input: { value: operation, label: operation },
      },
    ],
  }
}

// Creates an audit-log alert for one tenant through the same AddAlert call the alert
// configuration page makes, with the same action options. Anything beyond the preset's own
// conditions is edited on that page afterwards.
export const CippAlertPresetDialog = ({
  createDialog,
  tenant,
  preset,
  operation,
  logbook,
  relatedQueryKeys = [],
}) => {
  const template = alertTemplateFor({ preset, operation, logbook })

  return (
    <CippApiDialog
      createDialog={createDialog}
      title="Enable the alert"
      children={({ formHook }) => (
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Creates the alert "{template.name}" for {tenant}. Once saved it
            appears in the alert configuration list like any other alert, where
            its conditions and actions can be changed.
          </Typography>
          <CippFormComponent
            type="autoComplete"
            name="Actions"
            label="Actions to take"
            formControl={formHook}
            multiple={true}
            creatable={false}
            options={alertActions}
            validators={{
              required: { value: true, message: 'Pick at least one action' },
            }}
          />
          <CippFormComponent
            type="textField"
            name="AlertComment"
            label="Alert comment"
            formControl={formHook}
            multiline={true}
            rows={2}
          />
        </Stack>
      )}
      api={{
        url: '/api/AddAlert',
        type: 'POST',
        confirmText: `Enable this alert for ${tenant}?`,
        relatedQueryKeys: ['ListAlertsQueue', ...relatedQueryKeys],
        customDataformatter: (row, action, formData) => ({
          tenantFilter: [{ value: tenant, label: tenant, type: 'Tenant' }],
          excludedTenants: [],
          preset: template.preset,
          logbook: template.logbook,
          conditions: template.conditions,
          Actions: formData.Actions,
          AlertComment: formData.AlertComment ?? '',
          CustomSubject: '',
        }),
      }}
      row={{ preset, operation, logbook }}
    />
  )
}

export default CippAlertPresetDialog
