import { EyeIcon } from "@heroicons/react/24/outline";
import {
  AdminPanelSettings,
  GppBad,
  HourglassBottom,
  LockReset,
  OpenInNew,
  PlayArrow,
} from "@mui/icons-material";
import { Alert, Typography } from "@mui/material";

export const CippGdapActions = () => [
  {
    label: "View Relationship",
    link: "/tenant/gdap-management/relationships/relationship?id=[id]",
    color: "primary",
    icon: <EyeIcon />,
  },
  {
    label: "Start Onboarding",
    link: "/tenant/gdap-management/onboarding/start?id=[id]",
    color: "primary",
    icon: <PlayArrow />,
    showInActionsMenu: true,
  },
  {
    label: "Open Relationship in Partner Center",
    link: "https://partner.microsoft.com/en-us/dashboard/commerce2/customers/[customer.tenantId]/adminrelationships/[id]",
    color: "info",
    icon: <OpenInNew />,
    showInActionsMenu: true,
  },
  {
    label: "Enable automatic extension",
    type: "GET",
    url: "/api/ExecAutoExtendGDAP",
    data: { ID: "id" },
    confirmText: "Are you sure you want to enable auto-extend for this relationship?",
    color: "info",
    icon: <HourglassBottom />,
  },
  {
    label: "Remove Global Administrator from Relationship",
    type: "GET",
    url: "/api/ExecGDAPRemoveGArole",
    data: { GDAPID: "id" },
    confirmText: "Are you sure you want to remove Global Administrator from this relationship?",
    color: "danger",
    icon: <AdminPanelSettings />,
  },
  {
    label: "Reset Group Mappings",
    type: "POST",
    url: "/api/ExecGDAPAccessAssignment",
    icon: <LockReset />,
    data: { Id: "id", Action: "ResetMappings" },
    fields: [
      {
        name: "RoleTemplateId",
        label: "Role Template",
        placeholder: "Select a role template to apply to this relationship.",
        type: "select",
        api: {
          url: "/api/ExecGDAPRoleTemplate",
          queryKey: "GDAPRoleTemplate",
          dataKey: "Results",
          valueField: "TemplateId",
          labelField: "TemplateId",
          showRefresh: true,
        },
      },
    ],
    confirmText: (
      <>
        <Typography variant="body1">
          Are you sure you want to reset the group mappings for this relationship?
        </Typography>
        <Alert severity="warning">
          This action will remove all existing group mappings and apply the selected role template
          to the relationship. Use this to fix incorrect group mappings or permission overlap issues
          (e.g removing AdminAgents or HelpdeskAgents).
        </Alert>
      </>
    ),
  },
  {
    label: "Terminate Relationship",
    type: "GET",
    url: "/api/ExecDeleteGDAPRelationship",
    data: { GDAPID: "id" },
    confirmText: "Are you sure you want to terminate this relationship?",
    color: "error",
    icon: <GppBad />,
  },
];

export default CippGdapActions;
