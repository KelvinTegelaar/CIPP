import { useRef, useState } from 'react'
import { Alert, LinearProgress, Typography } from '@mui/material'
import { Grid } from '@mui/system'
import CippFormComponent from './CippFormComponent'
import { CippFormCondition } from './CippFormCondition'
import { LinearProgressWithLabel } from '../linearProgressWithLabel'
import { ApiPostCall } from '../../api/ApiCall'
import {
  blobToBase64,
  msiInfoFromProperties,
  packageInstaller,
  readIntuneWinPackage,
  readMsiProperties,
  uploadIntuneWinPayload,
} from '../../utils/intunewin-package'

// Every value Graph accepts for minimumSupportedWindowsRelease (probed 2026-11; '2H20' is its spelling of 20H2).
const windowsReleases = [
  ['1607', 'Windows 10 1607'],
  ['1703', 'Windows 10 1703'],
  ['1709', 'Windows 10 1709'],
  ['1803', 'Windows 10 1803'],
  ['1809', 'Windows 10 1809'],
  ['1903', 'Windows 10 1903'],
  ['1909', 'Windows 10 1909'],
  ['2004', 'Windows 10 2004'],
  ['2H20', 'Windows 10 20H2'],
  ['21H1', 'Windows 10 21H1'],
  ['Windows10_21H2', 'Windows 10 21H2'],
  ['Windows10_22H2', 'Windows 10 22H2'],
  ['Windows11_21H2', 'Windows 11 21H2'],
  ['Windows11_22H2', 'Windows 11 22H2'],
  ['Windows11_23H2', 'Windows 11 23H2'],
  ['Windows11_24H2', 'Windows 11 24H2'],
].map(([value, label]) => ({ value, label }))

const defaultReturnCodes =
  '0=success, 1707=success, 3010=softReboot, 1641=hardReboot, 1618=retry'

const installCommandFor = (setupFile, msiInfo) => {
  if (msiInfo) return `msiexec /i "${setupFile}" /qn`
  if (/\.ps1$/i.test(setupFile))
    return `powershell.exe -ExecutionPolicy Bypass -File ".\\${setupFile}"`
  return `"${setupFile}"`
}

const uninstallCommandFor = (msiInfo) =>
  msiInfo ? `msiexec /x "${msiInfo.MsiProductCode}" /qn` : null

// The form values a package fills in, from its Detection.xml or installer metadata
const filledFrom = (metadata) => {
  const msi = metadata.MsiInfo?.MsiProductCode ? metadata.MsiInfo : null
  return {
    applicationName:
      metadata.Name?.replace(/\.(exe|msi|ps1|cmd|bat)$/i, '') ?? null,
    publisher: msi?.MsiPublisher ?? null,
    displayVersion: msi?.MsiProductVersion ?? null,
    installCommandLine: installCommandFor(metadata.SetupFile, msi),
    uninstallCommandLine: uninstallCommandFor(msi),
    msiProductCode: msi?.MsiProductCode ?? null,
  }
}

