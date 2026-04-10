import { Layout as DashboardLayout } from '../../../layouts/index.js'
import { Controller, useForm } from 'react-hook-form'
import { ApiGetCall, ApiPostCall } from '../../../api/ApiCall'
import { useRouter } from 'next/router'
import {
  Alert,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Divider,
} from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Stack, Grid } from '@mui/system'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  ExpandMore,
  CheckCircleOutline,
  ErrorOutline,
  NotificationsActive,
  Code,
  TableChart,
} from '@mui/icons-material'
import cacheTypes from '../../../data/CIPPDBCacheTypes.json'
import { renderCustomScriptMarkdownTemplate } from '../../../utils/customScriptTemplate'
import { useSettings } from '../../../hooks/use-settings'
import CippFormPage from '../../../components/CippFormPages/CippFormPage'
import CippFormComponent from '../../../components/CippComponents/CippFormComponent'
import { CippApiResults } from '../../../components/CippComponents/CippApiResults'
import { CippCodeBlock } from '../../../components/CippComponents/CippCodeBlock'

const Page = () => {
  const getValueType = (value) => {
    if (value === null) {
      return 'null'
    }
    if (Array.isArray(value)) {
      return 'array'
    }
    return typeof value === 'object' ? 'object' : typeof value
  }

  const buildResultSchema = (result) => {
    const entriesMap = new Map()

    const addEntry = (path, type) => {
      const key = `${path}:${type}`
      if (!entriesMap.has(key)) {
        entriesMap.set(key, { path, type })
      }
    }

    const walk = (value, path) => {
      const valueType = getValueType(value)
      addEntry(path, valueType)

      if (valueType === 'array') {
        if (value.length > 0) {
          walk(value[0], `${path}[0]`)
        }
        return
      }

      if (valueType === 'object') {
        Object.entries(value).forEach(([key, childValue]) => {
          walk(childValue, `${path}.${key}`)
        })
      }
    }

    walk(result, 'Result')

    return {
      generatedAt: new Date().toISOString(),
      entries: Array.from(entriesMap.values()),
    }
  }

  const settings = useSettings()
  const router = useRouter()
  const { ScriptGuid } = router.query
  const isEdit = !!ScriptGuid
  const [cacheTypesDialogOpen, setCacheTypesDialogOpen] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [guidanceExpanded, setGuidanceExpanded] = useState(true)
  const [configExpanded, setConfigExpanded] = useState(true)
  const [scriptContentExpanded, setScriptContentExpanded] = useState(true)
  const [testerExpanded, setTesterExpanded] = useState(true)
  const markdownEditorRef = useRef(null)

  const toSelectOption = (value, fallback) =>
    value
      ? { value, label: value }
      : {
          value: fallback,
          label: fallback,
        }

  const formControl = useForm({
    mode: 'onChange',
    defaultValues: {
      ScriptName: '',
      ScriptContent: '',
      Enabled: false,
      AlertOnFailure: false,
      ReturnType: 'JSON',
      MarkdownTemplate: '',
      Description: '',
      Category: { value: 'General', label: 'General' },
      Pillar: { value: 'Identity', label: 'Identity' },
      Risk: { value: 'Low', label: 'Low' },
      UserImpact: { value: 'Low', label: 'Low' },
      ImplementationEffort: { value: 'Low', label: 'Low' },
      TestParameters: '',
      ResultSchema: '',
    },
  })

  const existingScript = ApiGetCall({
    url: `/api/ListCustomScripts?ScriptGuid=${ScriptGuid}`,
    queryKey: `CustomScript-${ScriptGuid}`,
    waiting: isEdit,
  })
  const isScriptLoading = isEdit && (existingScript.isLoading || existingScript.isFetching)

  useEffect(() => {
    if (isEdit && existingScript.isSuccess && existingScript?.data && existingScript.data[0]) {
      const script = existingScript.data[0]
      formControl.reset({
        ScriptName: script.ScriptName || '',
        ScriptContent: script.ScriptContent || '',
        Enabled: script.Enabled || false,
        AlertOnFailure: script.AlertOnFailure || false,
        ReturnType: script.ReturnType || 'JSON',
        MarkdownTemplate: script.MarkdownTemplate || '',
        ResultSchema: script.ResultSchema || '',
        Category: toSelectOption(script.Category, 'General'),
        Pillar: toSelectOption(script.Pillar, 'Identity'),
        Description: script.Description || '',
        Risk: toSelectOption(script.Risk, 'Low'),
        UserImpact: toSelectOption(script.UserImpact, 'Low'),
        ImplementationEffort: toSelectOption(script.ImplementationEffort, 'Low'),
        ScriptGuid: script.ScriptGuid,
      })
    }
  }, [existingScript.data, isEdit, existingScript.isSuccess, formControl])

  useEffect(() => {
    setGuidanceExpanded(!isEdit)
    setConfigExpanded(!isEdit)
    setScriptContentExpanded(true)
    setTesterExpanded(true)
  }, [isEdit])

  const testScriptApi = ApiPostCall({
    urlFromData: true,
    onResult: (result) => {
      setTestResults(result)
      if (result?.Results !== undefined) {
        const generatedSchema = buildResultSchema(result.Results)
        formControl.setValue('ResultSchema', JSON.stringify(generatedSchema, null, 2), {
          shouldDirty: true,
        })
      }
    },
  })

  const handleRunTest = () => {
    if (!isEdit || !ScriptGuid) {
      return
    }

    let parsedParams = {}
    const rawParams = formControl.getValues('TestParameters')

    if (rawParams) {
      try {
        parsedParams = JSON.parse(rawParams)
      } catch (error) {
        const sanitizedError = String(error.message || 'Unknown error').replace(/[<>]/g, '')
        formControl.setError('TestParameters', {
          type: 'manual',
          message: `Parameters must be valid JSON: ${sanitizedError}`,
        })
        return
      }
    }

    const payload = {
      ScriptGuid,
      TenantFilter: router.query.tenantFilter || settings?.currentTenant,
      Parameters: parsedParams,
    }

    testScriptApi.mutate({
      url: '/api/ExecCustomScript',
      data: payload,
    })
  }

  const handleSubmitResult = (result) => {
    if (!isEdit && result?.ScriptGuid) {
      router.replace(
        { pathname: router.pathname, query: { ...router.query, ScriptGuid: result.ScriptGuid } },
        undefined,
        { shallow: false }
      )
    }
  }

  const customDataformatter = (data) => {
    const payload = {
      ScriptName: data.ScriptName,
      ScriptContent: data.ScriptContent,
      Enabled: data.Enabled,
      AlertOnFailure: data.AlertOnFailure,
      ReturnType: data.ReturnType,
      MarkdownTemplate: data.MarkdownTemplate,
      ResultSchema: data.ResultSchema,
      Description: data.Description,
      Category: data.Category?.value ?? data.Category,
      Pillar: data.Pillar?.value ?? data.Pillar,
      Risk: data.Risk?.value ?? data.Risk,
      UserImpact: data.UserImpact?.value ?? data.UserImpact,
      ImplementationEffort: data.ImplementationEffort?.value ?? data.ImplementationEffort,
    }

    if (isEdit) {
      payload.ScriptGuid = ScriptGuid
    }

    return payload
  }

  const categoryOptions = [
    { value: 'License Management', label: 'License Management' },
    { value: 'Security', label: 'Security' },
    { value: 'Compliance', label: 'Compliance' },
    { value: 'User Management', label: 'User Management' },
    { value: 'Group Management', label: 'Group Management' },
    { value: 'Device Management', label: 'Device Management' },
    { value: 'Guest Management', label: 'Guest Management' },
    { value: 'General', label: 'General' },
  ]

  const riskOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' },
  ]

  const pillarOptions = [
    { value: 'Identity', label: 'Identity' },
    { value: 'Devices', label: 'Devices' },
    { value: 'Data', label: 'Data' },
  ]

  const impactAndEffortOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
  ]

  const returnTypeOptions = [
    { value: 'JSON', label: 'JSON' },
    { value: 'Markdown', label: 'Markdown' },
  ]

  const scriptNameField = {
    name: 'ScriptName',
    label: 'Script Name',
    type: 'textField',
    required: true,
    placeholder: 'Enter a descriptive name for your script',
    disableVariables: true,
  }

  const descriptionField = {
    name: 'Description',
    label: 'Description',
    type: 'textField',
    required: true,
    multiline: true,
    rows: 2,
    placeholder: 'Describe what this script checks or monitors',
    disableVariables: true,
  }

  const categoryField = {
    name: 'Category',
    label: 'Category',
    type: 'autoComplete',
    required: true,
    placeholder: 'Select or enter a category',
    options: categoryOptions,
    creatable: true,
  }

  const riskField = {
    name: 'Risk',
    label: 'Risk Level',
    type: 'select',
    required: true,
    placeholder: 'Select the risk level for alerts from this script',
    options: riskOptions,
    creatable: false,
  }

  const pillarField = {
    name: 'Pillar',
    label: 'Pillar',
    type: 'select',
    required: true,
    placeholder: 'Select a pillar',
    options: pillarOptions,
    creatable: false,
  }

  const userImpactField = {
    name: 'UserImpact',
    label: 'User Impact',
    type: 'select',
    required: true,
    placeholder: 'Select user impact',
    options: impactAndEffortOptions,
    creatable: false,
  }

  const implementationEffortField = {
    name: 'ImplementationEffort',
    label: 'Implementation Effort',
    type: 'select',
    required: true,
    placeholder: 'Select implementation effort',
    options: impactAndEffortOptions,
    creatable: false,
  }

  const enabledField = {
    name: 'Enabled',
    label: 'Enable Script',
    type: 'switch',
    defaultValue: false,
  }

  const alertOnFailureField = {
    name: 'AlertOnFailure',
    label: 'Notify on Alert',
    type: 'switch',
    defaultValue: false,
    helperText:
      'When enabled, a failed test triggers an alert routed to your configured notification channels (email, webhook, or PSA).',
  }

  const returnTypeField = {
    name: 'ReturnType',
    label: 'Result Display Type',
    type: 'select',
    required: true,
    placeholder: 'Select how test results are rendered',
    options: returnTypeOptions,
    creatable: false,
    helperText: 'Choose how failed test results are rendered in CIPP test details.',
  }

  const markdownTemplateField = {
    name: 'MarkdownTemplate',
    label: 'Markdown Result Template',
    type: 'textField',
    required: false,
    multiline: true,
    rows: 8,
    disableVariables: false,
    autocompleteTrigger: '{{',
    placeholder: `### Custom Tests Finding

The script returned the following data:

{{ResultJson}}

Affected users: {{count(Result)}}

First user: {{Result[0].DisplayName ?? "Unknown"}}

All UPNs: {{join(Result[*].UserPrincipalName, ", ")}}`,
    helperText:
      'Supports {{ResultJson}}, {{Result.Path}}, {{Result.Path ?? "fallback"}}, {{join(Result[*].Path, ", ")}}, {{count(Result)}}, and {{table(Result[*], "displayName", "mail")}}.',
  }

  const scriptContentField = {
    name: 'ScriptContent',
    label: 'PowerShell Script',
    type: 'textField',
    required: true,
    multiline: true,
    rows: 22,
    placeholder: `# Example: Find disabled users with licenses
param($TenantFilter, $DaysThreshold = 30)

$users = New-CIPPDbRequest -TenantFilter $TenantFilter -Type 'Users'
$results = $users | Where-Object {
    $_.assignedLicenses.Count -gt 0 -and
    $_.accountEnabled -eq $false
} | ForEach-Object {
    [PSCustomObject]@{
        UserPrincipalName = $_.userPrincipalName
        DisplayName = $_.displayName
        Message = "User has license but is disabled"
    }
}

# Return is optional; pipeline output is also captured.
return $results`,
    disableVariables: true,
  }

  const selectedReturnType = formControl.watch('ReturnType')
  const markdownTemplateValue = formControl.watch('MarkdownTemplate')
  const resultSchemaValue = formControl.watch('ResultSchema')

  const markdownAutocompleteOptions = useMemo(() => {
    const suggestionsMap = new Map()

    const addSuggestion = (token, tokenType) => {
      if (!suggestionsMap.has(token)) {
        suggestionsMap.set(token, {
          token,
          tokenType,
        })
      }
    }

    addSuggestion('{{ResultJson}}', 'json')
    addSuggestion('{{Result}}', 'root')
    addSuggestion('{{count(Result)}}', 'number')

    if (resultSchemaValue) {
      try {
        const parsedResultSchema = JSON.parse(resultSchemaValue)
        const schemaEntries = Array.isArray(parsedResultSchema?.entries)
          ? parsedResultSchema.entries
          : []

        schemaEntries.forEach((entry) => {
          addSuggestion(`{{${entry.path}}}`, entry.type)
          if (entry.type === 'array') {
            addSuggestion(`{{count(${entry.path})}}`, 'number')
          }
          if (entry.path.includes('[0]')) {
            const wildcardPath = entry.path.replaceAll('[0]', '[*]')
            addSuggestion(`{{join(${wildcardPath}, ", ")}}`, 'string')
          }
        })
      } catch {}
    }

    return Array.from(suggestionsMap.values())
  }, [resultSchemaValue])

  const handleMarkdownEditorMount = (_editor, monaco) => {
    markdownEditorRef.current = _editor

    const provider = monaco.languages.registerCompletionItemProvider('markdown', {
      triggerCharacters: ['{'],
      provideCompletionItems: (model, position) => {
        const linePrefix = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        })

        const triggerIndex = linePrefix.lastIndexOf('{{')
        if (triggerIndex === -1) {
          return { suggestions: [] }
        }

        const range = {
          startLineNumber: position.lineNumber,
          startColumn: triggerIndex + 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        }

        const suggestions = markdownAutocompleteOptions.map((item) => ({
          label: item.token,
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: item.token,
          detail: item.tokenType ? `Type: ${item.tokenType}` : 'Token',
          range,
        }))

        return { suggestions }
      },
    })

    const contentListener = _editor.onDidChangeModelContent(() => {
      const model = _editor.getModel()
      const position = _editor.getPosition()

      if (!model || !position) {
        return
      }

      const linePrefix = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      })

      if (linePrefix.endsWith('{{')) {
        _editor.trigger('cipp-markdown', 'editor.action.triggerSuggest', {})
      }
    })

    _editor.onDidDispose(() => {
      provider.dispose()
      contentListener.dispose()
      if (markdownEditorRef.current === _editor) {
        markdownEditorRef.current = null
      }
    })
  }

  return (
    <CippFormPage
      formControl={formControl}
      queryKey={['Custom Tests', 'CustomScript*']}
      title="Custom Test"
      backButtonTitle="Custom Tests"
      formPageType={isEdit ? 'Edit' : 'Add'}
      postUrl="/api/AddCustomScript"
      customDataformatter={customDataformatter}
      onSubmitResult={handleSubmitResult}
    >
      <Accordion
        sx={{ mb: 2 }}
        expanded={guidanceExpanded}
        onChange={(_, expanded) => setGuidanceExpanded(expanded)}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2">Test Guidance</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box
            sx={{
              '& code': {
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                px: 0.5,
                py: 0.25,
                borderRadius: 0.5,
                bgcolor: 'action.hover',
              },
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Custom tests run PowerShell against each tenant. The script output determines pass or
              fail.
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'success.main',
                    borderLeftWidth: 3,
                    height: '100%',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                    <CheckCircleOutline fontSize="small" color="success" />
                    <Typography variant="subtitle2">Pass</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Return <code>$null</code>, <code>$false</code>, an empty string, or{' '}
                    <code>@()</code>
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'error.main',
                    borderLeftWidth: 3,
                    height: '100%',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                    <ErrorOutline fontSize="small" color="error" />
                    <Typography variant="subtitle2">Fail</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Return any non-empty value — object, array, string, or <code>$true</code>. The
                    returned data becomes the test output.
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 2.5 }} />

            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{ p: 2, borderRadius: 1, border: 1, borderColor: 'divider', height: '100%' }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                    <NotificationsActive fontSize="small" color="warning" />
                    <Typography variant="subtitle2">Alerts</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Enable "Notify on Alert" to create alerts on failure. Deduplicated per tenant
                    per day, then routed to email, webhook, or PSA via Alert Configuration.
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{ p: 2, borderRadius: 1, border: 1, borderColor: 'divider', height: '100%' }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                    <Code fontSize="small" color="info" />
                    <Typography variant="subtitle2">Scripting Rules</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    PowerShell AST allowlist — only approved cmdlets (ForEach-Object, Where-Object,
                    Select-Object, etc.). The <code>+=</code> operator is blocked.{' '}
                    <code>$TenantFilter</code> is available automatically.
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{ p: 2, borderRadius: 1, border: 1, borderColor: 'divider', height: '100%' }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                    <TableChart fontSize="small" color="info" />
                    <Typography variant="subtitle2">Data Access</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Read-only via <code>New-CIPPDbRequest</code> and <code>Get-CIPPDbItem</code>{' '}
                    with a <code>-Type</code> parameter.
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setCacheTypesDialogOpen(true)}
                  >
                    View Cached Types ({cacheTypes.length})
                  </Button>
                </Box>
              </Grid>
            </Grid>

            <Typography variant="caption" color="text.secondary">
              Manual testing on this page is preview-only. Results are persisted only during
              scheduled tenant test runs with the script enabled.
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Dialog
        open={cacheTypesDialogOpen}
        onClose={() => setCacheTypesDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cached Types</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            {cacheTypes.map((cacheType) => (
              <Box key={cacheType.type}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {cacheType.friendlyName} ({cacheType.type})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {cacheType.description}
                </Typography>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCacheTypesDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Accordion expanded={configExpanded} onChange={(_, expanded) => setConfigExpanded(expanded)}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2">Configuration Options</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                formControl={formControl}
                {...scriptNameField}
                disabled={isScriptLoading}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                formControl={formControl}
                {...categoryField}
                disabled={isScriptLoading}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                formControl={formControl}
                {...descriptionField}
                disabled={isScriptLoading}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                formControl={formControl}
                {...riskField}
                disabled={isScriptLoading}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                formControl={formControl}
                {...pillarField}
                disabled={isScriptLoading}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                formControl={formControl}
                {...userImpactField}
                disabled={isScriptLoading}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                formControl={formControl}
                {...implementationEffortField}
                disabled={isScriptLoading}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                formControl={formControl}
                {...returnTypeField}
                disabled={isScriptLoading}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CippFormComponent
                formControl={formControl}
                {...enabledField}
                disabled={isScriptLoading}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CippFormComponent
                formControl={formControl}
                {...alertOnFailureField}
                disabled={isScriptLoading}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion
        sx={{ mt: 2 }}
        expanded={scriptContentExpanded}
        onChange={(_, expanded) => setScriptContentExpanded(expanded)}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2">Markdown / PowerShell</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={3}>
            {selectedReturnType === 'Markdown' && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {markdownTemplateField.label}
                </Typography>
                <Controller
                  name="MarkdownTemplate"
                  control={formControl.control}
                  render={({ field }) => (
                    <>
                      <CippCodeBlock
                        key={`markdown-editor-${resultSchemaValue || 'base'}`}
                        code={field.value || ''}
                        language="markdown"
                        type="editor"
                        showLineNumbers={true}
                        editorHeight="320px"
                        readOnly={isScriptLoading}
                        onMount={handleMarkdownEditorMount}
                        onChange={(value) => field.onChange(value || '')}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: 'block' }}
                      >
                        {markdownTemplateField.helperText}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: 'block' }}
                      >
                        Type <code>{'{{'}</code> to use schema tokens.
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: 'block' }}
                      >
                        {markdownTemplateField.placeholder}
                      </Typography>
                    </>
                  )}
                />
              </Box>
            )}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {scriptContentField.label}
              </Typography>
              <Controller
                name="ScriptContent"
                control={formControl.control}
                rules={{ required: 'PowerShell script content is required.' }}
                render={({ field, fieldState }) => (
                  <>
                    <CippCodeBlock
                      code={field.value || ''}
                      language="powershell"
                      type="editor"
                      showLineNumbers={true}
                      editorHeight="540px"
                      readOnly={isScriptLoading}
                      onChange={(value) => field.onChange(value || '')}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: 'block' }}
                    >
                      {scriptContentField.placeholder}
                    </Typography>
                    {fieldState.error?.message && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {fieldState.error.message}
                      </Typography>
                    )}
                  </>
                )}
              />
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion
        sx={{ mt: 2 }}
        expanded={testerExpanded}
        onChange={(_, expanded) => setTesterExpanded(expanded)}
        slotProps={{ transition: { unmountOnExit: true, timeout: 150 } }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2">Test Script Output</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {testerExpanded &&
            (!isEdit ? (
              <Alert severity="info">Save the script first to test execution output.</Alert>
            ) : (
              <Stack spacing={2}>
                <Typography variant="caption" color="text.secondary">
                  Runs a preview against your current tenant and renders output using the current
                  Return Type and Markdown Template from this form.
                </Typography>
                <CippFormComponent
                  name="TestParameters"
                  label="Script Parameters (JSON)"
                  type="textField"
                  formControl={formControl}
                  multiline={true}
                  rows={5}
                  disableVariables={true}
                  placeholder={`{
  "DaysThreshold": 30,
  "ExcludeDisabled": true
}`}
                />
                <Box>
                  <Button
                    variant="contained"
                    onClick={handleRunTest}
                    disabled={isScriptLoading || testScriptApi.isPending}
                  >
                    Run Test
                  </Button>
                </Box>

                {testScriptApi.isPending && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2">Running script test...</Typography>
                  </Box>
                )}

                {testScriptApi.isError && (
                  <CippApiResults apiObject={testScriptApi} errorsOnly={true} />
                )}

                {resultSchemaValue && (
                  <Typography variant="caption" color="text.secondary">
                    Result schema detected from latest test output and used for typed markdown
                    completions above.
                  </Typography>
                )}

                {testResults?.Results !== undefined && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Test Results
                    </Typography>
                    {selectedReturnType === 'Markdown' ? (
                      <Box
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {renderCustomScriptMarkdownTemplate(
                            testResults.Results,
                            markdownTemplateValue || ''
                          )}
                        </ReactMarkdown>
                      </Box>
                    ) : (
                      <CippCodeBlock
                        code={JSON.stringify(testResults.Results, null, 2)}
                        language="json"
                        showLineNumbers={false}
                      />
                    )}
                  </Box>
                )}
              </Stack>
            ))}
        </AccordionDetails>
      </Accordion>
    </CippFormPage>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
