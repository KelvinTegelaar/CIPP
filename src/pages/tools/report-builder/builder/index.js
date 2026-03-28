import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import {
  Button,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Container,
  Divider,
  Skeleton,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material'
import { Grid, Stack, Box } from '@mui/system'
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { useSettings } from '../../../../hooks/use-settings'
import { ApiGetCall, ApiPostCall } from '../../../../api/ApiCall.jsx'
import { useForm, useWatch } from 'react-hook-form'
import CippFormComponent from '../../../../components/CippComponents/CippFormComponent'
import { CippFormCondition } from '../../../../components/CippComponents/CippFormCondition'
import { CippApiResults } from '../../../../components/CippComponents/CippApiResults'
import CippButtonCard from '../../../../components/CippCards/CippButtonCard'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { renderCustomScriptMarkdownTemplate } from '../../../../utils/customScriptTemplate'
import {
  Add,
  Delete,
  Edit,
  Lock,
  PictureAsPdf,
  Download,
  Schedule,
  Save,
  Close,
  ArrowBack,
  ArrowUpward,
  ArrowDownward,
  Refresh,
} from '@mui/icons-material'
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
} from 'mui-tiptap'
import StarterKit from '@tiptap/starter-kit'
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { ReportBuilderPDF } from '../../../../components/ReportBuilder/ReportBuilderPDF'
import { useRouter } from 'next/router'

/* ── Markdown styles (matches CippTestDetailOffCanvas) ── */
const markdownStyles = {
  color: 'text.secondary',
  fontSize: '0.875rem',
  lineHeight: 1.6,
  '& p': { my: 0.5 },
  '& ul, & ol': { my: 0.5, pl: 2 },
  '& li': { my: 0.25 },
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    mt: 1.5,
    mb: 0.5,
    fontWeight: 'bold',
    color: 'text.primary',
  },
  '& table': { width: '100%', borderCollapse: 'collapse', my: 1 },
  '& th, & td': {
    border: 1,
    borderColor: 'divider',
    p: 0.75,
    textAlign: 'left',
    fontSize: '0.8rem',
  },
  '& th': { backgroundColor: 'action.hover', fontWeight: 600 },
  '& code': {
    backgroundColor: 'action.hover',
    p: '1px 4px',
    borderRadius: 0.5,
    fontSize: '0.8em',
  },
  '& pre': { backgroundColor: 'action.hover', p: 1.5, borderRadius: 1, overflow: 'auto' },
}

/* ── Simple markdown → HTML converter for TipTap editing ── */
const markdownToHtml = (md) => {
  if (!md) return ''

  const lines = md.split('\n')
  const htmlParts = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Detect GFM table: current line has pipes and next line is separator (|---|---| etc)
    if (
      line.includes('|') &&
      i + 1 < lines.length &&
      lines[i + 1].trim().match(/^\|?[\s-:|]+\|[\s-:|]*\|?$/)
    ) {
      const headerCells = line
        .split('|')
        .map((c) => c.trim())
        .filter((c) => c !== '')
      let tableHtml = '<table><thead><tr>'
      headerCells.forEach((cell) => {
        tableHtml += `<th>${cell}</th>`
      })
      tableHtml += '</tr></thead><tbody>'
      i += 2 // skip header + separator
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        const cells = lines[i]
          .split('|')
          .map((c) => c.trim())
          .filter((c) => c !== '')
        tableHtml += '<tr>'
        cells.forEach((cell) => {
          tableHtml += `<td>${cell}</td>`
        })
        tableHtml += '</tr>'
        i++
      }
      tableHtml += '</tbody></table>'
      htmlParts.push(tableHtml)
      continue
    }

    if (line.startsWith('### ')) {
      htmlParts.push(`<h3>${line.slice(4)}</h3>`)
    } else if (line.startsWith('## ')) {
      htmlParts.push(`<h3>${line.slice(3)}</h3>`)
    } else if (line.startsWith('# ')) {
      htmlParts.push(`<h2>${line.slice(2)}</h2>`)
    } else if (line.trim().match(/^[-*+]\s/)) {
      htmlParts.push(`<li>${line.trim().replace(/^[-*+]\s/, '')}</li>`)
    } else if (line.trim().match(/^\d+\.\s/)) {
      htmlParts.push(`<li>${line.trim().replace(/^\d+\.\s/, '')}</li>`)
    } else if (line.trim() === '') {
      htmlParts.push('')
    } else {
      htmlParts.push(`<p>${line}</p>`)
    }
    i++
  }

  return htmlParts
    .join('')
    .replace(/(<li>.*?<\/li>)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
}

