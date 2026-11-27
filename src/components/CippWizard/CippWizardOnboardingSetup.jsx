import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material'
import { Grid } from '@mui/system'
import { useWatch } from 'react-hook-form'
import languageList from '../../data/languageList.json'
import timezoneList from '../../data/timezoneList.json'
import { isCalendarLevelMissing } from '../../utils/get-onboarding-fixes'
import CippFormComponent from '../CippComponents/CippFormComponent'
import { CippFormUserSelector } from '../CippComponents/CippFormUserSelector'

export const SETUP_FIELD = 'HIDDEN_setup'

const languageOptions = languageList.map((entry) => ({
  label: `${entry.language} (${entry['Geographic area']}) - ${entry.tag}`,
  value: entry.tag,
}))
const timezoneOptions = timezoneList.map((tz) => ({
  label: `${tz.standardTime} - ${tz.timezone}`,
  value: tz.standardTime,
}))
// Same levels as the calendar permissions dialog.
const calendarLevels = [
  { value: 'Author', label: 'Author' },
  { value: 'Contributor', label: 'Contributor' },
  { value: 'Editor', label: 'Editor' },
  { value: 'Owner', label: 'Owner' },
  { value: 'NonEditingAuthor', label: 'Non Editing Author' },
  { value: 'PublishingAuthor', label: 'Publishing Author' },
  { value: 'PublishingEditor', label: 'Publishing Editor' },
  { value: 'Reviewer', label: 'Reviewer' },
  { value: 'LimitedDetails', label: 'Limited Details' },
  { value: 'AvailabilityOnly', label: 'Availability Only' },
]
const mailboxAccess = [
  ['accessNoAutomap', 'Grant Full Access (no automap)'],
  ['accessAutomap', 'Grant Full Access (automap)'],
  ['accessSendAs', 'Grant Send As Access'],
  ['accessSendOnBehalf', 'Grant Send on Behalf Access'],
]

// Mailbox and OneDrive options the onboarding job runs once the user has a licence. The values
// live under HIDDEN_setup in the wizard's form; getSetupFixes turns them into job fixes.
export const CippWizardOnboardingSetup = ({ formControl, tenant, note }) => {
  const setup = useWatch({ control: formControl.control, name: SETUP_FIELD })
  const isEditor = setup?.calendarLevel?.value === 'Editor'
  const hasShortcuts = [setup?.shortcuts ?? []].flat().length > 0

  return (
    <Card variant="outlined">
      <CardHeader title="Mailbox and OneDrive setup" />
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          {note && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {note}
              </Typography>
            </Grid>
          )}
          <Grid size={{ xs: 12, md: 6 }}>
            {hasShortcuts ? (
              <FormControlLabel
                control={<Switch checked onChange={() => {}} />}
                label="Pre-provision OneDrive (required for shortcuts)"
              />
            ) : (
              <CippFormComponent
                type="switch"
                name={`${SETUP_FIELD}.provisionOneDrive`}
                label="Pre-provision OneDrive"
                formControl={formControl}
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="switch"
              name={`${SETUP_FIELD}.enableArchive`}
              label="Enable online archive"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              name={`${SETUP_FIELD}.shortcuts`}
              label="Add OneDrive shortcuts to SharePoint sites"
              placeholder="Pick sites, or type a site or document library URL"
              helperText="Each one is added to the user's OneDrive as a shortcut. Choosing a shortcut also pre-provisions the OneDrive, which has to exist first."
              formControl={formControl}
              multiple={true}
              creatable={true}
              api={{
                url: '/api/ListSiteBrowser',
                tenantFilter: tenant,
                dataKey: 'Results',
                queryKey: `OneDriveCopySites-${tenant}`,
                labelField: (site) => `${site.displayName} (${site.webUrl})`,
                valueField: 'webUrl',
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="autoComplete"
              name={`${SETUP_FIELD}.locale`}
              label="Mailbox language"
              formControl={formControl}
              multiple={false}
              creatable={false}
              options={languageOptions}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="autoComplete"
              name={`${SETUP_FIELD}.timeZone`}
              label="Time zone"
              helperText={
                setup?.locale?.value
                  ? undefined
                  : 'Choose a mailbox language to set the time zone.'
              }
              disabled={!setup?.locale?.value}
              formControl={formControl}
              multiple={false}
              creatable={false}
              options={timezoneOptions}
            />
          </Grid>
          {mailboxAccess.map(([field, label]) => (
            <Grid key={field} size={{ xs: 12, md: 6 }}>
              <CippFormUserSelector
                formControl={formControl}
                name={`${SETUP_FIELD}.${field}`}
                label={label}
                placeholder="Leave blank if not needed"
                multiple={true}
                valueField="userPrincipalName"
              />
            </Grid>
          ))}
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormUserSelector
              formControl={formControl}
              name={`${SETUP_FIELD}.calendarUsers`}
              label="Give access to the calendar"
              placeholder="Leave blank if not needed"
              multiple={true}
              valueField="userPrincipalName"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="autoComplete"
              name={`${SETUP_FIELD}.calendarLevel`}
              label="Permission Level"
              helperText={
                isCalendarLevelMissing(setup)
                  ? 'Choose a permission level to give the selected people access to the calendar.'
                  : undefined
              }
              formControl={formControl}
              multiple={false}
              creatable={false}
              options={calendarLevels}
            />
            <CippFormComponent
              type="switch"
              name={`${SETUP_FIELD}.calendarPrivateItems`}
              label="Delegate with Private item access"
              helperText={
                isEditor
                  ? undefined
                  : 'Only usable when permission level is Editor'
              }
              disabled={!isEditor}
              formControl={formControl}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default CippWizardOnboardingSetup
