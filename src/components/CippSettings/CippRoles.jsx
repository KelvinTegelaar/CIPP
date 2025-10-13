import React from "react";
import { Box, Button, SvgIcon } from "@mui/material";
import { CippDataTable } from "../CippTable/CippDataTable";
import { PencilIcon, TrashIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import NextLink from "next/link";
import { CippPropertyListCard } from "../../components/CippCards/CippPropertyListCard";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import { Stack } from "@mui/system";
import { CippCopyToClipBoard } from "../CippComponents/CippCopyToClipboard";

const CippRoles = () => {
  const actions = [
    {
      label: "Edit",
      icon: (
        <SvgIcon>
          <PencilIcon />
        </SvgIcon>
      ),
      link: "/cipp/super-admin/cipp-roles/edit?role=[RoleName]",
    },
    {
      label: "Clone",
      icon: (
        <SvgIcon>
          <DocumentDuplicateIcon />
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
      relatedQueryKeys: ["customRoleList"],
      confirmText: "Are you sure you want to clone this custom role?",
      condition: (row) => row?.Type === "Custom",
    },
    {
      label: "Delete",
      icon: (
        <SvgIcon>
          <TrashIcon />
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
      relatedQueryKeys: ["customRoleList"],
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

      if (data["Permissions"] && Object.keys(data["Permissions"]).length > 0) {
        properties.push({
          label: "Permissions",
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
                <PencilIcon />
              </SvgIcon>
            }
            component={NextLink}
            href="/cipp/super-admin/cipp-roles/add"
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
