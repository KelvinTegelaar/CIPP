import { useRef, useState } from 'react'
import { Alert, Typography } from '@mui/material'
import { Grid } from '@mui/system'
import CippFormComponent from './CippFormComponent'
import { CippFormCondition } from './CippFormCondition'
import { LinearProgressWithLabel } from '../linearProgressWithLabel'
import { ApiPostCall } from '../../api/ApiCall'
import { blobToBase64 } from '../../utils/intunewin-package'
import {
  encryptAndUploadPackage,
  readMacPackage,
} from '../../utils/macos-package'

// Every value of macOSMinimumOperatingSystem from macOS 11 on (Intune's agent no longer supports older).
const macOSReleases = [
  ['v11_0', 'macOS 11 Big Sur'],
  ['v12_0', 'macOS 12 Monterey'],
  ['v13_0', 'macOS 13 Ventura'],
  ['v14_0', 'macOS 14 Sonoma'],
  ['v15_0', 'macOS 15 Sequoia'],
  ['v26_0', 'macOS 26 Tahoe'],
].map(([value, label]) => ({ value, label }))

export const CippMacAppPackageFields = ({ formControl, onBusyChange }) => {
  const [upload, setUpload] = useState({ progress: null, error: null })
  const uploadCall = ApiPostCall({})
  const packageInfo = formControl.watch('packageInfo')
  // The name the last package filled in, so a replacement package can tell it from an edited name
  const lastName = useRef(null)

  const handlePackage = async (file) => {
    formControl.setValue('packageFile', null)
    if (!file) return
    setUpload({ progress: 0, error: null })
    onBusyChange?.(true)
    try {
      const { kind, title, bundles } = await readMacPackage(file)
      const [primary] = bundles
      // A name still as filled in from the previous package follows the new one; an edited name is kept.
      const applicationName = title ?? file.name.replace(/\.(pkg|dmg)$/i, '')
      const currentName = formControl.getValues('applicationName')
      if (
        !currentName ||
        currentName ===
          (lastName.current ??
            formControl.getValues('packageInfo')?.applicationName)
      )
        formControl.setValue('applicationName', applicationName, {
          shouldDirty: true,
        })
      lastName.current = applicationName
      // Detection uses the bundle ID and version, so a package's own values replace earlier ones.
      if (primary) {
        formControl.setValue('primaryBundleId', primary.bundleId, {
          shouldDirty: true,
        })
        formControl.setValue('primaryBundleVersion', primary.bundleVersion, {
          shouldDirty: true,
        })
        formControl.setValue(
          'includedApps',
          bundles
            .map((b) => `${b.bundleId} ${b.bundleVersion}`.trim())
            .join('\n'),
          { shouldDirty: true }
        )
      }
      const { packageId, blockCount, metadata } = await encryptAndUploadPackage(
        {
          file,
          post: (url, data) => uploadCall.mutateAsync({ url, data }),
          onProgress: (progress) => setUpload({ progress, error: null }),
        }
      )
      formControl.setValue('packageId', packageId, { shouldDirty: true })
      formControl.setValue('packageUpload', { blockCount, metadata })
      formControl.setValue('packageInfo', {
        fileName: file.name,
        size: file.size,
        kind,
        applicationName,
      })
      setUpload({ progress: null, error: null })
    } catch (error) {
      setUpload({
        progress: null,
        error: String(
          error?.response?.data?.Results ?? error?.message ?? 'Upload failed'
        ),
      })
    } finally {
      onBusyChange?.(false)
    }
  }

  const handleIcon = async (file) => {
    formControl.setValue('iconFile', null)
    if (!file) return
    formControl.setValue('largeIcon', await blobToBase64(file), {
      shouldDirty: true,
    })
    formControl.setValue('largeIconType', file.type || 'image/png')
  }

  return (
    <>
      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="file"
          label="macOS installer (.pkg or .dmg)"
          name="packageFile"
          accept=".pkg,.dmg"
          onChange={handlePackage}
          formControl={formControl}
          disabled={upload.progress !== null}
        />
      </Grid>
      {upload.progress !== null && (
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2">
            Encrypting and uploading the installer to CIPP
          </Typography>
          <LinearProgressWithLabel value={upload.progress} />
        </Grid>
      )}
      {upload.error && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="error">{upload.error}</Alert>
        </Grid>
      )}
      {packageInfo && upload.progress === null && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="success">
            {packageInfo.fileName} ({(packageInfo.size / 1048576).toFixed(1)}{' '}
            MB)
            {packageInfo.kind === 'dmg'
              ? ' - check the bundle ID and version match the app in this disk image'
              : ''}
          </Alert>
        </Grid>
      )}

      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Application Name"
          name="applicationName"
          formControl={formControl}
          validators={{ required: 'Application name is required' }}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Publisher"
          name="publisher"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Description"
          name="description"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="App bundle ID (e.g. com.vendor.app)"
          name="primaryBundleId"
          formControl={formControl}
          validators={{ required: 'The bundle ID is required' }}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="App version (CFBundleShortVersionString)"
          name="primaryBundleVersion"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Included apps, one per line: bundle ID and version"
          name="includedApps"
          formControl={formControl}
          multiline
          rows={3}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="autoComplete"
          label="Minimum macOS version (empty = macOS 12)"
          name="minimumMacOS"
          options={macOSReleases}
          multiple={false}
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="switch"
          label="Ignore app version (detect by bundle ID only, for apps that update themselves)"
          name="ignoreVersionDetection"
          formControl={formControl}
        />
      </Grid>
      <CippFormCondition
        formControl={formControl}
        field="packageInfo.kind"
        compareType="isNot"
        compareValue="dmg"
      >
        <Grid size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Pre-install script (optional)"
            name="preInstallScript"
            formControl={formControl}
            multiline
            rows={4}
          />
        </Grid>
        <Grid size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Post-install script (optional)"
            name="postInstallScript"
            formControl={formControl}
            multiline
            rows={4}
          />
        </Grid>
      </CippFormCondition>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="file"
          label="Icon (PNG or JPEG, optional)"
          name="iconFile"
          accept="image/png,image/jpeg"
          onChange={handleIcon}
          formControl={formControl}
        />
      </Grid>
      <CippFormCondition
        formControl={formControl}
        field="packageInfo.kind"
        compareType="is"
        compareValue="dmg"
      >
        <Grid size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Mark for Uninstallation"
            name="InstallationIntent"
            formControl={formControl}
          />
        </Grid>
      </CippFormCondition>
      <Grid size={{ xs: 12 }}>
        <Alert severity="info">
          A tenant with an older version of this package gets the new version on
          its existing app.
        </Alert>
      </Grid>
    </>
  )
}
