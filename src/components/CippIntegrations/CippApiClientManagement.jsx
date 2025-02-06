import { Button, Stack, SvgIcon, Menu, MenuItem, ListItemText } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ApiGetCall, ApiPostCall } from "/src/api/ApiCall";
import { CippDataTable } from "../CippTable/CippDataTable";
import {
  ChevronDownIcon,
  ClipboardDocumentIcon,
  PencilIcon,
  PlusSmallIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { CippApiDialog } from "../CippComponents/CippApiDialog";
import { Create, Key, Save, Sync } from "@mui/icons-material";
import { CippPropertyListCard } from "../CippCards/CippPropertyListCard";
import { CippCopyToClipBoard } from "../CippComponents/CippCopyToClipboard";

const CippApiClientManagement = () => {
  const [openAddClientDialog, setOpenAddClientDialog] = useState(false);
  const [openAddExistingAppDialog, setOpenAddExistingAppDialog] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const formControl = useForm({
    mode: "onChange",
  });

  const postCall = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: ["ApiClients", "AzureConfiguration"],
  });

  const azureConfig = ApiGetCall({
    url: "/api/ExecApiClient",
    data: { Action: "GetAzureConfiguration" },
    queryKey: "AzureConfiguration",
  });

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleSaveToAzure = () => {
    postCall.mutate({
      url: `/api/ExecApiClient?action=SaveToAzure`,
      data: {},
    });
    handleMenuClose();
  };

  const actions = [
    {
      label: "Edit",
      icon: (
        <SvgIcon>
          <PencilIcon />
        </SvgIcon>
      ),
      confirmText: "Update the API client settings:",
      hideBulk: true,
      setDefaultValues: true,
      fields: [
        {
          type: "autoComplete",
          name: "Role",
          multiple: false,
          creatable: false,
          placeholder: "Select Role",
          api: {
            url: "/api/ListCustomRole",
            queryKey: "CustomRoleList",
            labelField: "RowKey",
            valueField: "RowKey",
          },
        },
        {
          type: "autoComplete",
          name: "IpRange",
          multiple: true,
          freeSolo: true,
          creatable: true,
          options: [],
          placeholder: "Enter IP Range (Single hosts or CIDR notation)",
        },
        {
          type: "switch",
          name: "Enabled",
          label: "Enable this client",
        },
      ],
      type: "POST",
      url: "/api/ExecApiClient",
      data: {
        Action: "AddUpdate",
        ClientId: "ClientId",
      },
      relatedQueryKeys: ["ApiClients"],
    },
    {
      label: "Reset Application Secret",
      icon: <Key />,
      confirmText: "Are you sure you want to reset the application secret?",
      type: "POST",
      url: "/api/ExecApiClient",
      data: {
        Action: "ResetSecret",
        ClientId: "ClientId",
      },
    },
    {
      label: "Copy API Scope",
      icon: <ClipboardDocumentIcon />,
      noConfirm: true,
      customFunction: (row, action, formData) => {
        var scope = `api://${row.ClientId}/.default`;
        navigator.clipboard.writeText(scope);
      },
    },
    {
      label: "Delete Client",
      icon: <TrashIcon />,
      confirmText: "Are you sure you want to delete this client?",
      type: "POST",
      url: "/api/ExecApiClient",
      data: {
        Action: "Delete",
        ClientId: "ClientId",
      },
      fields: [
        {
          type: "switch",
          name: "RemoveAppReg",
          label: "Remove App Registration",
        },
      ],
      relatedQueryKeys: ["ApiClients"],
    },
  ];

  return (
    <>
      <Stack spacing={1}>
        <CippPropertyListCard
          title="Function Authentication"
          actionButton={
            <>
              <Button
                onClick={handleMenuOpen}
                variant="outlined"
                startIcon={
                  <SvgIcon>
                    <ChevronDownIcon />
                  </SvgIcon>
                }
              >
                Actions
              </Button>
              <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose}>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    setOpenAddClientDialog(true);
                  }}
                >
                  <SvgIcon fontSize="small" sx={{ minWidth: "30px" }}>
                    <Create />
                  </SvgIcon>
                  <ListItemText>Create New Client</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    setOpenAddExistingAppDialog(true);
                  }}
                >
                  <SvgIcon fontSize="small" sx={{ minWidth: "30px" }}>
                    <PlusSmallIcon />
                  </SvgIcon>
                  <ListItemText>Add Existing Client</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => azureConfig.refetch()}>
                  <SvgIcon fontSize="small" sx={{ minWidth: "30px" }}>
                    <Sync />
                  </SvgIcon>
                  <ListItemText>Refresh Configuration</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleSaveToAzure}>
                  <SvgIcon fontSize="small" sx={{ minWidth: "30px" }}>
                    <Save />
                  </SvgIcon>
                  <ListItemText>Save to Azure</ListItemText>
                </MenuItem>
              </Menu>
            </>
          }
          propertyItems={[
            { label: "API Auth Enabled", value: azureConfig.data?.Results?.Enabled },
            {
              label: "API Url",
              value: azureConfig.data?.Results?.ApiUrl ? (
                <CippCopyToClipBoard type="chip" text={azureConfig.data?.Results?.ApiUrl} />
              ) : (
                "Not Available"
              ),
            },
            {
              label: "Token URL",
              value: azureConfig.data?.Results?.TenantID ? (
                <CippCopyToClipBoard
                  type="chip"
                  text={`https://logon.microsoftonline.com/${azureConfig.data?.Results?.TenantID}/oauth2/v2.0/token`}
                />
              ) : (
                "Not Available"
              ),
            },
          ]}
          layout="dual"
          showDivider={false}
          isFetching={azureConfig.isFetching}
        />

        <CippDataTable
          actions={actions}
          title="CIPP-API Clients"
          api={{
            url: "/api/ExecApiClient",
            data: { Action: "List" },
            dataKey: "Results",
          }}
          simpleColumns={["Enabled", "AppName", "ClientId", "Role", "IPRange"]}
          queryKey={`ApiClients`}
        />
        <CippApiResults apiObject={postCall} />
      </Stack>

      <CippApiDialog
        createDialog={{
          open: openAddClientDialog,
          handleClose: () => setOpenAddClientDialog(false),
        }}
        title="Add Client"
        fields={[
          {
            type: "textField",
            name: "AppName",
            placeholder: "Enter App Name",
          },
          {
            type: "autoComplete",
            name: "Role",
            multiple: false,
            creatable: false,
            placeholder: "Select Role",
            api: {
              url: "/api/ListCustomRole",
              queryKey: "CustomRoleList",
              labelField: "RowKey",
              valueField: "RowKey",
            },
          },
          {
            type: "autoComplete",
            name: "IpRange",
            multiple: true,
            freeSolo: true,
            creatable: true,
            options: [],
            placeholder: "Enter IP Range (Single hosts or CIDR notation)",
          },
          {
            type: "switch",
            name: "Enabled",
            label: "Enable this client",
          },
        ]}
        api={{
          type: "POST",
          url: "/api/ExecApiClient",
          data: { Action: "AddUpdate" },
          relatedQueryKeys: [`ApiClients`],
        }}
      />
      <CippApiDialog
        createDialog={{
          open: openAddExistingAppDialog,
          handleClose: () => setOpenAddExistingAppDialog(false),
        }}
        title="Add Existing App"
        fields={[
          {
            type: "autoComplete",
            name: "ClientId",
            placeholder: "Select Existing App",
            api: {
              type: "GET",
              url: "/api/ExecApiClient",
              data: { Action: "ListAvailable" },
              queryKey: `AvailableApiApps`,
              dataKey: "Results",
              labelField: (app) => `${app.displayName} (${app.appId})`,
              valueField: "appId",
              addedField: {
                displayName: "displayName",
                createdDateTime: "createdDateTime",
              },
            },
            creatable: false,
            multiple: false,
          },
          {
            type: "autoComplete",
            name: "Role",
            multiple: false,
            creatable: false,
            placeholder: "Select Role",
            api: {
              url: "/api/ListCustomRole",
              queryKey: "CustomRoleList",
              labelField: "RowKey",
              valueField: "RowKey",
            },
          },
          {
            type: "autoComplete",
            name: "IpRange",
            multiple: true,
            freeSolo: true,
            creatable: true,
            options: [],
            placeholder: "Enter IP Range(s)",
          },
          {
            type: "switch",
            name: "Enabled",
            label: "Enable this client",
          },
        ]}
        api={{
          type: "POST",
          url: "/api/ExecApiClient",
          data: { Action: "!AddUpdate" },
          relatedQueryKeys: [`ApiClients`],
        }}
      />
    </>
  );
};

export default CippApiClientManagement;
