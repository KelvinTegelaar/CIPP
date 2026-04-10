import { useState, useEffect } from 'react'
import {
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Box,
  Chip,
  Tab,
  Tabs,
  Paper,
  Stack,
} from '@mui/material'
import { Grid } from '@mui/system'
import { useForm, useFormState, useWatch } from 'react-hook-form'
import { Add, Edit } from '@mui/icons-material'
import { CippOffCanvas } from './CippOffCanvas'
import CippFormComponent from './CippFormComponent'
import { CippApiResults } from './CippApiResults'
import { ApiPostCall, ApiGetCall } from '../../api/ApiCall'

export const CippAddTestReportDrawer = ({
  buttonText = 'Create Suite',
  mode = 'create',
  reportToEdit = null,
  disabled = false,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const isEditMode = mode === 'edit'

  const formControl = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      IdentityTests: [],
      DevicesTests: [],
      CustomTests: [],
    },
  })

  const { isValid } = useFormState({ control: formControl.control })
  const selectedIdentityTests =
    useWatch({ control: formControl.control, name: 'IdentityTests' }) || []
  const selectedDeviceTests = useWatch({ control: formControl.control, name: 'DevicesTests' }) || []
  const selectedCustomTests = useWatch({ control: formControl.control, name: 'CustomTests' }) || []

  const createReport = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ['ListTestReports', '*-ListTests-*'],
  })

  // Fetch available tests for the form
  const availableTestsApi = ApiGetCall({
    url: '/api/ListAvailableTests',
    queryKey: 'ListAvailableTests',
  })

  const availableTests = availableTestsApi.data || {
    IdentityTests: [],
    DevicesTests: [],
    CustomTests: [],
  }

  // Reset form fields on successful creation
  useEffect(() => {
    if (createReport.isSuccess) {
      if (!isEditMode) {
        formControl.reset({
          name: '',
          description: '',
          IdentityTests: [],
          DevicesTests: [],
          CustomTests: [],
        })
      }
    }
  }, [createReport.isSuccess, formControl, isEditMode])

  useEffect(() => {
    if (drawerVisible && isEditMode && reportToEdit) {
      formControl.reset({
        name: reportToEdit.name || '',
        description: reportToEdit.description || '',
        IdentityTests: reportToEdit.IdentityTests || [],
        DevicesTests: reportToEdit.DevicesTests || [],
        CustomTests: reportToEdit.CustomTests || [],
      })
    }
  }, [drawerVisible, isEditMode, reportToEdit, formControl])

  const handleSubmit = () => {
    formControl.trigger()
    if (!isValid) {
      return
    }

    const values = formControl.getValues()
    Object.keys(values).forEach((key) => {
      if (values[key] === '' || values[key] === null) {
        delete values[key]
      }
    })

    if (isEditMode && reportToEdit?.id) {
      values.ReportId = reportToEdit.id
    }

    createReport.mutate({
      url: '/api/AddTestReport',
      data: values,
    })
  }

  const handleCloseDrawer = () => {
    createReport.reset()
    setDrawerVisible(false)
    setSearchTerm('')
    setActiveTab(0)
    formControl.reset({
      name: '',
      description: '',
      IdentityTests: [],
      DevicesTests: [],
      CustomTests: [],
    })
  }

  const toggleTest = (testId, testType) => {
    const fieldMap = {
      Identity: 'IdentityTests',
      Devices: 'DevicesTests',
      Custom: 'CustomTests',
    }
    const fieldName = fieldMap[testType] || 'IdentityTests'
    const currentTests = formControl.getValues(fieldName) || []

    if (currentTests.includes(testId)) {
      formControl.setValue(
        fieldName,
        currentTests.filter((id) => id !== testId),
        { shouldValidate: true }
      )
    } else {
      formControl.setValue(fieldName, [...currentTests, testId], { shouldValidate: true })
    }
  }

  const isTestSelected = (testId, testType) => {
    if (testType === 'Identity') {
      return selectedIdentityTests.includes(testId)
    }
    if (testType === 'Devices') {
      return selectedDeviceTests.includes(testId)
    }
    return selectedCustomTests.includes(testId)
  }

  const filterTests = (tests) => {
    if (!searchTerm) return tests
    return tests.filter(
      (test) =>
        test.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const currentTests =
    activeTab === 0
      ? filterTests(availableTests.IdentityTests || [])
      : activeTab === 1
        ? filterTests(availableTests.DevicesTests || [])
        : filterTests(availableTests.CustomTests || [])

  const currentTestType = activeTab === 0 ? 'Identity' : activeTab === 1 ? 'Devices' : 'Custom'

  return (
    <>
      <Button
        variant="contained"
        sx={{
          minWidth: 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          fontWeight: 'bold',
          textTransform: 'none',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'all 0.2s ease-in-out',
          px: 2,
        }}
        onClick={() => setDrawerVisible(true)}
        startIcon={isEditMode ? <Edit /> : <Add />}
        disabled={disabled}
      >
        <Box
          component="span"
          sx={{
            minWidth: 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {buttonText}
        </Box>
      </Button>
      <CippOffCanvas
        title={isEditMode ? 'Edit Test Suite' : 'Create Test Suite'}
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <CippApiResults apiObject={createReport} />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={formControl.handleSubmit(handleSubmit)}
                disabled={createReport.isPending || !isValid}
              >
                {createReport.isPending
                  ? isEditMode
                    ? 'Updating...'
                    : 'Creating...'
                  : createReport.isSuccess
                    ? isEditMode
                      ? 'Updated'
                      : 'Create Another'
                    : isEditMode
                      ? 'Update Test Suite'
                      : 'Create Test Suite'}
              </Button>
              <Button variant="outlined" onClick={handleCloseDrawer}>
                Close
              </Button>
            </div>
          </div>
        }
      >
        <Grid
          container
          spacing={3}
          sx={{ height: '100%', minHeight: 0, alignContent: 'flex-start' }}
        >
          {/* Test Suite Details Section */}
          <Grid size={12}>
            <Paper sx={{ p: 3, backgroundColor: 'background.default' }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Test Suite Details
              </Typography>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <CippFormComponent
                    type="textField"
                    label="Name"
                    name="name"
                    formControl={formControl}
                    validators={{
                      required: 'Name is required',
                      maxLength: { value: 256, message: 'Name must be 256 characters or fewer' },
                    }}
                  />
                </Grid>
                <Grid size={12}>
                  <CippFormComponent
                    type="textField"
                    label="Description"
                    name="description"
                    formControl={formControl}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Selection Summary */}
          <Grid size={12}>
            <Paper sx={{ p: 2, backgroundColor: 'primary.50' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="subtitle2" color="primary">
                  Selected Tests:
                </Typography>
                <Chip
                  label={`${selectedIdentityTests.length} Identity`}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`${selectedDeviceTests.length} Device`}
                  color="secondary"
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`${selectedCustomTests.length} Custom`}
                  color="info"
                  size="small"
                  variant="outlined"
                />
                <Box sx={{ flex: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Total:{' '}
                  {selectedIdentityTests.length +
                    selectedDeviceTests.length +
                    selectedCustomTests.length}{' '}
                  tests
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          {/* Test Selection Section */}
          <Grid size={12} sx={{ display: 'flex', minHeight: 0, flexGrow: 1 }}>
            <Paper
              sx={{
                p: 0,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                maxHeight: 'calc(100vh - 535px)',
              }}
            >
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => {
                    setActiveTab(newValue)
                    setSearchTerm('')
                  }}
                  variant="fullWidth"
                >
                  <Tab
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>Identity Tests</span>
                        {selectedIdentityTests.length > 0 && (
                          <Chip size="small" label={selectedIdentityTests.length} color="primary" />
                        )}
                      </Box>
                    }
                  />
                  <Tab
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>Device Tests</span>
                        {selectedDeviceTests.length > 0 && (
                          <Chip size="small" label={selectedDeviceTests.length} color="secondary" />
                        )}
                      </Box>
                    }
                  />
                  <Tab
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>Custom Tests</span>
                        {selectedCustomTests.length > 0 && (
                          <Chip size="small" label={selectedCustomTests.length} color="info" />
                        )}
                      </Box>
                    }
                  />
                </Tabs>
              </Box>

              {/* Search Bar */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={`Search ${currentTestType} tests...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Box>

              {/* Test List */}
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  p: 2,
                }}
              >
                {availableTestsApi.isFetching ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">Loading tests...</Typography>
                  </Box>
                ) : currentTests.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      {searchTerm ? 'No tests found matching your search' : 'No tests available'}
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={1}>
                    {currentTests.map((test) => {
                      const isSelected = isTestSelected(test.id, currentTestType)
                      return (
                        <Grid size={12} key={test.id}>
                          <Card
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              border: 1,
                              borderColor: isSelected ? 'primary.main' : 'divider',
                              backgroundColor: isSelected ? 'primary.50' : 'background.paper',
                              '&:hover': {
                                borderColor: 'primary.main',
                                boxShadow: 2,
                              },
                            }}
                            onClick={() => toggleTest(test.id, currentTestType)}
                          >
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1,
                                      mb: 0.5,
                                    }}
                                  >
                                    <Chip
                                      label={test.id}
                                      size="small"
                                      color={isSelected ? 'primary' : 'default'}
                                      sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                                    />
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: isSelected ? 600 : 400,
                                        color: isSelected ? 'primary.main' : 'text.primary',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {test.name}
                                    </Typography>
                                  </Box>
                                  {test.description && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                      }}
                                    >
                                      {test.description}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      )
                    })}
                  </Grid>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </CippOffCanvas>
    </>
  )
}
