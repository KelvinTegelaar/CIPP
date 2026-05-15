import React from 'react'
import { Edit, Sync, PlayArrow, PictureAsPdf } from '@mui/icons-material'
import { CippFormTemplateTenantSelector } from '../../../components/CippComponents/CippFormTemplateTenantSelector.jsx'

/**
 * Creates the standard drift management actions array
 * @param {Object} options - Configuration options
 * @param {string} options.templateId - The template ID for conditional actions
 * @param {Function} options.onRefresh - Function to call when refresh is triggered
 * @param {Function} options.onGenerateReport - Function to call when generate report is triggered (optional)
 * @returns {Array} Array of action objects
 */
export const createDriftManagementActions = ({
  templateId,
  templateType = 'classic',
  showEditTemplate = false,
  onRefresh,
  onGenerateReport,
  currentTenant,
  templateTenants = [],
  excludedTenants = [],
}) => {
  const actions = [
    {
      label: 'Refresh Data',
      icon: <Sync />,
      noConfirm: true,
      customFunction: onRefresh,
    },
  ]

  // Add Generate Report action if handler is provided
  if (onGenerateReport) {
    actions.push({
      label: 'Generate Report',
      icon: <PictureAsPdf />,
      noConfirm: true,
      customFunction: onGenerateReport,
    })
  }

  // Add template-specific actions if templateId is available
  if (templateId) {
    // Conditionally add Edit Template action
    if (showEditTemplate) {
      actions.push({
        label: 'Edit Template',
        icon: <Edit />,
        color: 'info',
        noConfirm: true,
        customFunction: () => {
          // Use Next.js router for internal navigation
          import('next/router')
            .then(({ default: router }) => {
              router.push(
                `/tenant/standards/templates/template?id=${templateId}&type=${templateType}`
              )
            })
            .catch(() => {
              // Fallback to window.location if router is not available
              window.location.href = `/tenant/standards/templates/template?id=${templateId}&type=${templateType}`
            })
        },
      })
    }

    actions.push({
      label: 'Run Standard Now',
      type: 'GET',
      url: '/api/ExecStandardsRun',
      icon: <PlayArrow />,
      data: {
        TemplateId: templateId,
      },
      customDataformatter: (_row, _action, formData) => ({
        TemplateId: templateId,
        tenantFilter: formData.tenantFilter?.value ?? formData.tenantFilter,
      }),
      children: ({ formHook }) => (
        <CippFormTemplateTenantSelector
          formControl={formHook}
          templateTenants={templateTenants}
          excludedTenants={excludedTenants}
        />
      ),
      confirmText: 'Are you sure you want to force a run of this standard?',
      allowResubmit: true,
      multiPost: false,
    })
  }

  return actions
}

/**
 * Default export for backward compatibility
 */
export default createDriftManagementActions
