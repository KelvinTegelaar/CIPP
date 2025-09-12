import React from "react";
import { Sync, PlayArrow, PictureAsPdf } from "@mui/icons-material";

/**
 * Creates the standard drift management actions array
 * @param {Object} options - Configuration options
 * @param {string} options.templateId - The template ID for conditional actions
 * @param {Function} options.onRefresh - Function to call when refresh is triggered
 * @param {Function} options.onGenerateReport - Function to call when generate report is triggered (optional)
 * @returns {Array} Array of action objects
 */
export const createDriftManagementActions = ({ templateId, onRefresh, onGenerateReport, currentTenant }) => {
  const actions = [
    {
      label: "Refresh Data",
      icon: <Sync />,
      noConfirm: true,
      customFunction: onRefresh,
    },
  ];

  // Add Generate Report action if handler is provided
  if (onGenerateReport) {
    actions.push({
      label: "Generate Report",
      icon: <PictureAsPdf />,
      noConfirm: true,
      customFunction: onGenerateReport,
    });
  }

  // Add template-specific actions if templateId is available
  if (templateId) {
    actions.push(
      {
        label: `Run Standard Now (${currentTenant || "Currently Selected Tenant"})`,
        type: "GET",
        url: "/api/ExecStandardsRun",
        icon: <PlayArrow />,
        data: {
          TemplateId: templateId,
        },
        confirmText: "Are you sure you want to force a run of this standard?",
        multiPost: false,
      },
      {
        label: "Run Standard Now (All Tenants in Template)",
        type: "GET",
        url: "/api/ExecStandardsRun",
        icon: <PlayArrow />,
        data: {
          TemplateId: templateId,
          tenantFilter: "allTenants",
        },
        confirmText: "Are you sure you want to force a run of this standard?",
        multiPost: false,
      }
    );
  }

  return actions;
};

/**
 * Default export for backward compatibility
 */
export default createDriftManagementActions;
