import {
  Button,
  Link,
  Stack,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Paper,
  IconButton,
} from '@mui/material'
import { CippWizardStepButtons } from './CippWizardStepButtons'
import CippFormComponent from '../CippComponents/CippFormComponent'
import { CippDataTable } from '../CippTable/CippDataTable'
import { useWatch } from 'react-hook-form'
import { Delete, FileDownload, Upload, Add } from '@mui/icons-material'
import { useEffect, useState } from 'react'
import React from 'react'
import { useIsMobileLayout } from '../../hooks/use-breakpoint'

// Modified version of CippWizardAutopilotImport for corporate device identifiers
// (Autopilot device preparation): every device is a manufacturer, model and serial
// number triplet that Graph combines into a single comma-separated identifier, so
// all three fields are required and none of them may contain a comma.
export const CippWizardDevicePrepImport = (props) => {
  const {
    onNextStep,
    formControl,
    currentStep,
    onPreviousStep,
    fields,
    name,
    fileName = 'template',
  } = props
  const tableData = useWatch({ control: formControl.control, name: name })
  // Seed from the form so navigating back to this step keeps the imported rows
  const [newTableData, setTableData] = useState(
    () => formControl.getValues(name) || []
  )
  const fileInputRef = React.useRef(null)
  const [manualDialogOpen, setManualDialogOpen] = useState(false)
  const [manualInputs, setManualInputs] = useState([{}])
  const inputRefs = React.useRef([])
  const isMobile = useIsMobileLayout()
  const [validationErrors, setValidationErrors] = useState([])
  const [importErrors, setImportErrors] = useState([])

  // At least one identifier is needed before the wizard can continue
  formControl.register(name, {
    validate: (value) => Array.isArray(value) && value.length > 0,
  })

  const handleRemoveItem = (row) => {
    if (row === undefined) return false
    const index = tableData?.findIndex((item) => item === row)
    const newTableData = [...tableData]
    newTableData.splice(index, 1)
    setTableData(newTableData)
  }

  const collectRowErrors = (rows) => {
    const errors = []
    const seenIdentifiers = new Set()

    rows.forEach((row, index) => {
      const missingFields = fields.filter(
        (field) =>
          !row[field.propertyName] || row[field.propertyName].trim() === ''
      )
      if (missingFields.length > 0) {
        errors.push(
          `Row ${index + 1}: ${missingFields.map((f) => f.friendlyName).join(', ')} ${
            missingFields.length === 1 ? 'is' : 'are'
          } required`
        )
        return
      }

      const commaFields = fields.filter((field) =>
        row[field.propertyName].includes(',')
      )
      if (commaFields.length > 0) {
        errors.push(
          `Row ${index + 1}: ${commaFields
            .map((f) => f.friendlyName)
            .join(', ')} may not contain a comma`
        )
        return
      }

      const identifier = fields
        .map((field) => row[field.propertyName].trim().toLowerCase())
        .join(',')
      if (seenIdentifiers.has(identifier)) {
        errors.push(`Row ${index + 1}: Duplicate device "${identifier}"`)
      }
      seenIdentifiers.add(identifier)
    })

    return errors
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result
        const lines = text.split('\n')
        const firstLine = lines[0].split(',').map((header) => header.trim())

        // Check if this is a headerless CSV (no recognizable headers). The Intune
        // portal's corporate identifier CSV has no header row.
        const hasHeaders = firstLine.some((header) => {
          return fields.some(
            (field) =>
              header === field.propertyName ||
              header === field.friendlyName ||
              (field.alternativePropertyNames &&
                field.alternativePropertyNames.includes(header))
          )
        })

        let headers, headerMapping

        if (hasHeaders) {
          headers = firstLine

          // Create mapping for property names and alternative property names
          headerMapping = {}
          fields.forEach((field) => {
            headerMapping[field.propertyName] = field.propertyName
            headerMapping[field.friendlyName] = field.propertyName
            if (field.alternativePropertyNames) {
              field.alternativePropertyNames.forEach((altName) => {
                headerMapping[altName] = field.propertyName
              })
            }
          })

          // All three columns are required for corporate identifiers
          const missingColumns = fields.filter((field) => {
            const hasPropertyName = headers.includes(field.propertyName)
            const hasFriendlyName = headers.includes(field.friendlyName)
            const hasAlternativeName = field.alternativePropertyNames
              ? field.alternativePropertyNames.some((altName) =>
                  headers.includes(altName)
                )
              : false
            return !hasPropertyName && !hasFriendlyName && !hasAlternativeName
          })

          if (missingColumns.length > 0) {
            const missingFormats = missingColumns
              .map((f) => {
                const formats = [f.propertyName, f.friendlyName]
                if (f.alternativePropertyNames) {
                  formats.push(...f.alternativePropertyNames)
                }
                return `"${formats.join('" or "')}"`
              })
              .join(', ')
            setImportErrors([
              `CSV is missing required columns: ${missingFormats}`,
            ])
            return
          }
        } else {
          // Headerless CSV - assume the Intune portal order: manufacturer, model, serial number
          headers = fields.map((field) => field.propertyName)
          headerMapping = {}
          headers.forEach((header) => {
            headerMapping[header] = header
          })

          if (firstLine.length < fields.length) {
            setImportErrors([
              `Headerless CSV must have ${fields.length} columns in order: ${fields
                .map((f) => f.friendlyName)
                .join(', ')}`,
            ])
            return
          }
        }

        const data = lines
          .slice(hasHeaders ? 1 : 0) // Skip first line only if it has headers
          .filter((line) => line.trim() !== '') // Remove empty lines
          .map((line) => {
            const values = line.split(',')
            const row = fields.reduce((obj, field) => {
              obj[field.propertyName] = ''
              return obj
            }, {})
            headers.forEach((header, i) => {
              const propertyName = headerMapping[header]
              if (propertyName) {
                row[propertyName] = values[i]?.trim() || ''
              }
            })
            return row
          })

        const errors = collectRowErrors(data)
        if (errors.length > 0) {
          setImportErrors(errors)
          return
        }

        setImportErrors([])
        setTableData(data)
        formControl.setValue(name, data, { shouldValidate: true })
      }
      reader.readAsText(file)
    }
  }

  const handleManualInputChange = (rowIndex, field, value) => {
    setManualInputs((prev) => {
      const newInputs = [...prev]
      if (!newInputs[rowIndex]) {
        newInputs[rowIndex] = {}
      }
      newInputs[rowIndex][field] = value
      return newInputs
    })
  }

  const handleAddRow = () => {
    setManualInputs((prev) => [...prev, {}])
  }

  const validateRows = (rows) => {
    const errors = collectRowErrors(
      rows.filter((row) =>
        Object.values(row).some((value) => value && value.trim() !== '')
      )
    )
    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleManualAdd = () => {
    const newRows = manualInputs
      .filter((row) =>
        Object.values(row).some((value) => value && value.trim() !== '')
      )
      .map((row) => {
        return fields.reduce((obj, field) => {
          obj[field.propertyName] = row[field.propertyName] || ''
          return obj
        }, {})
      })

    if (newRows.length === 0) {
      setManualDialogOpen(false)
      setManualInputs([{}])
      return
    }

    if (!validateRows(newRows)) {
      return
    }

    const updatedData = [...(tableData || []), ...newRows]
    setTableData(updatedData)
    formControl.setValue(name, updatedData, { shouldValidate: true })
    setManualInputs([{}])
    setManualDialogOpen(false)
  }

  const handleDialogClose = () => {
    setManualDialogOpen(false)
    setManualInputs([{}])
  }

  const lastField = fields[fields.length - 1]

  const handleKeyPress = (event, rowIndex) => {
    if (
      event.key === 'Enter' &&
      manualInputs[rowIndex]?.[lastField.propertyName]
    ) {
      if (rowIndex === manualInputs.length - 1) {
        const newRowIndex = manualInputs.length
        setManualInputs((prev) => [...prev, {}])
        // Wait for the next render cycle to set focus
        setTimeout(() => {
          const newInput =
            inputRefs.current[newRowIndex]?.[fields[0].propertyName]
          if (newInput) {
            newInput.focus()
          }
        }, 0)
      }
    }
  }

  const handleRemoveRow = (rowIndex) => {
    setManualInputs((prev) => prev.filter((_, index) => index !== rowIndex))
  }

  useEffect(() => {
    formControl.setValue(name, newTableData, {
      shouldValidate: true,
    })
  }, [newTableData])

  // Add effect to validate rows when manualInputs changes
  useEffect(() => {
    validateRows(manualInputs)
  }, [manualInputs])

  const actions = [
    {
      icon: <Delete />,
      label: 'Delete Row',
      confirmText: 'Are you sure you want to delete this row?',
      customFunction: handleRemoveItem,
      noConfirm: true,
    },
  ]

  return (
    <Stack spacing={3}>
      {importErrors.length > 0 && (
        <Alert severity="error" onClose={() => setImportErrors([])}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            The file could not be imported:
          </Typography>
          {importErrors.map((error, index) => (
            <Typography key={index} variant="body2">
              • {error}
            </Typography>
          ))}
        </Alert>
      )}
      <CippDataTable
        actions={actions}
        title={`Import Corporate Identifiers`}
        data={newTableData}
        simple={false}
        simpleColumns={fields.map((f) => f.propertyName)}
        cardButton={
          <Stack direction="row" spacing={1}>
            <Button
              component={Link}
              href={`data:text/csv;charset=utf-8,%EF%BB%BF${encodeURIComponent(
                fields.map((f) => f.propertyName).join(',') + '\n'
              )}`}
              download={`${fileName}.csv`}
              startIcon={<FileDownload />}
              size="small"
            >
              Download Template
            </Button>
            <input
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
            <Button
              startIcon={<Upload />}
              onClick={() => fileInputRef.current?.click()}
              size="small"
            >
              Import from CSV
            </Button>
            <Button
              startIcon={<Add />}
              onClick={() => setManualDialogOpen(true)}
              size="small"
            >
              Manual Import
            </Button>
          </Stack>
        }
      />

      <CippFormComponent
        type="switch"
        label="Overwrite existing identifiers"
        name="overwriteExisting"
        formControl={formControl}
      />

      <Dialog
        open={manualDialogOpen}
        onClose={handleDialogClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Manual Import</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {validationErrors.length > 0 && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  '& .MuiAlert-message': {
                    width: '100%',
                  },
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Please fix the following validation errors:
                </Typography>
                {validationErrors.map((error, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{ mb: index < validationErrors.length - 1 ? 0.5 : 0 }}
                  >
                    • {error}
                  </Typography>
                ))}
              </Alert>
            )}
            {manualInputs.map((row, rowIndex) => {
              // Defined once and placed by either branch, so the two layouts cannot drift.
              const fieldInputs = fields.map((field) => (
                <Box
                  key={field.propertyName}
                  sx={isMobile ? undefined : { minWidth: 150, flex: 1 }}
                >
                  <TextField
                    inputRef={(el) => {
                      if (!inputRefs.current[rowIndex]) {
                        inputRefs.current[rowIndex] = {}
                      }
                      inputRefs.current[rowIndex][field.propertyName] = el
                    }}
                    label={field.friendlyName}
                    value={row[field.propertyName] || ''}
                    onChange={(e) =>
                      handleManualInputChange(
                        rowIndex,
                        field.propertyName,
                        e.target.value
                      )
                    }
                    onKeyDown={(e) =>
                      field.propertyName === lastField.propertyName &&
                      handleKeyPress(e, rowIndex)
                    }
                    fullWidth
                    size="small"
                  />
                </Box>
              ))

              const rowNumber = (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    flexShrink: 0,
                    ml: isMobile ? 0 : 1,
                  }}
                >
                  {rowIndex + 1}
                </Box>
              )

              // Below md one row becomes one card instead of a horizontal scroller.
              if (isMobile) {
                return (
                  <Paper
                    key={rowIndex}
                    variant="outlined"
                    data-testid="manual-row"
                    sx={{ p: 2 }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 2 }}
                      useFlexGap
                    >
                      {rowNumber}
                      <Typography
                        variant="subtitle2"
                        sx={{ flexGrow: 1, minWidth: 0 }}
                        noWrap
                      >
                        Device {rowIndex + 1}
                      </Typography>
                      <IconButton
                        onClick={() => handleRemoveRow(rowIndex)}
                        disabled={manualInputs.length === 1}
                        color="error"
                        aria-label={`Remove device ${rowIndex + 1}`}
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                    <Stack spacing={2}>{fieldInputs}</Stack>
                  </Paper>
                )
              }

              return (
                <Box
                  key={rowIndex}
                  data-testid="manual-row"
                  sx={{
                    display: 'flex',
                    gap: 2,
                    mt: rowIndex === 0 ? 2 : 0,
                    flexWrap: 'nowrap',
                    overflowX: 'auto',
                    py: 0.75,
                    alignItems: 'center',
                    // Keeps the outlined labels legible inside the scroller; the mobile
                    // branch has no scroller and no need for it.
                    '& .MuiInputLabel-root': {
                      backgroundColor: 'background.paper',
                      px: 1,
                      transform: 'translate(14px, -9px) scale(0.75)',
                      '&.Mui-focused': {
                        backgroundColor: 'background.paper',
                      },
                    },
                  }}
                >
                  {rowNumber}
                  {fieldInputs}
                  <Button
                    onClick={() => handleRemoveRow(rowIndex)}
                    disabled={manualInputs.length === 1}
                    sx={{
                      minWidth: '48px',
                      height: '40px',
                      fontSize: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      alignSelf: 'center',
                      mr: 2,
                    }}
                    color="error"
                  >
                    ×
                  </Button>
                </Box>
              )
            })}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                mt: 1,
              }}
            >
              <Button
                onClick={handleAddRow}
                disabled={
                  !Object.values(manualInputs[manualInputs.length - 1]).some(
                    (value) => value && value.trim() !== ''
                  )
                }
                sx={{
                  minWidth: '48px',
                  height: '40px',
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: 'center',
                  mr: 2,
                }}
              >
                +
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleManualAdd}
            variant="contained"
            disabled={
              validationErrors.length > 0 ||
              !Object.values(manualInputs[manualInputs.length - 1]).some(
                (value) => value && value.trim() !== ''
              )
            }
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
      />
    </Stack>
  )
}
