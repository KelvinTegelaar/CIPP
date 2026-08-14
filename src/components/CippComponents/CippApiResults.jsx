import {
  Close,
  Download,
  Help,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Error as ErrorIcon,
  RadioButtonUnchecked,
} from '@mui/icons-material'
import {
  Alert,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  Stack,
  Typography,
  Box,
  SvgIcon,
  Tooltip,
  Button,
  keyframes,
} from '@mui/material'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { ApiGetCall } from '../../api/ApiCall'
import { getCippError } from '../../utils/get-cipp-error'
import { CippCopyToClipBoard } from './CippCopyToClipboard'
import { CippDocsLookup } from './CippDocsLookup'
import { CippCodeBlock } from './CippCodeBlock'
import React from 'react'
import { CippTableDialog } from './CippTableDialog'
import { EyeIcon } from '@heroicons/react/24/outline'
import { useDialog } from '../../hooks/use-dialog'

const extractAllResults = (data, extraIgnoreKeys = []) => {
  const results = []

  const getSeverity = (text) => {
    if (typeof text !== 'string') return 'success'
    return /error|failed|exception|not found|invalid_grant/i.test(text) ? 'error' : 'success'
  }

  const processResultItem = (item) => {
    if (typeof item === 'string') {
      return {
        text: item,
        copyField: item,
        severity: getSeverity(item),
      }
    }

    if (item && typeof item === 'object') {
      const text = item.resultText || ''
      const copyField = item.copyField || ''
      const severity =
        typeof item.state === 'string' ? item.state : getSeverity(item) ? 'error' : 'success'
      const details = item.details || null

      if (text) {
        return {
          text,
          copyField,
          severity,
          details,
          ...item,
        }
      }
    }
    return null
  }

  const extractFrom = (obj) => {
    if (!obj) return

    if (Array.isArray(obj)) {
      obj.forEach((item) => extractFrom(item))
      return
    }

    if (typeof obj === 'string') {
      results.push({ text: obj, copyField: obj, severity: getSeverity(obj) })
      return
    }

    if (obj?.resultText) {
      const processed = processResultItem(obj)
      if (processed) {
        results.push(processed)
      }
    } else {
      const ignoreKeys = ['metadata', 'Metadata', 'severity', ...extraIgnoreKeys]

      if (typeof obj === 'object') {
        Object.keys(obj).forEach((key) => {
          const value = obj[key]
          if (ignoreKeys.includes(key)) return
          if (['Results', 'Result', 'results', 'result'].includes(key)) {
            if (Array.isArray(value)) {
              value.forEach((valItem) => {
                const processed = processResultItem(valItem)
                if (processed) {
                  results.push(processed)
                } else {
                  extractFrom(valItem)
                }
              })
            } else if (typeof value === 'object') {
              const processed = processResultItem(value)
              if (processed) {
                results.push(processed)
              } else {
                extractFrom(value)
              }
            } else if (typeof value === 'string') {
              results.push({
                text: value,
                copyField: value,
                severity: getSeverity(value),
              })
            }
          } else {
            extractFrom(value)
          }
        })
      }
    }
  }

  extractFrom(data)
  return results
}

const capitalize = (text) =>
  typeof text === 'string' && text.length > 0 ? text.charAt(0).toUpperCase() + text.slice(1) : text

const JOB_STATUS_CHIP_COLORS = {
  queued: 'default',
  running: 'info',
  succeeded: 'success',
  failed: 'error',
}

// Status icon for a single job step.
const JobStepIcon = ({ status }) => {
  if (status === 'succeeded') return <CheckCircle fontSize="small" color="success" />
  if (status === 'failed') return <ErrorIcon fontSize="small" color="error" />
  if (status === 'running') return <CircularProgress size={16} />
  return <RadioButtonUnchecked fontSize="small" color="disabled" />
}

