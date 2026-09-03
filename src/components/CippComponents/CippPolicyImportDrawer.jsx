import { useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import {
  Button,
  Stack,
  TextField,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { useForm, useWatch } from 'react-hook-form'
import { CippOffCanvas } from './CippOffCanvas'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import CippJsonView from '../CippFormPages/CippJSONView'
import { CippApiResults } from './CippApiResults'
import { CippFormTenantSelector } from './CippFormTenantSelector'
import { CippTemplateCatalog } from './CippTemplateCatalog'

const modeConfig = {
  Intune: {
    label: 'Intune Policy',
    types: ['IntuneTemplate'],
    tenantSource: true,
    relatedQueryKeys: ['ListIntuneTemplates-table', 'ListIntuneTemplates-autcomplete'],
  },
  ConditionalAccess: {
    label: 'Conditional Access',
    types: ['CATemplate'],
    tenantSource: true,
    relatedQueryKeys: ['ListCATemplates-table'],
  },
  Standards: {
    label: 'Standards',
    types: ['StandardsTemplate', 'StandardsTemplateV2'],
    tenantSource: true,
    relatedQueryKeys: ['listStandardTemplates'],
  },
  ReportBuilder: {
    label: 'Report Template',
    types: ['ReportBuilderTemplate'],
    tenantSource: false,
    relatedQueryKeys: ['ListReportBuilderTemplates'],
  },
  CustomTest: {
    label: 'Custom Test',
    types: ['CustomTest'],
    tenantSource: false,
    relatedQueryKeys: ['Custom Tests'],
  },
  SensitiveInfoType: {
    label: 'Sensitive Info Type',
    types: ['SensitiveInfoTypeTemplate'],
    tenantSource: false,
    relatedQueryKeys: ['ListSensitiveInfoTypeTemplates'],
  },
  RetentionCompliancePolicy: {
    label: 'Retention Policy',
    types: ['RetentionCompliancePolicyTemplate'],
    tenantSource: false,
    relatedQueryKeys: ['ListRetentionCompliancePolicyTemplates'],
  },
  SensitivityLabel: {
    label: 'Sensitivity Label',
    types: ['SensitivityLabelTemplate'],
    tenantSource: false,
    relatedQueryKeys: ['ListSensitivityLabelTemplates'],
  },
  DlpCompliancePolicy: {
    label: 'DLP Policy',
    types: ['DlpCompliancePolicyTemplate'],
    tenantSource: false,
    relatedQueryKeys: ['ListDlpCompliancePolicyTemplates'],
  },
}

export const CippPolicyImportDrawer = ({
  buttonText = 'Browse Catalog',
  requiredPermissions = [],
  PermissionButton = Button,
  mode = 'Intune',
}) => {
  const config = modeConfig[mode] ?? modeConfig.Intune
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [sourceMode, setSourceMode] = useState('catalog')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingPolicy, setViewingPolicy] = useState(null)
  const formControl = useForm()

  const tenantFilter = useWatch({ control: formControl.control, name: 'tenantFilter' })

  const tenantPolicies = ApiGetCall({
    url:
      mode === 'ConditionalAccess'
        ? `/api/ListConditionalAccessPolicies?TenantFilter=${tenantFilter?.value || ''}`
        : mode === 'Standards'
          ? `/api/listStandardTemplates?TenantFilter=${tenantFilter?.value || ''}`
          : `/api/ListIntunePolicy?type=ESP&TenantFilter=${tenantFilter?.value || ''}`,
    queryKey: `TenantPolicies-${mode}-${tenantFilter?.value || 'none'}`,
    waiting: sourceMode === 'tenant' && !!tenantFilter?.value,
  })

  const importPolicy = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: config.relatedQueryKeys,
  })

  const handleImportPolicy = (policy) => {
    if (!policy) return

    try {
      if (mode === 'ConditionalAccess') {
        // For Conditional Access, convert RawJSON to object and send the contents
        let policyData = policy

        // If the policy has rawjson, parse it and use that as the data.
        // ListConditionalAccessPolicies returns the raw Graph policy as lowercase `rawjson`.
        const rawJson = policy.rawjson ?? policy.RawJSON
        if (rawJson) {
          try {
            policyData = JSON.parse(rawJson)
          } catch (e) {
            console.error('Failed to parse rawjson:', e)
            policyData = policy
          }
        }

        importPolicy.mutate({
          url: '/api/AddCATemplate',
          data: {
            tenantFilter: tenantFilter?.value,
            ...policyData,
          },
        })
      } else if (mode === 'Standards') {
        // For Standards templates, clone the template
        importPolicy.mutate({
          url: '/api/AddStandardsTemplate',
          data: {
            tenantFilter: tenantFilter?.value,
            templateId: policy.GUID,
            clone: true,
          },
        })
      } else {
        // For Intune policies, use existing format
        importPolicy.mutate({
          url: '/api/AddIntuneTemplate',
          data: {
            tenantFilter: tenantFilter?.value,
            ID: policy.id,
            URLName: policy.URLName || 'GroupPolicyConfigurations',
          },
        })
      }
    } catch (error) {
      console.error('Error importing policy:', error)
    }
  }

  const handleViewPolicy = (policy) => {
    if (!policy) return

    // ConditionalAccess returns the Graph policy as lowercase `rawjson`.
    const rawJson = policy?.rawjson ?? policy?.RawJSON
    if (mode === 'ConditionalAccess' && rawJson) {
      try {
        setViewingPolicy(JSON.parse(rawJson))
      } catch (e) {
        console.error('Failed to parse rawjson for view:', e)
        setViewingPolicy(policy || {})
      }
    } else {
      setViewingPolicy(policy || {})
    }
    setViewDialogOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerVisible(false)
    setSearchQuery('')
    setViewingPolicy(null)
  }

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false)
    setViewingPolicy(null)
  }

  const formatPolicyName = (policy) => {
    if (!policy) return 'Unnamed Policy'
    return policy.displayName || policy.name || policy.templateName || 'Unnamed Policy'
  }

  // Tenant policies list
  let availablePolicies = []
  if (sourceMode === 'tenant' && tenantPolicies.isSuccess && tenantFilter?.value) {
    const tpData = tenantPolicies.data
    if (Array.isArray(tpData)) {
      availablePolicies = tpData
    } else if (Array.isArray(tpData?.Results)) {
      availablePolicies = tpData.Results
    } else if (tpData?.Results && typeof tpData.Results === 'object') {
      availablePolicies = Object.values(tpData.Results).filter(Boolean)
    } else {
      availablePolicies = []
    }
  }

  const filteredPolicies = (() => {
    if (!Array.isArray(availablePolicies)) return []
    if (!searchQuery?.trim()) return availablePolicies
    return availablePolicies.filter((policy) => {
      if (!policy) return false
      const searchLower = searchQuery.toLowerCase()
      return (
        policy.displayName?.toLowerCase().includes(searchLower) ||
        policy.description?.toLowerCase().includes(searchLower) ||
        policy.name?.toLowerCase().includes(searchLower)
      )
    })
  })()

  return (
    <>
      <PermissionButton
        {...(PermissionButton === Button ? {} : { requiredPermissions })}
        onClick={() => setDrawerVisible(true)}
        startIcon={<CippIcons.CloudUpload />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title={`Browse ${config.label} Catalog`}
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="xl"
        footer={
          <Stack direction="row" spacing={2} sx={{
            justifyContent: "flex-start"
          }}>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </Stack>
        }
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          {config.tenantSource && (
            <Box sx={{ flexShrink: 0, mb: 2 }}>
              <ToggleButtonGroup
                value={sourceMode}
                exclusive
                size="small"
                onChange={(e, newMode) => {
                  if (newMode !== null) setSourceMode(newMode)
                }}
              >
                <ToggleButton value="catalog">Community Catalog</ToggleButton>
                <ToggleButton value="tenant">From a Tenant</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}

          {sourceMode === 'catalog' ? (
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <CippTemplateCatalog
                variant="drawer"
                typeFilter={config.types}
                relatedQueryKeys={config.relatedQueryKeys}
              />
            </Box>
          ) : (
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <Box sx={{ mb: 3 }}>
                <CippFormTenantSelector
                  formControl={formControl}
                  name="tenantFilter"
                  required={true}
                  disableClearable={false}
                  allTenants={false}
                  type="single"
                />
              </Box>

              <TextField
                fullWidth
                label="Search Policies"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by policy name or description..."
                sx={{ mb: 2 }}
                slotProps={{
                  input: {
                    startAdornment: <CippIcons.Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }
                }}
              />

              <Typography variant="h6" sx={{ mb: 1 }}>
                Available Policies ({filteredPolicies.length})
              </Typography>

              <Box sx={{ flexGrow: 1, overflow: 'auto', minHeight: 0 }}>
                {tenantPolicies.isLoading ? (
                  <>
                    {[...Array(3)].map((_, index) => (
                      <Box key={index} sx={{ mb: 3 }}>
                        <Stack
                          direction="row"
                          spacing={2}
                          sx={{
                            alignItems: "center",
                            mb: 1
                          }}>
                          <Skeleton variant="rectangular" width={80} height={36} />
                          <Skeleton variant="rectangular" width={120} height={36} />
                          <Skeleton variant="text" width={300} height={32} />
                        </Stack>
                        <Skeleton variant="text" width={200} height={20} />
                      </Box>
                    ))}
                  </>
                ) : Array.isArray(filteredPolicies) && filteredPolicies.length > 0 ? (
                  filteredPolicies.map((policy, index) => {
                    if (!policy) return null
                    return (
                      <Box key={policy.id || policy.GUID || index} sx={{ mb: 3 }}>
                        <Stack
                          direction="row"
                          spacing={2}
                          sx={{
                            alignItems: "flex-start",
                            mb: 1
                          }}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleImportPolicy(policy)}
                            disabled={importPolicy.isPending}
                            sx={{ minWidth: 80, flexShrink: 0 }}
                          >
                            Import
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<CippIcons.EyeIcon />}
                            onClick={() => handleViewPolicy(policy)}
                            sx={{ minWidth: 120, flexShrink: 0 }}
                          >
                            View Policy
                          </Button>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>
                              {formatPolicyName(policy)}
                            </Typography>
                            {policy?.description && (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "text.secondary",
                                  mt: 0.5
                                }}>
                                {policy.description}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })
                ) : tenantFilter?.value ? (
                  <Typography variant="body2" sx={{
                    color: "text.secondary"
                  }}>
                    No policies available.
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{
                    color: "text.secondary"
                  }}>
                    Select a tenant to browse its policies.
                  </Typography>
                )}
              </Box>

              <Box sx={{ flexShrink: 0 }}>
                <CippApiResults apiObject={tenantPolicies} errorsOnly />
                <CippApiResults apiObject={importPolicy} />
              </Box>
            </Box>
          )}
        </Box>
      </CippOffCanvas>

      <Dialog fullWidth maxWidth="xl" open={viewDialogOpen} onClose={handleCloseViewDialog}>
        <DialogTitle>Policy Details</DialogTitle>
        <DialogContent>
          <CippJsonView
            object={viewingPolicy || {}}
            type={
              mode === 'ConditionalAccess'
                ? 'conditionalaccess'
                : mode === 'Standards'
                  ? 'standards'
                  : 'intune'
            }
            defaultOpen={true}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleCloseViewDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