export const CippAppPackageFields = ({ formControl, onBusyChange }) => {
  const [upload, setUpload] = useState({
    progress: null,
    packaging: false,
    error: null,
  })
  const uploadCall = ApiPostCall({})
  const packageInfo = formControl.watch('packageInfo')
  // What the last file filled in, so a replacement file can tell untouched values from edited ones
  const lastFilled = useRef(null)

  const handlePackage = async (file) => {
    formControl.setValue('packageFile', null)
    if (!file) return
    setUpload({ progress: 0, packaging: false, error: null })
    onBusyChange?.(true)
    try {
      const isInstaller = /\.(exe|msi)$/i.test(file.name)
      const { metadata, payload } = isInstaller
        ? {
            metadata: {
              Name: file.name,
              SetupFile: file.name,
              MsiInfo: /\.msi$/i.test(file.name)
                ? msiInfoFromProperties(await readMsiProperties(file))
                : null,
            },
          }
        : await readIntuneWinPackage(file)
      const msi = metadata.MsiInfo?.MsiProductCode ? metadata.MsiInfo : null
      // Values still exactly as filled in from the previous file follow the new one; edited values are kept.
      const previous = formControl.getValues('packageInfo')
      const previousFilled =
        lastFilled.current ??
        previous?.filled ??
        (previous &&
          filledFrom({
            Name: previous.setupFile,
            SetupFile: previous.setupFile,
            MsiInfo: previous.msiProductCode
              ? { MsiProductCode: previous.msiProductCode }
              : null,
          }))
      const filled = filledFrom(metadata)
      for (const [name, value] of Object.entries(filled)) {
        const current = formControl.getValues(name)
        if (current && current !== previousFilled?.[name]) continue
        formControl.setValue(name, value ?? '', { shouldDirty: true })
      }
      lastFilled.current = filled
      if (msi) {
        formControl.setValue('detectionType', 'msi')
        if (msi.MsiExecutionContext === 'User')
          formControl.setValue('runAsAccount', 'user')
      } else if (
        formControl.getValues('detectionType') === 'msi' &&
        !formControl.getValues('msiProductCode')
      ) {
        formControl.setValue('detectionType', 'file')
      }
      const post = (url, data) => uploadCall.mutateAsync({ url, data })
      const onProgress = (progress) =>
        setUpload({ progress, packaging: false, error: null })
      const { packageId, blockCount, ...packaged } = isInstaller
        ? await packageInstaller({
            file,
            post,
            onProgress,
            onPackaging: () =>
              setUpload({ progress: null, packaging: true, error: null }),
          })
        : await uploadIntuneWinPayload({ payload, post, onProgress })
      formControl.setValue('packageId', packageId, { shouldDirty: true })
      formControl.setValue('packageUpload', {
        blockCount,
        metadata: isInstaller
          ? { ...packaged.metadata, MsiInfo: metadata.MsiInfo }
          : metadata,
      })
      formControl.setValue('packageInfo', {
        fileName: file.name,
        size: file.size,
        setupFile: metadata.SetupFile,
        toolVersion: metadata.ToolVersion,
        msiProductCode: msi?.MsiProductCode ?? null,
        filled,
      })
      setUpload({ progress: null, packaging: false, error: null })
    } catch (error) {
      const message =
        error?.response?.data?.Results ?? error?.message ?? 'Upload failed'
      setUpload({ progress: null, packaging: false, error: String(message) })
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
          label="Installer (.exe or .msi, packaged by CIPP) or a .intunewin package"
          name="packageFile"
          accept=".exe,.msi,.intunewin"
          onChange={handlePackage}
          formControl={formControl}
          disabled={upload.progress !== null || upload.packaging}
        />
      </Grid>
      {upload.progress !== null && (
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2">Uploading to CIPP</Typography>
          <LinearProgressWithLabel value={upload.progress} />
        </Grid>
      )}
      {upload.packaging && (
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2">
            Packaging the installer for Intune. You can fill in the details
            below meanwhile.
          </Typography>
          <LinearProgress />
        </Grid>
      )}
      {upload.error && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="error">{upload.error}</Alert>
        </Grid>
      )}
      {packageInfo && upload.progress === null && !upload.packaging && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="success">
            {packageInfo.fileName} ({(packageInfo.size / 1048576).toFixed(1)}{' '}
            MB), setup file {packageInfo.setupFile}
            {packageInfo.msiProductCode
              ? `, MSI ${packageInfo.msiProductCode}`
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
      <Grid size={{ md: 3, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Publisher"
          name="publisher"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 3, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Version"
          name="displayVersion"
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
      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Install command"
          name="installCommandLine"
          formControl={formControl}
          validators={{ required: 'Install command is required' }}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Uninstall command"
          name="uninstallCommandLine"
          formControl={formControl}
          validators={{ required: 'Uninstall command is required' }}
        />
      </Grid>

      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="radio"
          label="Install as"
          name="runAsAccount"
          options={[
            { label: 'System', value: 'system' },
            { label: 'User', value: 'user' },
          ]}
          defaultValue="system"
          formControl={formControl}
          row
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="number"
          label="Maximum install time (minutes)"
          name="maxRunTimeInMinutes"
          defaultValue={60}
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="radio"
          label="Restart behaviour"
          name="deviceRestartBehavior"
          options={[
            { label: 'Based on return code', value: 'basedOnReturnCode' },
            { label: 'Allow restart', value: 'allow' },
            { label: 'No restart', value: 'suppress' },
            { label: 'Force restart', value: 'force' },
          ]}
          defaultValue="basedOnReturnCode"
          formControl={formControl}
          row
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="autoComplete"
          label="Architectures (empty = x64 and x86)"
          name="architectures"
          options={[
            { label: 'x64', value: 'x64' },
            { label: 'x86', value: 'x86' },
            { label: 'ARM64', value: 'arm64' },
          ]}
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="autoComplete"
          label="Minimum Windows version (empty = Windows 10 1607)"
          name="minimumSupportedWindowsRelease"
          options={windowsReleases}
          multiple={false}
          formControl={formControl}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="radio"
          label="Detection rule"
          name="detectionType"
          options={[
            { label: 'MSI product code', value: 'msi' },
            { label: 'File or folder', value: 'file' },
            { label: 'Registry', value: 'registry' },
            { label: 'PowerShell script', value: 'script' },
          ]}
          defaultValue="file"
          formControl={formControl}
          row
        />
      </Grid>
      <CippFormCondition
        formControl={formControl}
        field="detectionType"
        compareType="is"
        compareValue="msi"
      >
        <Grid size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="MSI product code"
            name="msiProductCode"
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Version or later (optional)"
            name="msiProductVersion"
            formControl={formControl}
          />
        </Grid>
      </CippFormCondition>
      <CippFormCondition
        formControl={formControl}
        field="detectionType"
        compareType="is"
        compareValue="file"
      >
        <Grid size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Folder (e.g. %ProgramFiles%\Vendor\App)"
            name="detectionPath"
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ md: 3, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="File or folder name"
            name="detectionFile"
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ md: 3, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="File version or later (optional)"
            name="fileVersion"
            formControl={formControl}
          />
        </Grid>
      </CippFormCondition>
      <CippFormCondition
        formControl={formControl}
        field="detectionType"
        compareType="is"
        compareValue="registry"
      >
        <Grid size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Key (e.g. HKEY_LOCAL_MACHINE\SOFTWARE\Vendor\App)"
            name="registryKeyPath"
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ md: 3, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Value name"
            name="registryValueName"
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ md: 3, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Version or later (optional)"
            name="registryValue"
            formControl={formControl}
          />
        </Grid>
      </CippFormCondition>
      <CippFormCondition
        formControl={formControl}
        field="detectionType"
        compareType="isOneOf"
        compareValue={['file', 'registry']}
      >
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Check the 32-bit location on 64-bit Windows"
            name="check32BitOn64System"
            formControl={formControl}
          />
        </Grid>
      </CippFormCondition>
      <CippFormCondition
        formControl={formControl}
        field="detectionType"
        compareType="is"
        compareValue="script"
      >
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Detection script (detected when it exits 0 and writes output)"
            name="detectionScript"
            formControl={formControl}
            multiline
            rows={6}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Run script as 32-bit"
            name="runAs32Bit"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Enforce script signature check"
            name="enforceSignatureCheck"
            formControl={formControl}
          />
        </Grid>
      </CippFormCondition>

      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Return codes (code=success, softReboot, hardReboot or retry)"
          name="returnCodes"
          defaultValue={defaultReturnCodes}
          formControl={formControl}
        />
      </Grid>
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
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="switch"
          label="Allow uninstall from Company Portal"
          name="allowAvailableUninstall"
          defaultValue={true}
          formControl={formControl}
        />
        <CippFormComponent
          type="switch"
          label="Mark for Uninstallation"
          name="InstallationIntent"
          formControl={formControl}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="radio"
          label="When a tenant has an older version of this package"
          name="updateMode"
          options={[
            { label: 'Update the existing app', value: 'inPlace' },
            {
              label: 'Create a new app that supersedes it',
              value: 'supersede',
            },
          ]}
          defaultValue="inPlace"
          formControl={formControl}
          row
        />
      </Grid>
      <CippFormCondition
        formControl={formControl}
        field="updateMode"
        compareType="is"
        compareValue="supersede"
      >
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="radio"
            label="Supersedence"
            name="supersedenceType"
            options={[
              {
                label: 'Update (install over the old version)',
                value: 'update',
              },
              {
                label: 'Replace (uninstall the old version first)',
                value: 'replace',
              },
            ]}
            defaultValue="update"
            formControl={formControl}
            row
          />
        </Grid>
      </CippFormCondition>
    </>
  )
}