// Live job progress rows (GDAP-onboarding style): one block per row (usually a tenant) with
// its steps, driven by the jobProgress polling in CippApiResults.
const CippJobProgress = ({ rows }) => (
  <Stack spacing={2}>
    {rows.map((row, rowIndex) => (
      <Box key={row.Tenant ?? row.Name ?? rowIndex}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle2">{row.Tenant ?? row.Name}</Typography>
          <Chip
            size="small"
            label={capitalize(row.Status)}
            color={JOB_STATUS_CHIP_COLORS[row.Status] || 'default'}
            variant={row.Status === 'queued' ? 'outlined' : 'filled'}
          />
        </Stack>
        <Stack spacing={1}>
          {(row.Steps || []).map((step, index) => (
            <Stack direction="row" spacing={1} alignItems="flex-start" key={index}>
              <Box sx={{ pt: 0.25 }}>
                <JobStepIcon status={step.Status} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2">{step.Title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {step.Message}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Box>
    ))}
  </Stack>
)

export const CippApiResults = (props) => {
  const { apiObject, errorsOnly = false, alertSx = {}, jobProgress = null } = props

  const [errorVisible, setErrorVisible] = useState(false)
  const [fetchingVisible, setFetchingVisible] = useState(false)
  const [finalResults, setFinalResults] = useState([])
  const [showDetails, setShowDetails] = useState({})
  const [jobId, setJobId] = useState(null)
  const [jobPollActive, setJobPollActive] = useState(false)
  const tableDialog = useDialog()

  // Optional live job progress: when the mutation result carries jobProgress.idField, poll
  // jobProgress.url(id) until every row reaches a terminal state.
  const jobIdField = jobProgress?.idField ?? 'JobId'
  useEffect(() => {
    if (!jobProgress) return
    if (apiObject.isPending) {
      setJobId(null)
      setJobPollActive(false)
      return
    }
    if (!apiObject.isSuccess) return
    const raw = apiObject?.data?.data ?? apiObject?.data
    const item = Array.isArray(raw) ? raw[0] : raw
    const id = item?.[jobIdField]
    if (id) {
      setJobId(id)
      setJobPollActive(true)
    }
  }, [jobProgress, jobIdField, apiObject.isPending, apiObject.isSuccess, apiObject.data])

  const jobStatus = ApiGetCall({
    url: jobProgress && jobId ? jobProgress.url(jobId) : null,
    queryKey: `CippJobProgress-${jobId}`,
    waiting: !!(jobProgress && jobId),
    refetchInterval: jobPollActive ? (jobProgress?.interval ?? 5000) : false,
    staleTime: 0,
  })
  const jobRows = Array.isArray(jobStatus.data) ? jobStatus.data : []
  useEffect(() => {
    if (
      jobPollActive &&
      jobRows.length > 0 &&
      jobRows.every((row) => row.Status === 'succeeded' || row.Status === 'failed')
    ) {
      setJobPollActive(false)
    }
  }, [jobPollActive, jobRows])
  const pageTitle = `${document.title} - Results`
  const correctResultObj = useMemo(() => {
    if (!apiObject.isSuccess) return

    const data = apiObject?.data
    const dataData = data?.data
    if (dataData !== undefined && dataData !== null) {
      if (dataData?.Results) {
        return dataData.Results
      } else if (typeof dataData === 'object' && dataData !== null && !('metadata' in dataData)) {
        return dataData
      } else if (typeof dataData === 'string') {
        return dataData
      } else {
        return 'This API has not sent the correct output format.'
      }
    }
    if (data?.Results) {
      return data.Results
    } else if (typeof data === 'object' && data !== null && !('metadata' in data)) {
      return data
    } else if (typeof data === 'string') {
      return data
    }

    return 'This API has not sent the correct output format.'
  }, [apiObject])

  const allResults = useMemo(() => {
    const sourceItems = Array.isArray(correctResultObj) ? correctResultObj : [correctResultObj]
    // Don't render the job id (e.g. DeploymentId) as a result alert of its own.
    const jobIgnoreKeys = jobProgress ? [jobIdField] : []
    const apiResults = sourceItems.flatMap((item, groupIndex) =>
      extractAllResults(item, jobIgnoreKeys).map((r) => ({ ...r, groupIndex }))
    )

    // Also extract error results if there's an error
    if (apiObject.isError && apiObject.error) {
      const errorData = apiObject.error.response?.data
      const errorItems = Array.isArray(errorData) ? errorData : [errorData]
      const errorResults = errorItems.flatMap((item, index) =>
        extractAllResults(item).map((r) => ({
          ...r,
          severity: 'error',
          groupIndex: sourceItems.length + index,
        }))
      )
      if (errorResults.length > 0) {
        // Mark all error results with error severity and merge with success results
        return [...apiResults, ...errorResults]
      }

      // Fallback to getCippError if extraction didn't work
      const processedError = getCippError(apiObject.error)
      if (typeof processedError === 'string') {
        return [
          ...apiResults,
          {
            text: processedError,
            copyField: processedError,
            severity: 'error',
            groupIndex: sourceItems.length,
          },
        ]
      }
    }

    return apiResults
  }, [correctResultObj, apiObject.isError, apiObject.error, jobProgress, jobIdField])

  useEffect(() => {
    setErrorVisible(!!apiObject.isError)

    if (apiObject.isFetching || (apiObject.isIdle === false && apiObject.isPending === true)) {
      setFetchingVisible(true)
    } else {
      setFetchingVisible(false)
    }
    const resultsToShow = errorsOnly ? allResults.filter((r) => r.severity === 'error') : allResults

    if (resultsToShow.length > 0) {
      setFinalResults(
        resultsToShow.map((res, index) => ({
          id: index,
          text: res.text,
          copyField: res.copyField,
          severity: res.severity,
          visible: true,
          ...res,
        }))
      )
    } else {
      setFinalResults([])
    }
  }, [
    apiObject.isError,
    apiObject.isFetching,
    apiObject.isPending,
    apiObject.isIdle,
    allResults,
    errorsOnly,
  ])

  const handleCloseResult = useCallback((id) => {
    setFinalResults((prev) => prev.map((r) => (r.id === id ? { ...r, visible: false } : r)))
  }, [])

  const toggleDetails = useCallback((id) => {
    setShowDetails((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const handleDownloadCsv = useCallback(() => {
    if (!finalResults?.length) return

    const baseName = document.title.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const fileName = `${baseName}-results.csv`

    const headers = Object.keys(finalResults[0])
    const rows = finalResults.map((item) =>
      headers.map((header) => `"${item[header] || ''}"`).join(',')
    )
    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [finalResults, apiObject])

  const hasVisibleResults = finalResults.some((r) => r.visible)
  const actionGroups = [...new Set(finalResults.map((r) => r.groupIndex ?? r.id))]
  const actionCount = actionGroups.length
  const failedActionCount = actionGroups.filter((group) =>
    finalResults.some((r) => (r.groupIndex ?? r.id) === group && r.severity === 'error')
  ).length
  const successActionCount = actionCount - failedActionCount
  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      {/* Loading alert */}
      {!errorsOnly && (
        <Collapse in={fetchingVisible} unmountOnExit>
          <Alert
            sx={alertSx}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setFetchingVisible(false)}
              >
                <Close fontSize="inherit" />
              </IconButton>
            }
            variant="outlined"
            severity="info"
          >
            <Typography variant="body2">
              <CircularProgress size={20} /> Loading...
            </Typography>
          </Alert>
        </Collapse>
      )}
      {/* Summary rollup for bulk results */}
      {!errorsOnly && hasVisibleResults && actionCount > 1 && (
        <Alert
          sx={alertSx}
          variant="outlined"
          severity={
            failedActionCount === 0 ? 'success' : successActionCount === 0 ? 'error' : 'warning'
          }
        >
          <Typography variant="body2">
            {failedActionCount === 0
              ? `All ${actionCount} actions completed successfully`
              : `${failedActionCount} of ${actionCount} actions failed${
                  successActionCount > 0 ? `, ${successActionCount} succeeded` : ''
                }`}
          </Typography>
        </Alert>
      )}
      {/* Individual result alerts */}
      {hasVisibleResults && (
        <>
          {finalResults.map((resultObj) => (
            <React.Fragment key={resultObj.id}>
              <Collapse in={resultObj.visible} unmountOnExit>
                <Alert
                  sx={{
                    ...alertSx,
                    display: 'flex',
                    width: '100%',
                    '& .MuiAlert-message': {
                      width: '100%',
                      flex: '1 1 auto',
                      minWidth: 0, // Allows content to shrink
                    },
                    '& .MuiAlert-action': {
                      flex: '0 0 auto',
                      alignSelf: 'flex-start',
                      marginLeft: 'auto',
                    },
                  }}
                  variant="filled"
                  severity={resultObj.severity || 'success'}
                  action={
                    <>
                      {resultObj.severity === 'error' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="secondary"
                          startIcon={<Help />}
                          onClick={() => {
                            const searchUrl = `https://docs.cipp.app/?q=Help+with:+${encodeURIComponent(
                              resultObj.copyField || resultObj.text
                            )}&ask=true`
                            window.open(searchUrl, '_blank')
                          }}
                          sx={{
                            ml: 1,
                            mr: 1,
                            backgroundColor: 'white',
                            color: 'error.main',
                            '&:hover': {
                              backgroundColor: 'grey.100',
                            },
                            py: 0.5,
                            px: 1,
                            minWidth: 'auto',
                            fontSize: '0.875rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Get Help
                        </Button>
                      )}
                      <CippCopyToClipBoard
                        color="inherit"
                        text={resultObj.copyField || resultObj.text}
                      />

                      {resultObj.details && (
                        <Tooltip
                          title={showDetails[resultObj.id] ? 'Hide Details' : 'Show Details'}
                        >
                          <IconButton
                            size="small"
                            color="inherit"
                            onClick={() => toggleDetails(resultObj.id)}
                            aria-label={showDetails[resultObj.id] ? 'Hide Details' : 'Show Details'}
                          >
                            {showDetails[resultObj.id] ? (
                              <ExpandLess fontSize="inherit" />
                            ) : (
                              <ExpandMore fontSize="inherit" />
                            )}
                          </IconButton>
                        </Tooltip>
                      )}

                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => handleCloseResult(resultObj.id)}
                      >
                        <Close fontSize="inherit" />
                      </IconButton>
                    </>
                  }
                >
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2">{resultObj.text}</Typography>
                    {resultObj.details && (
                      <Collapse in={showDetails[resultObj.id]}>
                        <Box mt={2} sx={{ width: '100%' }}>
                          <CippCodeBlock
                            code={
                              typeof resultObj.details === 'string'
                                ? resultObj.details
                                : JSON.stringify(resultObj.details, null, 2)
                            }
                            language={typeof resultObj.details === 'object' ? 'json' : 'text'}
                            showLineNumbers={false}
                            type="syntax"
                            readOnly={true}
                          />
                        </Box>
                      </Collapse>
                    )}
                  </Box>
                </Alert>
              </Collapse>
            </React.Fragment>
          ))}
        </>
      )}
      {(apiObject.isSuccess || apiObject.isError) &&
      finalResults?.length > 0 &&
      hasVisibleResults ? (
        <Box display="flex" flexDirection="row">
          <Tooltip title="View Results">
            <IconButton onClick={() => tableDialog.handleOpen()}>
              <SvgIcon>
                <EyeIcon />
              </SvgIcon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Download Results">
            <IconButton aria-label="download-csv" onClick={handleDownloadCsv}>
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
      ) : null}
      {/* Live job progress (opt-in via the jobProgress prop) */}
      {jobProgress && jobId && (
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6">{jobProgress.title ?? 'Progress'}</Typography>
            {jobPollActive && <CircularProgress size={16} />}
          </Stack>
          {jobRows.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Waiting for the first status update...
            </Typography>
          ) : (
            <CippJobProgress rows={jobRows} />
          )}
        </Box>
      )}
      {tableDialog.open && (
        <CippTableDialog
          createDialog={tableDialog}
          title={pageTitle}
          data={finalResults}
          noCard={true}
          simpleColumns={['severity', 'text', 'copyField']}
        />
      )}
    </Stack>
  )
}
