import { Layout as DashboardLayout } from '../../../layouts/index.js'
import { Controller, useForm } from 'react-hook-form'
import { ApiGetCall, ApiPostCall } from '../../../api/ApiCall'
import { useRouter } from 'next/router'
import {
  Alert,
  Typography,
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Stack, Grid } from '@mui/system'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  ExpandMore,
  NotificationsActive,
  Code,
  TableChart,
  Visibility,
} from '@mui/icons-material'
import cacheTypes from '../../../data/CIPPDBCacheTypes.json'
import { renderCustomScriptMarkdownTemplate } from '../../../utils/customScriptTemplate'
import { useSettings } from '../../../hooks/use-settings'
import CippFormPage from '../../../components/CippFormPages/CippFormPage'
import CippFormComponent from '../../../components/CippComponents/CippFormComponent'
import { CippFormCondition } from '../../../components/CippComponents/CippFormCondition'
import { CippApiResults } from '../../../components/CippComponents/CippApiResults'
import { CippCodeBlock } from '../../../components/CippComponents/CippCodeBlock'
import { markdownStyles } from '../../../components/CippTestDetail/CippTestDetailOffCanvas'

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
  const [expandedCacheType, setExpandedCacheType] = useState(null)
  const [testResults, setTestResults] = useState(null)
  const [guidanceExpanded, setGuidanceExpanded] = useState(true)
  const [configExpanded, setConfigExpanded] = useState(true)
  const [scriptContentExpanded, setScriptContentExpanded] = useState(true)
  const [testerExpanded, setTesterExpanded] = useState(true)
  const markdownEditorRef = useRef(null)
  const scriptEditorRef = useRef(null)

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
      AlertStatuses: [{ value: 'Failed', label: 'Failed' }],
      ReturnType: 'JSON',
      ResultMode: { value: 'Auto', label: 'Auto' },
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
        AlertStatuses: script.AlertStatuses
          ? (typeof script.AlertStatuses === 'string'
              ? JSON.parse(script.AlertStatuses)
              : script.AlertStatuses
            ).map((s) => ({ value: s, label: s }))
          : [{ value: 'Failed', label: 'Failed' }],
        ReturnType: script.ReturnType || 'JSON',
        ResultMode: toSelectOption(script.ResultMode, 'Auto'),
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

  const cacheExplorerTenant = router.query.tenantFilter || settings?.currentTenant

  const variablesQuery = ApiGetCall({
    url: `/api/ListCustomVariables?tenantFilter=${encodeURIComponent(cacheExplorerTenant || '')}`,
    queryKey: `CustomVariables-${cacheExplorerTenant || 'global'}`,
    waiting: !!cacheExplorerTenant,
    staleTime: Infinity,
    refetchOnMount: false,
  })

  const cacheExplorerApi = ApiGetCall({
    url: '/api/ListDBCache',
    data: { tenantFilter: cacheExplorerTenant, type: expandedCacheType },
    queryKey: `CacheExplorer-${cacheExplorerTenant}-${expandedCacheType}`,
    waiting: !!expandedCacheType && !!cacheExplorerTenant,
  })

  const handleExploreCache = (cacheType) => {
    setExpandedCacheType(expandedCacheType === cacheType ? null : cacheType)
  }

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

    setTestResults(null)

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
      AlertStatuses: data.AlertOnFailure
        ? (data.AlertStatuses?.map(s => s.value) || ['Failed'])
        : [],
      ReturnType: data.ReturnType,
      ResultMode: data.ResultMode?.value ?? data.ResultMode,
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

  const resultModeOptions = [
    { value: 'Auto', label: 'Auto' },
    { value: 'AlwaysPass', label: 'Always Pass' },
    { value: 'AlwaysInfo', label: 'Always Info' },
    { value: 'AlwaysInvestigate', label: 'Always Investigate' },
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
    multiple: false,
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

  const alertStatusesField = {
    name: 'AlertStatuses',
    label: 'Alert on Status',
    type: 'autoComplete',
    multiple: true,
    options: [
      { label: 'Failed', value: 'Failed' },
      { label: 'Passed', value: 'Passed' },
      { label: 'Info', value: 'Info' },
      { label: 'Investigate', value: 'Investigate' },
    ],
    helperText: 'Choose which test result statuses trigger an alert.',
  }

  const returnTypeField = {
    name: 'ReturnType',
    label: 'Result Display Type',
    type: 'select',
    required: true,
    placeholder: 'Select how test results are rendered',
    options: returnTypeOptions,
    creatable: false,
    helperText:
      'Controls the default display when no CIPPResultMarkdown is returned by the script. If the script returns CIPPResultMarkdown, it takes priority over this setting.',
  }

  const resultModeField = {
    name: 'ResultMode',
    label: 'Result Mode',
    type: 'autoComplete',
    required: true,
    multiple: false,
    placeholder: 'Select result mode',
    options: resultModeOptions,
    creatable: false,
    helperText:
      'Auto: script output determines pass/fail. Always Pass: result is always Passed. Always Info: result is always Info.',
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
    disableVariables: true,
  }

  const selectedReturnType = formControl.watch('ReturnType')
  const markdownTemplateValue = formControl.watch('MarkdownTemplate')
  const resultSchemaValue = formControl.watch('ResultSchema')
  const watchedScriptContent = formControl.watch('ScriptContent')

  const hasTenantFilterParam = useMemo(() => {
    if (!watchedScriptContent) return false
    return /-TenantFilter\b/i.test(watchedScriptContent)
  }, [watchedScriptContent])

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

  const handleScriptEditorMount = (_editor, monaco) => {
    scriptEditorRef.current = _editor

    const provider = monaco.languages.registerCompletionItemProvider('powershell', {
      triggerCharacters: ['%'],
      provideCompletionItems: (model, position) => {
        const linePrefix = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        })

        const triggerIndex = linePrefix.lastIndexOf('%')
        if (triggerIndex === -1) {
          return { suggestions: [] }
        }

        const range = {
          startLineNumber: position.lineNumber,
          startColumn: triggerIndex + 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        }

        const vars = variablesQuery.data?.Results || []
        const suggestions = vars.map((v) => ({
          label: v.Variable,
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: v.Variable,
          detail: v.Type === 'reserved' ? `Built-in (${v.Category})` : `Custom (${v.Category})`,
          documentation: v.Description || '',
          range,
        }))

        return { suggestions }
      },
    })

    const contentListener = _editor.onDidChangeModelContent(() => {
      const model = _editor.getModel()
      const position = _editor.getPosition()
      if (!model || !position) return

      const linePrefix = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      })

      if (linePrefix.endsWith('%')) {
        _editor.trigger('cipp-variables', 'editor.action.triggerSuggest', {})
      }
    })

    _editor.onDidDispose(() => {
      provider.dispose()
      contentListener.dispose()
      if (scriptEditorRef.current === _editor) {
        scriptEditorRef.current = null
      }
    })
  }

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
              Custom tests run PowerShell against each tenant. The script output determines the
              result status.
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    height: '100%',
                  }}
                >
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="success.main"
                        sx={{ mb: 0.25 }}
                      >
                        Pass
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Return <code>$null</code>, <code>$false</code>, empty string, or{' '}
                        <code>@()</code>
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="error.main"
                        sx={{ mb: 0.25 }}
                      >
                        Fail
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Return any non-empty value — the returned data becomes the test output
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    height: '100%',
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="info.main"
                    sx={{ mb: 0.25 }}
                  >
                    Explicit Status
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Return a hashtable with <code>CIPPStatus</code> (<code>Passed</code>/
                    <code>Failed</code>/<code>Info</code>/<code>Investigate</code>),{' '}
                    <code>CIPPResults</code>, and optional{' '}
                    <code>CIPPResultMarkdown</code> to control status and rendering directly (Auto
                    result mode only)
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    height: '100%',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <NotificationsActive sx={{ fontSize: 16 }} color="warning" />
                    <Typography variant="body2" fontWeight={600}>
                      Alerts
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Enable &quot;Notify on Alert&quot; for failure alerts, deduplicated per tenant
                    per day.
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    height: '100%',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Code sx={{ fontSize: 16 }} color="info" />
                    <Typography variant="body2" fontWeight={600}>
                      Scripting Rules
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    AST allowlist — approved cmdlets only. <code>+=</code> is blocked. Data access
                    is automatically tenant-locked — do not pass{' '}
                    <code>-TenantFilter</code>. Type <code>%</code> in the editor for replacement
                    variables.
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    height: '100%',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <TableChart sx={{ fontSize: 16 }} color="info" />
                    <Typography variant="body2" fontWeight={600}>
                      Data Access
                    </Typography>
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    Read-only via <code>Get-CIPPTestData</code> with <code>-Type</code>.{' '}
                    Tenant is auto-locked — do not pass <code>-TenantFilter</code>. Use{' '}
                    <code>%variable%</code> syntax for replacement variables.
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setCacheTypesDialogOpen(true)}
                    sx={{ mt: 0.5 }}
                  >
                    View Cached Types ({cacheTypes.length})
                  </Button>
                </Box>
              </Grid>
            </Grid>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 2 }}
            >
              Manual testing on this page is preview-only. Results are persisted only during
              scheduled tenant test runs with the script enabled.
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Example Scripts
            </Typography>

            <Accordion
              variant="outlined"
              sx={{ '&:before': { display: 'none' }, boxShadow: 'none' }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="body2" fontWeight={600}>
                  Licensed Users with Resolved SKU Names
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1 }}
                >
                  Lists all users with licenses, resolves SKU IDs to friendly names using the
                  license cache, and returns a markdown table with an explicit Passed status.
                  Demonstrates <code>CIPPStatus</code>, <code>CIPPResults</code>, and{' '}
                  <code>CIPPResultMarkdown</code>.
                </Typography>
                <CippCodeBlock
                  code={`# List all users and their licenses with friendly SKU names
$Users = Get-CIPPTestData -Type 'Users'
$Licenses = Get-CIPPTestData -Type 'LicenseOverview'

# Build a SKU ID -> display name lookup hashtable
$SkuLookup = @{}
$Licenses | ForEach-Object {
    $SkuLookup[$_.skuId] = $_.License
}

# Build results - users with their resolved license names
$results = $Users | Where-Object {
    $_.assignedLicenses.Count -gt 0
} | ForEach-Object {
    $user = $_
    $licenseNames = @($user.assignedLicenses | ForEach-Object {
        $name = $SkuLookup[$_.skuId]
        if ($name) { $name } else { $_.skuId }
    })
    [PSCustomObject]@{
        UserPrincipalName = $user.userPrincipalName
        DisplayName       = $user.displayName
        AccountEnabled    = $user.accountEnabled
        LicenseCount      = $licenseNames.Count
        Licenses          = $licenseNames -join ', '
    }
}

# Build markdown table
$header = "### Licensed Users: $($results.Count)\\n\\n| User | Display Name | Enabled | Licenses |\\n|---|---|---|---|"
$rows = $results | ForEach-Object {
    "| $($_.UserPrincipalName) | $($_.DisplayName) | $($_.AccountEnabled) | $($_.Licenses) |"
}
$md = @($header) + @($rows) -join "\\n"

# Return with explicit pass + markdown
@{
    CIPPStatus         = 'Passed'
    CIPPResults        = $results
    CIPPResultMarkdown = $md
}`}
                  language="powershell"
                  showLineNumbers={true}
                />
              </AccordionDetails>
            </Accordion>

            <Accordion
              variant="outlined"
              sx={{ '&:before': { display: 'none' }, boxShadow: 'none', mt: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="body2" fontWeight={600}>
                  Disabled Users with Active Licenses
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1 }}
                >
                  Finds disabled accounts that still have licenses assigned — a common cost waste
                  indicator. Returns failed rows as JSON (default Result Display Type behavior). No
                  wrapper needed — non-empty output automatically means fail.
                </Typography>
                <CippCodeBlock
                  code={`# Find disabled users that still have licenses (wasted cost)
$Users = Get-CIPPTestData -Type 'Users'

# Return only disabled users with licenses — non-empty = fail
$Users | Where-Object {
    $_.accountEnabled -eq $false -and
    $_.assignedLicenses.Count -gt 0
} | ForEach-Object {
    [PSCustomObject]@{
        UserPrincipalName = $_.userPrincipalName
        DisplayName       = $_.displayName
        LicenseCount      = $_.assignedLicenses.Count
        Message           = 'Disabled account with active license(s)'
    }
}`}
                  language="powershell"
                  showLineNumbers={true}
                />
              </AccordionDetails>
            </Accordion>

            <Accordion
              variant="outlined"
              sx={{ '&:before': { display: 'none' }, boxShadow: 'none', mt: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="body2" fontWeight={600}>
                  MFA Registration Gaps
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1 }}
                >
                  Checks user registration details for accounts that haven&apos;t registered any MFA
                  method. Uses <code>Info</code> status so results are always informational rather
                  than a hard fail.
                </Typography>
                <CippCodeBlock
                  code={`# Find users without any MFA method registered
$RegDetails = Get-CIPPTestData -Type 'UserRegistrationDetails'

$noMfa = $RegDetails | Where-Object {
    $_.methodsRegistered.Count -eq 0 -and
    $_.userType -ne 'guest'
} | ForEach-Object {
    [PSCustomObject]@{
        UserPrincipalName = $_.userPrincipalName
        UserDisplayName   = $_.userDisplayName
        IsAdmin           = $_.isAdmin
        Message           = 'No MFA methods registered'
    }
}

$count = @($noMfa).Count
if ($count -gt 0) {
    $header = "### Users Without MFA: $count\n\n| User | Admin | Message |\n|---|---|---|"
    $tableRows = $noMfa | ForEach-Object {
        "| $($_.UserPrincipalName) | $($_.IsAdmin) | $($_.Message) |"
    }
    $md = @($header) + @($tableRows) -join "\n"
} else {
    $md = "### Users Without MFA: 0\n\nAll users have at least one MFA method registered."
}

@{
    CIPPStatus         = 'Info'
    CIPPResults        = $noMfa
    CIPPResultMarkdown = $md
}`}
                  language="powershell"
                  showLineNumbers={true}
                />
              </AccordionDetails>
            </Accordion>

            <Accordion
              variant="outlined"
              sx={{ '&:before': { display: 'none' }, boxShadow: 'none', mt: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="body2" fontWeight={600}>
                  Stale Guest Accounts
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1 }}
                >
                  Identifies guest accounts that haven&apos;t signed in within 90 days. Uses a{' '}
                  <code>param</code> with a default so the threshold is configurable via Test
                  Parameters. Simple auto-detection — empty result = pass, non-empty = fail.
                </Typography>
                <CippCodeBlock
                  code={`# Find guest accounts with no recent sign-in
param($DaysThreshold = 90)

$Guests = Get-CIPPTestData -Type 'Guests'
$cutoff = (Get-Date).AddDays(-$DaysThreshold)

$Guests | Where-Object {
    -not $_.signInActivity.lastSignInDateTime -or
    [datetime]$_.signInActivity.lastSignInDateTime -lt $cutoff
} | ForEach-Object {
    $lastSign = if ($_.signInActivity.lastSignInDateTime) {
        $_.signInActivity.lastSignInDateTime
    } else { 'Never' }
    [PSCustomObject]@{
        UserPrincipalName = $_.userPrincipalName
        DisplayName       = $_.displayName
        CreatedDateTime   = $_.createdDateTime
        LastSignIn        = $lastSign
        Message           = "No sign-in within $DaysThreshold days"
    }
}`}
                  language="powershell"
                  showLineNumbers={true}
                />
              </AccordionDetails>
            </Accordion>

            <Accordion
              variant="outlined"
              sx={{ '&:before': { display: 'none' }, boxShadow: 'none', mt: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="body2" fontWeight={600}>
                  Conditional Access Policy Summary
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1 }}
                >
                  Provides an informational summary of all Conditional Access policies grouped by
                  state. Demonstrates using <code>Group-Object</code>, building a multi-section
                  markdown report, and <code>%tenantname%</code> replacement variables. Always
                  passes since it&apos;s informational.
                </Typography>
                <CippCodeBlock
                  code={`# Summarize Conditional Access policies by state
$Policies = Get-CIPPTestData -Type 'ConditionalAccessPolicies'
$grouped = $Policies | Group-Object -Property state

$counts = $grouped | ForEach-Object {
    [PSCustomObject]@{
        State = $_.Name
        Count = $_.Count
    }
}

# Build markdown summary — %tenantname% is replaced at runtime
$header = "### %tenantname% — CA Policies: $(@($Policies).Count) total\n\n| State | Count |\n|---|---|"
$countRows = $counts | ForEach-Object {
    "| $($_.State) | $($_.Count) |"
}
$summaryTable = @($header) + @($countRows) -join "\n"

# List each policy
$policyHeader = "| Policy | State | Created |\n|---|---|---|"
$policyRows = $Policies | Sort-Object -Property state, displayName | ForEach-Object {
    "| $($_.displayName) | $($_.state) | $($_.createdDateTime) |"
}
$policyTable = @($policyHeader) + @($policyRows) -join "\n"

$md = $summaryTable + "\n\n---\n\n" + $policyTable

@{
    CIPPStatus         = 'Passed'
    CIPPResults        = $counts
    CIPPResultMarkdown = $md
}`}
                  language="powershell"
                  showLineNumbers={true}
                />
              </AccordionDetails>
            </Accordion>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Dialog
        open={cacheTypesDialogOpen}
        onClose={() => {
          setCacheTypesDialogOpen(false)
          setExpandedCacheType(null)
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Cached Types</DialogTitle>
        <DialogContent dividers>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            Click the eye icon to explore sample data from the currently selected tenant.
          </Typography>
          <Stack spacing={1}>
            {cacheTypes.map((cacheType) => (
              <Box key={cacheType.type}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {cacheType.friendlyName} ({cacheType.type})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cacheType.description}
                    </Typography>
                  </Box>
                  <Tooltip title="Explore data structure">
                    <IconButton
                      size="small"
                      onClick={() => handleExploreCache(cacheType.type)}
                      color={expandedCacheType === cacheType.type ? 'primary' : 'default'}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Collapse in={expandedCacheType === cacheType.type} unmountOnExit>
                  <Box
                    sx={{
                      mt: 1,
                      mb: 1,
                      p: 1,
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      maxHeight: 300,
                      overflow: 'auto',
                    }}
                  >
                    {cacheExplorerApi.isFetching ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={16} />
                        <Typography variant="caption">Loading sample data...</Typography>
                      </Stack>
                    ) : cacheExplorerApi.data?.Results?.length > 0 ? (
                      <CippCodeBlock
                        code={JSON.stringify(cacheExplorerApi.data.Results[0], null, 2)}
                        language="json"
                        showLineNumbers={false}
                      />
                    ) : cacheExplorerApi.isSuccess ? (
                      <Typography variant="caption" color="text.secondary">
                        No cached data found for this type on the selected tenant. Run a cache
                        refresh first.
                      </Typography>
                    ) : !cacheExplorerTenant ? (
                      <Typography variant="caption" color="text.secondary">
                        Select a tenant to explore cached data.
                      </Typography>
                    ) : null}
                  </Box>
                </Collapse>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCacheTypesDialogOpen(false)
              setExpandedCacheType(null)
            }}
          >
            Close
          </Button>
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
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                formControl={formControl}
                {...resultModeField}
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
            <CippFormCondition
              field="AlertOnFailure"
              formControl={formControl}
              compareType="is"
              compareValue={true}
            >
              <Grid size={{ xs: 12, md: 6 }}>
                <CippFormComponent
                  formControl={formControl}
                  {...alertStatusesField}
                  disabled={isScriptLoading}
                />
              </Grid>
            </CippFormCondition>
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
                      onMount={handleScriptEditorMount}
                      onChange={(value) => field.onChange(value || '')}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: 'block' }}
                    >
                      {scriptContentField.placeholder}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block' }}
                    >
                      Type <code>%</code> to insert replacement variables (e.g.{' '}
                      <code>%tenantid%</code>, <code>%defaultdomain%</code>, or custom variables).
                    </Typography>
                    {hasTenantFilterParam && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        <code>-TenantFilter</code> is not needed — data access functions are
                        automatically locked to the execution tenant. Remove{' '}
                        <code>-TenantFilter $TenantFilter</code> from your calls.
                      </Alert>
                    )}
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

                {(testResults?.Results !== undefined || testResults?.CIPPResultMarkdown) && (
                  <Box>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="h6">Test Results</Typography>
                      {testResults?.CIPPStatus && (
                        <Chip
                          label={testResults.CIPPStatus}
                          color={
                            testResults.CIPPStatus === 'Passed'
                              ? 'success'
                              : testResults.CIPPStatus === 'Failed'
                                ? 'error'
                                : 'info'
                          }
                          size="small"
                        />
                      )}
                    </Stack>
                    {testResults?.CIPPResultMarkdown ? (
                      <Box
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          ...markdownStyles,
                        }}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {testResults.CIPPResultMarkdown.replace(/\\n/g, '\n')}
                        </ReactMarkdown>
                      </Box>
                    ) : selectedReturnType === 'Markdown' ? (
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
