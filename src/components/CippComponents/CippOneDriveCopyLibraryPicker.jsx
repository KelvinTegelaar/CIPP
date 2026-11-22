import { Alert, AlertTitle, Stack } from '@mui/material'
import { useWatch } from 'react-hook-form'
import CippFormComponent from './CippFormComponent'
import { useSettings } from '../../hooks/use-settings'
import { getRowTenant } from '../../utils/resolve-row-templates'

export const oneDriveCopyDisclaimer =
  "CIPP does not copy the files itself: it starts SharePoint copy jobs (the same ones SharePoint's own Copy to uses) and reports what SharePoint returns. How long a copy takes, and any file SharePoint fails to copy, are outside CIPP's control. Shortcuts to other people's files are not copied."

export const CippOneDriveCopyAlert = () => (
  <Alert severity="warning" sx={{ my: 1 }}>
    <AlertTitle>Copying the OneDrive</AlertTitle>
    The OneDrive is copied into a folder named after the user in each selected
    user's OneDrive and in the document library. Existing files are kept.
    Disable Sign in is turned on because the copy needs it, and if Remove
    Licenses is on, licences are only removed once the copy completes.{' '}
    {oneDriveCopyDisclaimer}
  </Alert>
)

// Site, document library and optional folder, for a OneDrive copy or a OneDrive shortcut; the value is
// { site, library, folder }. libraryValueField picks what the library carries: its list id or its URL.
export const CippOneDriveCopyLibraryPicker = ({
  formControl,
  name = 'library',
  tenantFilter,
  row,
  disabled,
  siteLabel = 'Copy to a document library: site',
  siteRequired = false,
  libraryRequired = true,
  libraryValueField = 'Id',
}) => {
  const currentTenant = useSettings().currentTenant
  // From a table row (an AllTenants list), the row's own tenant
  const tenant = tenantFilter ?? getRowTenant(row, currentTenant)
  const site = useWatch({ control: formControl.control, name: `${name}.site` })
  const siteUrl = site?.value
  const library = useWatch({ control: formControl.control, name: `${name}.library` })

  return (
    <Stack spacing={1}>
      <CippFormComponent
        type="autoComplete"
        name={`${name}.site`}
        label={siteLabel}
        placeholder="Pick a site, or type a site or subsite URL"
        formControl={formControl}
        multiple={false}
        creatable={true}
        disabled={disabled}
        validators={siteRequired ? { required: 'Pick a site' } : undefined}
        api={{
          url: '/api/ListSiteBrowser',
          tenantFilter: tenant,
          dataKey: 'Results',
          queryKey: `OneDriveCopySites-${tenant}`,
          labelField: (site) => `${site.displayName} (${site.webUrl})`,
          valueField: 'webUrl',
        }}
      />
      {siteUrl && (
        <>
          <CippFormComponent
            type="autoComplete"
            name={`${name}.library`}
            label={libraryRequired ? 'Document library' : 'Document library (optional)'}
            placeholder={libraryRequired ? undefined : "The site's default Documents library"}
            formControl={formControl}
            multiple={false}
            creatable={false}
            disabled={disabled}
            validators={
              libraryRequired ? { required: 'Pick a document library, or clear the site' } : undefined
            }
            api={{
              url: '/api/ListSiteLibraries',
              tenantFilter: tenant,
              data: { SiteUrl: siteUrl },
              dataKey: 'Results',
              queryKey: `OneDriveCopyLibraries-${tenant}-${siteUrl}`,
              labelField: 'Title',
              valueField: libraryValueField,
              dataFilter: (options) =>
                options.filter(
                  (option) => option.rawData?.Template === 'documentLibrary'
                ),
            }}
          />
          {/* A folder is a path inside the chosen library, so it waits for one */}
          {(libraryRequired || library?.value) && (
            <CippFormComponent
              type="textField"
              name={`${name}.folder`}
              label="Folder (optional)"
              placeholder="An existing folder, e.g. Finance/2026"
              formControl={formControl}
              disabled={disabled}
            />
          )}
        </>
      )}
    </Stack>
  )
}
