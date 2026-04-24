import React, { useEffect, useCallback, useState } from 'react'
import {
  Button,
  Divider,
  Typography,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
} from '@mui/material'
import { Grid } from '@mui/system'
import { useForm, useWatch } from 'react-hook-form'
import { Add, Delete, Edit, Save } from '@mui/icons-material'
import { CippOffCanvas } from './CippOffCanvas'
import CippFormComponent from './CippFormComponent'
import { CippFormCondition } from './CippFormCondition'
import { CippApiResults } from './CippApiResults'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import languageList from '../../data/languageList.json'

const appTypeLabels = {
  mspApp: 'MSP Vendor App',
  StoreApp: 'Store App',
  chocolateyApp: 'Chocolatey App',
  officeApp: 'Microsoft Office',
  win32ScriptApp: 'Custom Application',
}

export const CippAppTemplateDrawer = ({
  buttonText = 'Create Template',
  editData = null,
  open = false,
  onClose,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [apps, setApps] = useState([])
  const [editGUID, setEditGUID] = useState(null)
  const formControl = useForm({ mode: 'onChange' })
  const templateFormControl = useForm({ mode: 'onChange' })

  const [fetchKey, setFetchKey] = useState(null)

  useEffect(() => {
    if (open && editData?.GUID) {
      setFetchKey(`AppTemplate-${editData.GUID}-${Date.now()}`)
    }
  }, [open, editData?.GUID])

  const templateFetch = ApiGetCall({
    url: editData?.GUID ? `/api/ListAppTemplates?ID=${editData.GUID}` : null,
    queryKey: fetchKey,
    waiting: !!(open && editData?.GUID && fetchKey),
  })

  useEffect(() => {
    if (open && editData && templateFetch.isSuccess && templateFetch.data) {
      const template = Array.isArray(templateFetch.data)
        ? templateFetch.data[0]
        : templateFetch.data
      if (!template) return

      setEditGUID(template.GUID || editData.GUID || null)
      templateFormControl.reset({
        templateName: template.displayName || editData.displayName || '',
        templateDescription: template.description || editData.description || '',
      })

      let appsArray = template.Apps || []
      if (typeof appsArray === 'string') {
        try {
          appsArray = JSON.parse(appsArray)
        } catch {
          appsArray = []
        }
      }
      if (!Array.isArray(appsArray)) {
        appsArray = []
      }
      const loadedApps = appsArray.map((app) => ({
        appType: app.appType,
        appName: app.appName,
        config: typeof app.config === 'string' ? app.config : JSON.stringify(app.config),
      }))
      setApps(loadedApps)
      setDrawerVisible(true)
    }
  }, [open, editData, templateFetch.isSuccess, templateFetch.data])

  const applicationType = useWatch({
    control: formControl.control,
    name: 'appType',
  })

  const searchQuerySelection = useWatch({
    control: formControl.control,
    name: 'packageSearch',
  })

  const updateSearchSelection = useCallback(
    (searchQuerySelection) => {
      if (searchQuerySelection) {
        formControl.setValue('packagename', searchQuerySelection.value.packagename)
        formControl.setValue('applicationName', searchQuerySelection.value.applicationName)
        formControl.setValue('description', searchQuerySelection.value.description)
        if (searchQuerySelection.value.customRepo) {
          formControl.setValue('customRepo', searchQuerySelection.value.customRepo)
        }
      }
    },
    [formControl.setValue]
  )

  useEffect(() => {
    updateSearchSelection(searchQuerySelection)
  }, [updateSearchSelection, searchQuerySelection])

  const ChocosearchResults = ApiPostCall({ urlFromData: true })
  const winGetSearchResults = ApiPostCall({ urlFromData: true })

  const saveTemplate = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ['ListAppTemplates'],
  })

  const searchApp = (searchText, type) => {
    if (type === 'choco') {
      ChocosearchResults.mutate({
        url: '/api/ListAppsRepository',
        data: { search: searchText },
        queryKey: `SearchApp-${searchText}-${type}`,
      })
    }
    if (type === 'StoreApp') {
      winGetSearchResults.mutate({
        url: '/api/ListPotentialApps',
        data: { searchString: searchText, type: 'WinGet' },
        queryKey: `SearchApp-${searchText}-${type}`,
      })
    }
  }

  const getAppName = (formData) => {
    const type = formData.appType?.value
    if (type === 'mspApp') return formData.displayName || formData.rmmname?.label || 'MSP App'
    if (type === 'officeApp') return 'Microsoft 365 Apps'
    return formData.applicationName || formData.packagename || 'Unnamed App'
  }

  const handleAddApp = () => {
    const formData = formControl.getValues()
    if (!formData.appType?.value) return

    const appEntry = {
      appType: formData.appType.value,
      appName: getAppName(formData),
      config: JSON.stringify(formData),
    }

    setApps((prev) => [...prev, appEntry])
    formControl.reset({ appType: null })
  }

  const handleEditApp = (index) => {
    const currentForm = formControl.getValues()
    const appToEdit = apps[index]

    setApps((prev) => {
      const updated = [...prev]
      if (currentForm.appType?.value) {
        updated.push({
          appType: currentForm.appType.value,
          appName: getAppName(currentForm),
          config: JSON.stringify(currentForm),
        })
      }
      return updated.filter((_, i) => i !== index)
    })

    const config = JSON.parse(appToEdit.config)
    if (!config.appType || typeof config.appType === 'string') {
      const typeValue = appToEdit.appType || config.appType
      config.appType = {
        label: appTypeLabels[typeValue] || typeValue,
        value: typeValue,
      }
    }
    // Normalize "Save as Template" configs (IntuneBody format) to form fields
    if (config.IntuneBody && !config.applicationName) {
      const body = config.IntuneBody
      config.applicationName = config.ApplicationName || body.displayName || ''
      config.description = body.description || ''
      config.AssignTo = config.assignTo || 'On'
      // WinGet/Store: packageIdentifier
      if (body.packageIdentifier) {
        config.packagename = body.packageIdentifier
      }
      // Chocolatey: extract package name from detection rules or install command
      if (!config.packagename && body.detectionRules?.[0]?.fileOrFolderName) {
        config.packagename = body.detectionRules[0].fileOrFolderName
      }
      if (!config.packagename && body.installCommandLine) {
        const match = body.installCommandLine.match(/-Packagename\s+(\S+)/i)
        if (match) config.packagename = match[1]
      }
      // Chocolatey: custom repo
      if (body.installCommandLine) {
        const repoMatch = body.installCommandLine.match(/-CustomRepo\s+(\S+)/i)
        if (repoMatch) config.customRepo = repoMatch[1]
      }
    }
    formControl.reset({ appType: config.appType })
    setTimeout(() => {
      Object.entries(config).forEach(([key, value]) => {
        if (key !== 'appType') {
          formControl.setValue(key, value)
        }
      })
    }, 100)
  }

  const handleRemoveApp = (index) => {
    setApps((prev) => prev.filter((_, i) => i !== index))
  }

  const getTotalApps = () => {
    const currentForm = formControl.getValues()
    const formHasApp = !!currentForm.appType?.value
    return apps.length + (formHasApp ? 1 : 0)
  }

  const handleSaveTemplate = () => {
    const templateData = templateFormControl.getValues()
    const currentForm = formControl.getValues()

    const allApps = [...apps]
    if (currentForm.appType?.value) {
      allApps.push({
        appType: currentForm.appType.value,
        appName: getAppName(currentForm),
        config: JSON.stringify(currentForm),
      })
    }

    if (!templateData.templateName || allApps.length === 0) return

    const payload = {
      displayName: templateData.templateName,
      description: templateData.templateDescription || '',
      apps: allApps,
    }
    if (editGUID) {
      payload.GUID = editGUID
    }
    saveTemplate.mutate({
      url: '/api/AddAppTemplate',
      data: payload,
    })
  }

  const handleClose = () => {
    setDrawerVisible(false)
    formControl.reset({ appType: null })
    templateFormControl.reset({ templateName: '', templateDescription: '' })
    setApps([])
    setEditGUID(null)
    saveTemplate.reset()
    if (onClose) onClose()
  }

  return (
    <>
      {!onClose && (
        <Button onClick={() => setDrawerVisible(true)} startIcon={<Add />}>
          {buttonText}
        </Button>
      )}
      <CippOffCanvas
        title={editGUID ? 'Edit Application Template' : 'Create Application Template'}
        visible={drawerVisible}
        onClose={handleClose}
        size="xl"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveTemplate}
              disabled={getTotalApps() === 0 || saveTemplate.isPending}
              startIcon={<Save />}
            >
              {saveTemplate.isPending
                ? 'Saving...'
                : saveTemplate.isSuccess
                  ? editGUID
                    ? 'Saved'
                    : 'Save Another'
                  : `${editGUID ? 'Update' : 'Save'} Template (${getTotalApps()} app${getTotalApps() !== 1 ? 's' : ''})`}
            </Button>
            <Button variant="outlined" onClick={handleClose}>
              Close
            </Button>
          </div>
        }
      >
        <Grid container spacing={2}>
          {/* Template Info */}
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Template Name"
              name="templateName"
              formControl={templateFormControl}
              validators={{ required: 'Template name is required' }}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Description"
              name="templateDescription"
              formControl={templateFormControl}
            />
          </Grid>

          {/* Added Apps List */}
          {apps.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Apps in this template:
              </Typography>
              <List dense>
                {apps.map((app, index) => (
                  <ListItem key={index} divider>
                    <Chip
                      label={appTypeLabels[app.appType] || app.appType}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <ListItemText primary={app.appName} />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => handleEditApp(index)} size="small">
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleRemoveApp(index)} size="small">
                        <Delete fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Add Application
            </Typography>
          </Grid>

          {/* App Type Selector */}
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="Select Application Type"
              name="appType"
              options={[
                { label: 'MSP Vendor App', value: 'mspApp' },
                { label: 'Store App', value: 'StoreApp' },
                { label: 'Chocolatey App', value: 'chocolateyApp' },
                { label: 'Microsoft Office', value: 'officeApp' },
                { label: 'Custom Application', value: 'win32ScriptApp' },
              ]}
              multiple={false}
              formControl={formControl}
            />
          </Grid>

          {/* MSP App Fields */}
          <CippFormCondition
            formControl={formControl}
            field="appType.value"
            compareType="is"
            compareValue="mspApp"
          >
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                label="Select MSP Tool"
                name="rmmname"
                options={[
                  { value: 'datto', label: 'Datto RMM' },
                  { value: 'syncro', label: 'Syncro RMM' },
                  { value: 'huntress', label: 'Huntress' },
                  { value: 'automate', label: 'CW Automate' },
                  { value: 'cwcommand', label: 'CW Command' },
                ]}
                formControl={formControl}
                multiple={false}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Display Name"
                name="displayName"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Alert severity="info">
                MSP App templates save the app type and name. Tenant-specific parameters (keys,
                URLs) must be provided during deployment.
              </Alert>
            </Grid>
          </CippFormCondition>

          {/* Store/WinGet App Fields */}
          <CippFormCondition
            formControl={formControl}
            field="appType.value"
            compareType="is"
            compareValue="StoreApp"
          >
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Search Packages"
                name="searchQuery"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ xs: 5 }}>
              <Button
                onClick={() => searchApp(formControl.getValues('searchQuery'), 'StoreApp')}
                disabled={winGetSearchResults.isPending}
              >
                Search
              </Button>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                label="Select Package"
                name="packageSearch"
                options={
                  winGetSearchResults.data?.data
                    ? winGetSearchResults.data.data.map((item) => ({
                        value: item,
                        label: `${item.applicationName} - ${item.packagename}`,
                      }))
                    : []
                }
                multiple={false}
                formControl={formControl}
                isFetching={winGetSearchResults.isPending}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="WinGet Package Identifier"
                name="packagename"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Application Name"
                name="applicationName"
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
                type="switch"
                label="Mark for Uninstallation"
                name="InstallationIntent"
                formControl={formControl}
              />
            </Grid>
          </CippFormCondition>

          {/* Chocolatey App Fields */}
          <CippFormCondition
            formControl={formControl}
            field="appType.value"
            compareType="is"
            compareValue="chocolateyApp"
          >
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Search Packages"
                name="searchQuery"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ xs: 5 }}>
              <Button
                onClick={() => searchApp(formControl.getValues('searchQuery'), 'choco')}
                disabled={ChocosearchResults.isPending}
              >
                Search
              </Button>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                label="Select Package"
                name="packageSearch"
                options={
                  ChocosearchResults.isSuccess && ChocosearchResults.data?.data
                    ? ChocosearchResults.data.data.Results?.map((item) => ({
                        value: item,
                        label: `${item.applicationName} - ${item.packagename}`,
                      }))
                    : []
                }
                multiple={false}
                formControl={formControl}
                isFetching={ChocosearchResults.isPending}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Chocolatey Package Name"
                name="packagename"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Application Name"
                name="applicationName"
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
                label="Custom Repository URL"
                name="customRepo"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Custom Chocolatey Arguments"
                name="customArguments"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Install as system"
                name="InstallAsSystem"
                formControl={formControl}
                defaultValue={true}
              />
              <CippFormComponent
                type="switch"
                label="Disable Restart"
                name="DisableRestart"
                formControl={formControl}
                defaultValue={true}
              />
              <CippFormComponent
                type="switch"
                label="Mark for Uninstallation"
                name="InstallationIntent"
                formControl={formControl}
              />
            </Grid>
          </CippFormCondition>

          {/* Office App Fields */}
          <CippFormCondition
            formControl={formControl}
            field="appType.value"
            compareType="is"
            compareValue="officeApp"
          >
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                label="Excluded Apps"
                name="excludedApps"
                options={[
                  { value: 'access', label: 'Access' },
                  { value: 'excel', label: 'Excel' },
                  { value: 'oneNote', label: 'OneNote' },
                  { value: 'outlook', label: 'Outlook' },
                  { value: 'powerPoint', label: 'PowerPoint' },
                  { value: 'publisher', label: 'Publisher' },
                  { value: 'teams', label: 'Teams' },
                  { value: 'word', label: 'Word' },
                  { value: 'lync', label: 'Skype For Business' },
                  { value: 'bing', label: 'Bing' },
                ]}
                multiple={true}
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                label="Update Channel"
                name="updateChannel"
                options={[
                  { value: 'current', label: 'Current Channel' },
                  { value: 'firstReleaseCurrent', label: 'Current (Preview)' },
                  { value: 'monthlyEnterprise', label: 'Monthly Enterprise' },
                  { value: 'deferred', label: 'Semi-Annual Enterprise' },
                  { value: 'firstReleaseDeferred', label: 'Semi-Annual Enterprise (Preview)' },
                ]}
                multiple={false}
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                label="Languages"
                name="languages"
                options={languageList.map(({ language, tag }) => ({
                  value: tag,
                  label: `${language} (${tag})`,
                }))}
                multiple={true}
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Use Shared Computer Activation"
                name="SharedComputerActivation"
                formControl={formControl}
              />
              <CippFormComponent
                type="switch"
                label="64 Bit (Recommended)"
                name="arch"
                formControl={formControl}
                defaultValue={true}
              />
              <CippFormComponent
                type="switch"
                label="Remove other versions"
                name="RemoveVersions"
                formControl={formControl}
                defaultValue={true}
              />
              <CippFormComponent
                type="switch"
                label="Accept License"
                name="AcceptLicense"
                formControl={formControl}
                defaultValue={true}
              />
              <CippFormComponent
                type="switch"
                label="Use Custom XML Configuration"
                name="useCustomXml"
                formControl={formControl}
              />
            </Grid>
            <CippFormCondition
              formControl={formControl}
              field="useCustomXml"
              compareType="is"
              compareValue={true}
            >
              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  label="Custom Office Configuration XML"
                  name="customXml"
                  formControl={formControl}
                  multiline
                  rows={10}
                  validators={{ required: 'Please provide custom XML configuration' }}
                />
                <Alert severity="info" sx={{ mt: 1 }}>
                  Provide a custom Office Configuration XML. When using custom XML, all other Office
                  configuration options above will be ignored. See{' '}
                  <a href="https://config.office.com/" target="_blank" rel="noopener noreferrer">
                    Office Customization Tool
                  </a>{' '}
                  to generate XML.
                </Alert>
              </Grid>
            </CippFormCondition>
          </CippFormCondition>

          {/* Win32 Script App Fields */}
          <CippFormCondition
            formControl={formControl}
            field="appType.value"
            compareType="is"
            compareValue="win32ScriptApp"
          >
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Application Name"
                name="applicationName"
                formControl={formControl}
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
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Install Script (PowerShell)"
                name="installScript"
                formControl={formControl}
                multiline
                rows={8}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Uninstall Script (PowerShell, Optional)"
                name="uninstallScript"
                formControl={formControl}
                multiline
                rows={6}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Use Detection Script instead of file/path detection"
                name="useDetectionScript"
                formControl={formControl}
              />
            </Grid>
            <CippFormCondition
              formControl={formControl}
              field="useDetectionScript"
              compareType="is"
              compareValue={true}
            >
              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  label="Detection Script (PowerShell — exit 0 with STDOUT = detected)"
                  name="detectionScript"
                  formControl={formControl}
                  multiline
                  rows={6}
                  validators={{
                    required: 'Detection script is required when using script detection',
                  }}
                />
              </Grid>
            </CippFormCondition>
            <CippFormCondition
              formControl={formControl}
              field="useDetectionScript"
              compareType="is"
              compareValue={false}
            >
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  label="Detection Path (e.g., C:\Program Files\MyApp or %ProgramData%\MyApp)"
                  name="detectionPath"
                  formControl={formControl}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  label="Detection File/Folder Name (Optional, e.g., app.exe)"
                  name="detectionFile"
                  formControl={formControl}
                />
              </Grid>
            </CippFormCondition>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Install as System"
                name="InstallAsSystem"
                formControl={formControl}
                defaultValue={true}
              />
              <CippFormComponent
                type="switch"
                label="Disable Restart"
                name="DisableRestart"
                formControl={formControl}
                defaultValue={true}
              />
              <CippFormComponent
                type="switch"
                label="Run as 32-bit"
                name="runAs32Bit"
                formControl={formControl}
              />
              <CippFormComponent
                type="switch"
                label="Enforce signature check"
                name="enforceSignatureCheck"
                formControl={formControl}
              />
              <CippFormComponent
                type="switch"
                label="Mark for Uninstallation"
                name="InstallationIntent"
                formControl={formControl}
              />
            </Grid>
          </CippFormCondition>

          {/* Assignment (shared across all types) */}
          {applicationType?.value && (
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="radio"
                name="AssignTo"
                label="Assignment"
                options={[
                  { label: 'Do not assign', value: 'On' },
                  { label: 'Assign to all users', value: 'allLicensedUsers' },
                  { label: 'Assign to all devices', value: 'AllDevices' },
                  { label: 'Assign to all users and devices', value: 'AllDevicesAndUsers' },
                  { label: 'Assign to Custom Group', value: 'customGroup' },
                ]}
                formControl={formControl}
                row
              />
            </Grid>
          )}
          <CippFormCondition
            formControl={formControl}
            field="AssignTo"
            compareType="is"
            compareValue="customGroup"
          >
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Custom Group Names separated by comma. Wildcards (*) are allowed"
                name="customGroup"
                formControl={formControl}
              />
            </Grid>
          </CippFormCondition>

          {/* Add App Button */}
          {applicationType?.value && (
            <Grid size={{ xs: 12 }}>
              <Button variant="outlined" onClick={handleAddApp} startIcon={<Add />}>
                Add App to Template
              </Button>
            </Grid>
          )}

          <CippApiResults apiObject={saveTemplate} />
        </Grid>
      </CippOffCanvas>
    </>
  )
}
