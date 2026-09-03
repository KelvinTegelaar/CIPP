import React from "react";
import { CippIcons } from "../../utils/icon-registry";
import { Alert, Box, Button, Chip, SvgIcon, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { CippDataTable } from "../CippTable/CippDataTable";
import { usePermissions } from "../../hooks/use-permissions";
import { enterImpersonation } from "../../utils/impersonation";
import NextLink from "next/link";
import { CippPropertyListCard } from "../../components/CippCards/CippPropertyListCard";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import { Stack } from "@mui/system";
import { CippCopyToClipBoard } from "../CippComponents/CippCopyToClipboard";

const CippRoles = () => {
  const queryClient = useQueryClient();
  const { userRoles } = usePermissions();
  // While impersonating, /me reports the impersonated roles, so this action disappears
  // automatically — no nested impersonation; the only way back is the banner's Exit.
  const isSuperAdmin = userRoles?.includes("superadmin");

  const actions = [
    ...(isSuperAdmin
      ? [
          {
            label: "Impersonate Role",
            icon: (
              <SvgIcon>
                <CippIcons.EyeIcon />
              </SvgIcon>
            ),
            confirmText: (
              <Stack spacing={2}>
                <Typography variant="body2">
                  Impersonate this role? CIPP will reload and behave as if you only hold this
                  role — including its tenant restrictions — until you click Exit in the banner
                  at the top of the page. IP restrictions are not simulated.
                </Typography>
                <Alert severity="warning">
                  This tests a <strong>single role in isolation</strong>, not role combinations.
                  For users holding several roles, custom roles are <strong>restrictive, not
                  additive</strong>: combined with a base role like editor or readonly they can
                  only narrow access, so a real user's effective permissions may differ from
                  what you see here.
                </Alert>
              </Stack>
            ),
            // Row-menu passes (row, action, formData); the offcanvas property card passes
            // (item, data, {}) — resolve the row defensively.
            customFunction: (a, b) => {
              const row = a?.RoleName ? a : b;
              if (row?.RoleName) enterImpersonation(row.RoleName, queryClient);
            },
            condition: (row) => row?.RoleName?.toLowerCase() !== "superadmin",
          },
        ]
      : []),
    {
      label: "Edit",
      pinned: true,
      icon: (
        <SvgIcon>
          <CippIcons.PencilIcon />
        </SvgIcon>
      ),
      link: "/cipp/advanced/authentication/cipp-roles/edit?role=[RoleName]",
    },
    {
      label: "Clone",
      icon: (
        <SvgIcon>
          <CippIcons.DocumentDuplicateIcon />
        </SvgIcon>
      ),
      type: "POST",
      url: "/api/ExecCustomRole",
      data: {
        Action: "Clone",
        RoleName: "RoleName",
      },
      fields: [
        {
          label: "New Role Name",
          name: "NewRoleName",
          type: "textField",
          required: true,
          helperText:
            "Enter a name for the new cloned role. This cannot be the same as an existing role.",
          disableVariables: true,
        },
      ],
      relatedQueryKeys: ["customRoleList", "customRoleTable"],
      confirmText: "Are you sure you want to clone this custom role?",
      condition: (row) => row?.Type === "Custom",
    },
    {
      label: "Delete",
      icon: (
        <SvgIcon>
          <CippIcons.TrashIcon />
        </SvgIcon>
      ),
      confirmText: "Are you sure you want to delete this custom role?",
      url: "/api/ExecCustomRole",
      type: "POST",
      data: {
        Action: "Delete",
        RoleName: "RoleName",
      },
      condition: (row) => row?.Type === "Custom",
      relatedQueryKeys: ["customRoleList", "customRoleTable"],
    },
  ];

  const offCanvas = {
    children: (data) => {
      const includeProps = ["RoleName", "Type", "EntraGroup", "AllowedTenants", "BlockedTenants"];
      const keys = includeProps.filter((key) => Object.keys(data).includes(key));
      const properties = [];
      keys.forEach((key) => {
        if (data[key] && data[key].length > 0) {
          properties.push({
            label: getCippTranslation(key),
            value: getCippFormatting(data[key], key),
          });
        }
      });

      const rules = data["PermissionRules"];
      const hasRules = Array.isArray(rules?.Include) && rules.Include.length > 0;
      if (hasRules) {
        properties.push({
          label: "Permission Rules",
          value: (
            <Stack direction="row" spacing={0.5} useFlexGap sx={{
              flexWrap: "wrap"
            }}>
              {rules.Include.map((pattern, idx) => (
                <Chip key={`inc-${idx}`} size="small" color="success" label={pattern} />
              ))}
              {(rules.Exclude || []).map((pattern, idx) => (
                <Chip key={`exc-${idx}`} size="small" color="error" label={pattern} />
              ))}
            </Stack>
          ),
        });
      }

      if (data["Permissions"] && Object.keys(data["Permissions"]).length > 0) {
        properties.push({
          label: hasRules ? "Effective Permissions (at last save)" : "Permissions",
          value: (
            <Stack spacing={0.5}>
              {Object.keys(data["Permissions"])
                .sort()
                .map((permission, idx) => (
                  <Box key={idx}>
                    <CippCopyToClipBoard type="chip" text={data["Permissions"]?.[permission]} />
                  </Box>
                ))}
            </Stack>
          ),
        });
      }

      return (
        <CippPropertyListCard
          cardSx={{ p: 0, m: -2 }}
          title="Role Details"
          propertyItems={properties}
          actionItems={actions}
        />
      );
    },
  };

  return (
    <Box>
      <CippDataTable
        actions={actions}
        title="Roles"
        cardButton={
          <Button
            variant="contained"
            size="small"
            startIcon={
              <SvgIcon>
                <CippIcons.PencilIcon />
              </SvgIcon>
            }
            component={NextLink}
            href="/cipp/advanced/authentication/cipp-roles/add"
          >
            Add Role
          </Button>
        }
        api={{
          url: "/api/ListCustomRole",
        }}
        queryKey="customRoleTable"
        simpleColumns={["RoleName", "Type", "EntraGroup", "AllowedTenants", "BlockedTenants"]}
        offCanvas={offCanvas}
      />
    </Box>
  );
};

export default CippRoles;