/* ── TipTap extension: convert pasted Markdown to HTML ── */
const MarkdownPaste = Extension.create({
  name: 'markdownPaste',
  addProseMirrorPlugins() {
    const editor = this.editor
    return [
      new Plugin({
        key: new PluginKey('markdownPaste'),
        props: {
          handlePaste(view, event) {
            const text = event.clipboardData?.getData('text/plain')
            if (!text) return false
            // Check if the plain text looks like it contains a markdown table
            const hasMarkdownTable = text.includes('|') && /^\|?[\s-:|]+\|[\s-:|]*\|?$/m.test(text)
            // Check for other markdown patterns
            const hasOtherMarkdown =
              /^#{1,6}\s/m.test(text) || /^[-*+]\s/m.test(text) || /\*\*.+\*\*/.test(text)
            if (!hasMarkdownTable && !hasOtherMarkdown) return false
            event.preventDefault()
            const converted = markdownToHtml(text)
            editor.commands.insertContent(converted)
            return true
          },
        },
      }),
    ]
  },
})

/* ── ReportBlock ──────────────────────────────────────────── */
const ReportBlock = ({
  block,
  index,
  totalBlocks,
  onRemove,
  onUpdate,
  onRevert,
  onMoveUp,
  onMoveDown,
}) => {
  const [editing, setEditing] = useState(false)
  const editorRef = useRef(null)

  const isTestBlock = block.type === 'test'
  const isStatic = block.static === true
  const isLocked = isTestBlock && !editing && !isStatic

  const handleStartEdit = () => {
    setEditing(true)
  }

  const handleSaveEdit = () => {
    if (editorRef.current) {
      onUpdate(index, { ...block, content: editorRef.current.getHTML(), static: true })
    }
    setEditing(false)
  }

  const editorContent =
    editing && isTestBlock && !isStatic ? markdownToHtml(block.content || '') : block.content || ''

  return (
    <CippButtonCard
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {block.title || (block.type === 'blank' ? 'Custom Block' : 'Test Block')}
          </Typography>
          {isTestBlock && block.status && (
            <Chip
              label={block.status}
              size="small"
              color={
                block.status === 'Passed'
                  ? 'success'
                  : block.status === 'Failed'
                    ? 'error'
                    : block.status === 'Investigate'
                      ? 'warning'
                      : 'default'
              }
            />
          )}
          {isTestBlock && (
            <Chip
              label={isStatic ? 'Edited' : 'Live'}
              size="small"
              color={isStatic ? 'warning' : 'success'}
              variant="outlined"
            />
          )}
          {block.type === 'blank' && (
            <Chip label="Custom" size="small" color="info" variant="outlined" />
          )}
        </Box>
      }
      cardActions={
        <Stack direction="row" spacing={0.5} alignItems="center">
          {isTestBlock && !editing && (
            <Tooltip title={isStatic ? 'Edit static content' : 'Edit (converts to static)'}>
              <IconButton size="small" onClick={handleStartEdit}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {isTestBlock && isStatic && !editing && (
            <Tooltip title="Revert to live data">
              <IconButton size="small" color="info" onClick={() => onRevert(index)}>
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {editing && (
            <>
              <Button size="small" variant="contained" onClick={handleSaveEdit}>
                Save
              </Button>
              <Button size="small" variant="outlined" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </>
          )}
          <Tooltip title="Move up">
            <span>
              <IconButton size="small" onClick={() => onMoveUp(index)} disabled={index === 0}>
                <ArrowUpward fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Move down">
            <span>
              <IconButton
                size="small"
                onClick={() => onMoveDown(index)}
                disabled={index === totalBlocks - 1}
              >
                <ArrowDownward fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Remove block">
            <IconButton size="small" color="error" onClick={() => onRemove(index)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      }
    >
      {editing || block.type === 'blank' ? (
        <RichTextEditor
          immediatelyRender={false}
          extensions={[
            StarterKit,
            Table.configure({ resizable: false }),
            TableRow,
            TableHeader,
            TableCell,
            MarkdownPaste,
          ]}
          content={editorContent}
          onCreate={({ editor }) => {
            editorRef.current = editor
            editor.commands.setContent(editorContent, false)
          }}
          onUpdate={({ editor }) => {
            if (block.type === 'blank') {
              onUpdate(index, { ...block, content: editor.getHTML() })
            }
          }}
          renderControls={() => (
            <MenuControlsContainer>
              <MenuSelectHeading />
              <MenuDivider />
              <MenuButtonBold />
              <MenuButtonItalic />
            </MenuControlsContainer>
          )}
        />
      ) : isLocked ? (
        <Box sx={{ position: 'relative' }}>
          <Lock
            sx={{ position: 'absolute', top: 0, right: 0, color: 'text.disabled', fontSize: 14 }}
          />
          <Box sx={{ ...markdownStyles, opacity: 0.9, pointerEvents: 'none', userSelect: 'none' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.content || ''}</ReactMarkdown>
          </Box>
        </Box>
      ) : (
        <Box sx={markdownStyles}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.content || ''}</ReactMarkdown>
        </Box>
      )}
    </CippButtonCard>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
const Page = () => {
  const router = useRouter()
  const settings = useSettings()
  const { currentTenant } = settings
  const brandingSettings = settings.customBranding

  /* ── Deeplink: load template by ID from URL ── */
  const [templateId, setTemplateId] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const templateLoadedRef = useRef(false)

  useEffect(() => {
    if (router.isReady) {
      setTemplateId(router.query.id || null)
      setIsReady(true)
    }
  }, [router.isReady, router.query.id])

  /* ── Builder state ── */
  const [blocks, setBlocks] = useState([])
  const [templateGUID, setTemplateGUID] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)

  const saveForm = useForm({ defaultValues: { templateName: '' } })
  const addBlockForm = useForm({ defaultValues: { blockType: null, selectedTest: [] } })
  const settingsForm = useForm({ defaultValues: { removeRemediation: true } })
  const scheduleForm = useForm({
    defaultValues: { scheduleName: '', recurrence: null, postExecution: [] },
  })

  const watchBlockType = useWatch({ control: addBlockForm.control, name: 'blockType' })
  const watchSelectedTest = useWatch({ control: addBlockForm.control, name: 'selectedTest' })
  const removeRemediation = useWatch({ control: settingsForm.control, name: 'removeRemediation' })

  // CippFormCondition clearOnHide sets selectedTest to null; coerce back to [] so
  // CippAutoComplete (multiple) doesn't wrap null into [null] → empty chip.
  useEffect(() => {
    const val = addBlockForm.getValues('selectedTest')
    if (val === null || val === undefined) {
      addBlockForm.setValue('selectedTest', [], { shouldDirty: false, shouldValidate: false })
    }
  }, [watchBlockType])

  /* ── API hooks ── */
  const templatesApi = ApiGetCall({
    url: '/api/ListReportBuilderTemplates',
    queryKey: `ListReportBuilderTemplates-builder-${templateId}`,
    waiting: !!templateId,
  })

  const availableTestsApi = ApiGetCall({
    url: '/api/ListAvailableTests',
    queryKey: 'ListAvailableTests',
  })

  const testsApi = ApiGetCall({
    url: '/api/ListTests',
    data: { tenantFilter: currentTenant },
    queryKey: `${currentTenant}-ListTests-allreportbuilder`,
    waiting: !!currentTenant,
  })

  const organizationApi = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: { tenantFilter: currentTenant, Endpoint: 'organization' },
    queryKey: `${currentTenant}-ListGraphRequest-organization-reportbuilder`,
    waiting: !!currentTenant,
  })

  const tenantDisplayName =
    organizationApi.data?.Results?.[0]?.displayName || currentTenant || 'Organization'

  const saveTemplateCall = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ['ListReportBuilderTemplates'],
  })

  const deleteTemplateCall = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ['ListReportBuilderTemplates'],
  })

  const scheduleCall = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ['ScheduledTasks'],
  })

  /* ── Derived data ── */
  const availableTests = availableTestsApi.data || {
    IdentityTests: [],
    DevicesTests: [],
    CustomTests: [],
  }

  const allTestOptions = [
    ...(availableTests.IdentityTests || []).map((t) => ({
      label: `[Identity] ${t.name}`,
      value: t.id,
      category: 'Identity',
      name: t.name,
    })),
    ...(availableTests.DevicesTests || []).map((t) => ({
      label: `[Devices] ${t.name}`,
      value: t.id,
      category: 'Devices',
      name: t.name,
    })),
    ...(availableTests.CustomTests || []).map((t) => ({
      label: `[Custom] ${t.name}`,
      value: t.id,
      category: 'Custom',
      name: t.name,
    })),
  ]

  const testResults = useMemo(() => testsApi.data?.TestResults || [], [testsApi.data])

  const getTestResult = useCallback(
    (testId) => {
      return testResults.find((t) => t.TestId === testId || t.RowKey === testId) || null
    },
    [testResults]
  )

  const getTestContent = useCallback(
    (testId) => {
      const result = getTestResult(testId)
      if (!result) return '_No results available for this test. Run an assessment first._'

      const parts = []

      const maybeStripRemediation = (text) => {
        if (!text) return text
        if (!removeRemediation) return text
        // Match all variants: **Remediation action**, **Remediation Action:**, **Remediation Action:**,
        // **Remediation actions**, **Remediation Resources**, with colon inside or outside bold
        return text.split(/\*\*Remediation\s+(?:action|actions|resources):?\*\*:?/i)[0].trim()
      }

      if (result.Description) {
        const desc = maybeStripRemediation(result.Description)
        if (desc) parts.push(desc)
      }

      let resultContent = ''
      if (result.TestType === 'Custom' && result.ResultDataJson) {
        try {
          resultContent = renderCustomScriptMarkdownTemplate(
            JSON.parse(result.ResultDataJson),
            result.MarkdownTemplate || ''
          )
        } catch {
          resultContent = result.ResultMarkdown || ''
        }
      } else {
        resultContent = result.ResultMarkdown || ''
      }

      resultContent = maybeStripRemediation(resultContent)

      if (resultContent) {
        parts.push('## Results\n\n' + resultContent)
      }

      return parts.length > 0 ? parts.join('\n\n') : '_No content available for this test._'
    },
    [testResults, getTestResult, removeRemediation]
  )

  const getTestStatus = useCallback(
    (testId) => {
      const result = getTestResult(testId)
      return result?.Status || null
    },
    [getTestResult]
  )

  /* ── One-time template load from API data ── */
  useEffect(() => {
    if (!templateId || !templatesApi.data || templateLoadedRef.current) return
    const list = Array.isArray(templatesApi.data) ? templatesApi.data : []
    const found = list.find((t) => t.GUID === templateId || t.RowKey === templateId)
    if (found) {
      let templateBlocks = []
      try {
        const rawBlocks = typeof found.Blocks === 'string' ? JSON.parse(found.Blocks) : found.Blocks
        templateBlocks = (rawBlocks || []).map((b, i) => ({
          ...b,
          id: `block-${Date.now()}-${i}`,
          content:
            b.type === 'blank'
              ? b.content || ''
              : b.type === 'test' && !b.static
                ? getTestContent(b.testId)
                : b.content || '',
          status: b.type === 'test' ? b.status || getTestStatus(b.testId) : undefined,
        }))
      } catch {
        templateBlocks = []
      }
      setBlocks(templateBlocks)
      setTemplateGUID(found.GUID || found.RowKey || null)
      saveForm.setValue('templateName', found.Name || '')
      templateLoadedRef.current = true
    }
  }, [templateId, templatesApi.data, getTestContent, getTestStatus, saveForm])

  /* ── Block operations ── */
  const handleAddBlock = () => {
    const type = addBlockForm.getValues('blockType')
    if (!type) return

    if (type.value === 'blank') {
      setBlocks((prev) => [
        ...prev,
        {
          id: `block-${Date.now()}`,
          type: 'blank',
          title: '',
          content: '<p>Enter your content here...</p>',
          static: false,
        },
      ])
      addBlockForm.reset({ blockType: null, selectedTest: [] })
    } else if (type.value === 'test') {
      const tests = addBlockForm.getValues('selectedTest')
      const testArray = Array.isArray(tests) ? tests : tests ? [tests] : []
      if (testArray.length === 0) return
      setBlocks((prev) => [
        ...prev,
        ...testArray.map((test, i) => ({
          id: `block-${Date.now()}-${i}`,
          type: 'test',
          testId: test.value,
          testCategory: test.category,
          title: test.name || test.label,
          content: getTestContent(test.value),
          status: getTestStatus(test.value),
          static: false,
        })),
      ])
      addBlockForm.reset({ blockType: null, selectedTest: [] })
    }
  }

  const handleRemoveBlock = (index) => setBlocks((prev) => prev.filter((_, i) => i !== index))

  const handleMoveBlockUp = (index) => {
    if (index === 0) return
    setBlocks((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }

  const handleMoveBlockDown = (index) => {
    setBlocks((prev) => {
      if (index >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }

  const handleUpdateBlock = (index, b) =>
    setBlocks((prev) => prev.map((x, i) => (i === index ? b : x)))

  const handleRevertBlock = (index) =>
    setBlocks((prev) =>
      prev.map((b, i) => {
        if (i !== index || b.type !== 'test') return b
        return {
          ...b,
          content: getTestContent(b.testId),
          status: getTestStatus(b.testId),
          static: false,
        }
      })
    )

  /* ── Template operations ── */
  const handleSaveTemplate = () => {
    const name = saveForm.getValues('templateName')
    if (!name?.trim()) return
    saveTemplateCall.mutate({
      url: '/api/ExecReportBuilderTemplate',
      data: {
        Action: 'save',
        GUID: templateGUID || undefined,
        Name: name,
        Blocks: blocks.map((b) => ({
          type: b.type,
          testId: b.testId || null,
          testCategory: b.testCategory || null,
          title: b.title,
          content: b.type === 'blank' ? b.content : b.static ? b.content : null,
          status: b.status || null,
          static: b.type === 'blank' ? true : b.static,
        })),
      },
    })
  }

  const handleScheduleReport = () => {
    const values = scheduleForm.getValues()
    const name = saveForm.getValues('templateName') || 'Custom Report'
    scheduleCall.mutate({
      url: '/api/AddScheduledItem',
      data: {
        TenantFilter: currentTenant,
        Name: values.scheduleName || `Report Builder - ${name}`,
        command: {
          label: 'Generate Report Builder PDF',
          value: 'Push-ExecGenerateReportBuilderReport',
        },
        parameters: {
          TemplateName: name,
          TenantFilter: currentTenant,
          Blocks: JSON.stringify(
            blocks.map((b) => ({
              type: b.type,
              testId: b.testId || null,
              testCategory: b.testCategory || null,
              title: b.title,
              content: b.type === 'blank' ? b.content : b.static ? b.content : null,
              status: b.status || null,
              static: b.type === 'blank' ? true : b.static,
            }))
          ),
        },
        ScheduledTime: Math.floor(Date.now() / 1000),
        Recurrence: values.recurrence || { value: '0', label: 'Once' },
        postExecution: values.postExecution || [],
        taskType: { value: 'scheduled', label: 'Scheduled' },
      },
    })
  }

  const handleDownload = () => {
    import('@react-pdf/renderer').then(({ pdf }) => {
      const {
        ReportBuilderDocument,
      } = require('../../../../components/ReportBuilder/ReportBuilderPDF')
      const doc = (
        <ReportBuilderDocument
          blocks={displayBlocks}
          tenantName={tenantDisplayName}
          templateName={saveForm.getValues('templateName') || 'Custom Report'}
          brandingSettings={brandingSettings}
        />
      )
      pdf(doc)
        .toBlob()
        .then((blob) => {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `Report_${(currentTenant || 'report').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        })
    })
  }

  const handleBackClick = () => {
    router.push('/tools/report-builder/templates')
  }

  const addDisabled =
    !watchBlockType ||
    (watchBlockType?.value === 'test' &&
      (!watchSelectedTest || (Array.isArray(watchSelectedTest) && watchSelectedTest.length === 0)))

  /* ── Resolve live test blocks with current data for PDF ── */
  const displayBlocks = blocks.map((block) =>
    block.type === 'test' && !block.static
      ? {
          ...block,
          content: getTestContent(block.testId),
          status: getTestStatus(block.testId),
        }
      : block
  )

  const isLoading =
    !isReady ||
    (templateId && templatesApi.isFetching) ||
    availableTestsApi.isFetching ||
    (!!currentTenant && testsApi.isFetching)

  /* ── Gate: loading state with skeletons ── */
  if (isLoading) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Container maxWidth={false}>
          <Stack spacing={2}>
            {/* Header skeleton */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="text" width={200} height={40} />
              </Stack>
              <Stack direction="row" spacing={1}>
                <Skeleton variant="rounded" width={120} height={32} />
                <Skeleton variant="rounded" width={100} height={32} />
                <Skeleton variant="rounded" width={120} height={32} />
                <Skeleton variant="rounded" width={110} height={32} />
              </Stack>
            </Stack>

            {/* Add Block card skeleton */}
            <Card>
              <CardHeader title={<Skeleton variant="text" width={100} />} />
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Skeleton variant="rounded" width="25%" height={40} />
                  <Skeleton variant="rounded" width={80} height={32} />
                </Stack>
              </CardContent>
            </Card>

            {/* Block skeletons */}
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader
                  title={<Skeleton variant="text" width={180} />}
                  action={<Skeleton variant="rounded" width={60} height={24} />}
                />
                <CardContent>
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="90%" />
                  <Skeleton variant="text" width="75%" />
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Container>
      </Box>
    )
  }

  /* ── Builder view ── */
  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <Container maxWidth={false}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton size="small" onClick={handleBackClick}>
                  <ArrowBack />
                </IconButton>
                <Typography variant="h4">
                  {saveForm.watch('templateName') || 'New Report'}
                </Typography>
                {currentTenant && <Chip label={currentTenant} size="small" variant="outlined" />}
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Save />}
                  onClick={() => setSaveOpen(true)}
                  disabled={blocks.length === 0}
                >
                  Save Template
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Schedule />}
                  onClick={() => {
                    const tplName = saveForm.getValues('templateName') || 'Report'
                    scheduleForm.setValue('scheduleName', `Scheduled ${tplName} - ${currentTenant}`)
                    setScheduleOpen(true)
                  }}
                  disabled={blocks.length === 0 || !currentTenant}
                >
                  Schedule
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleDownload}
                  disabled={blocks.length === 0}
                >
                  Download PDF
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<PictureAsPdf />}
                  onClick={() => setPreviewOpen(true)}
                  disabled={blocks.length === 0}
                >
                  Preview PDF
                </Button>
              </Stack>
            </Stack>

            {!currentTenant && (
              <Alert severity="info">
                Select a tenant to load live test results. Custom blocks work without a tenant.
              </Alert>
            )}

            {/* Report Settings */}
            <CippButtonCard title="Report Settings">
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 3 }}>
                  <CippFormComponent
                    type="autoComplete"
                    name="blockType"
                    label="Block Type"
                    formControl={addBlockForm}
                    multiple={false}
                    options={[
                      { label: 'Custom Block', value: 'blank' },
                      { label: 'Test Result', value: 'test' },
                    ]}
                  />
                </Grid>
                <CippFormCondition
                  field="blockType"
                  compareType="valueEq"
                  compareValue="test"
                  formControl={addBlockForm}
                  clearOnHide={true}
                >
                  <Grid size={{ xs: 12, md: 4 }}>
                    <CippFormComponent
                      type="autoComplete"
                      name="selectedTest"
                      label="Select Tests"
                      formControl={addBlockForm}
                      multiple={true}
                      options={allTestOptions}
                      isFetching={availableTestsApi.isFetching}
                    />
                  </Grid>
                </CippFormCondition>
                <Grid size={{ xs: 12, md: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={handleAddBlock}
                    disabled={addDisabled}
                  >
                    Add Block
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <CippFormComponent
                    type="switch"
                    name="removeRemediation"
                    label="Remove Remediation recommendations"
                    formControl={settingsForm}
                  />
                </Grid>
              </Grid>
            </CippButtonCard>

            {/* Blocks */}
            {blocks.length === 0 ? (
              <Alert severity="info">
                No blocks added yet. Use the controls above to add test results or custom content
                blocks.
              </Alert>
            ) : (
              <Stack spacing={2}>
                {blocks.map((block, index) => {
                  const displayBlock =
                    block.type === 'test' && !block.static
                      ? {
                          ...block,
                          content: getTestContent(block.testId),
                          status: getTestStatus(block.testId),
                        }
                      : block
                  return (
                    <ReportBlock
                      key={block.id}
                      block={displayBlock}
                      index={index}
                      totalBlocks={blocks.length}
                      onRemove={handleRemoveBlock}
                      onUpdate={handleUpdateBlock}
                      onRevert={handleRevertBlock}
                      onMoveUp={handleMoveBlockUp}
                      onMoveDown={handleMoveBlockDown}
                    />
                  )
                })}
              </Stack>
            )}
          </Stack>
        </Container>
      </Box>

      {/* ── PDF Preview Dialog ── */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="xl"
        fullWidth
        sx={{ '& .MuiDialog-paper': { height: '95vh', maxHeight: '95vh' } }}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="h6">Report Preview</Typography>
          <IconButton onClick={() => setPreviewOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0, height: '100%' }}>
          {previewOpen && (
            <ReportBuilderPDF
              blocks={displayBlocks}
              tenantName={tenantDisplayName}
              templateName={saveForm.getValues('templateName') || 'Custom Report'}
              brandingSettings={brandingSettings}
              mode="preview"
            />
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" startIcon={<Download />} onClick={handleDownload}>
            Download PDF
          </Button>
          <Button onClick={() => setPreviewOpen(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Save Template Dialog ── */}
      <Dialog open={saveOpen} onClose={() => setSaveOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Report Template</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <CippFormComponent
              type="textField"
              name="templateName"
              label="Template Name"
              formControl={saveForm}
              validators={{ required: 'Template name is required' }}
            />
            <CippApiResults apiObject={saveTemplateCall} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveTemplate}
            disabled={saveTemplateCall.isPending}
          >
            {saveTemplateCall.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Schedule Dialog ── */}
      <Dialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Report Generation</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <CippFormComponent
              type="textField"
              name="scheduleName"
              label="Task Name"
              formControl={scheduleForm}
            />
            <CippFormComponent
              type="autoComplete"
              name="recurrence"
              label="Recurrence"
              formControl={scheduleForm}
              options={[
                { label: 'Once', value: '0' },
                { label: 'Every day', value: '1d' },
                { label: 'Every 7 days', value: '7d' },
                { label: 'Every 30 days', value: '30d' },
                { label: 'Every 90 days', value: '90d' },
              ]}
              multiple={false}
            />
            <CippFormComponent
              type="autoComplete"
              name="postExecution"
              label="Post Execution Actions"
              formControl={scheduleForm}
              options={[
                { label: 'Email', value: 'Email' },
                { label: 'Webhook', value: 'Webhook' },
                { label: 'PSA', value: 'PSA' },
              ]}
              multiple={true}
            />
            {currentTenant && (
              <Alert severity="info">
                Report will be generated for <strong>{currentTenant}</strong> using the current
                block configuration.
              </Alert>
            )}
            <CippApiResults apiObject={scheduleCall} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleScheduleReport}
            disabled={scheduleCall.isPending}
          >
            {scheduleCall.isPending ? 'Scheduling...' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
