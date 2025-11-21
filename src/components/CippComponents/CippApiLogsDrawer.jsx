import { useState } from "react";
import { Button, Box } from "@mui/material";
import { ReceiptLongOutlined } from "@mui/icons-material";
import { EyeIcon } from "@heroicons/react/24/outline";
import { CippOffCanvas } from "./CippOffCanvas";
import { CippDataTable } from "../CippTable/CippDataTable";

export const CippApiLogsDrawer = ({
  buttonText = "View API Logs",
  apiFilter = null,
  tenantFilter = null,
  standardFilter = null,
  requiredPermissions = [],
  PermissionButton = Button,
  title = "API Logs",
  ...props
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
  };

  const handleOpenDrawer = () => {
    setDrawerVisible(true);
  };

  // Build the API URL with the filter
  const apiUrl = `/api/ListLogs?Filter=true${apiFilter ? `&API=${apiFilter}` : ""}${
    tenantFilter ? `&Tenant=${tenantFilter}` : ""
  }${standardFilter ? `&StandardTemplateId=${standardFilter}` : ""}`;

  // Define the columns for the logs table
  const simpleColumns = [
    "DateTime",
    "Severity",
    "Message",
    "User",
    "Tenant",
    "API",
    "StandardInfo.Template",
    "StandardInfo.Standard",
    "StandardInfo.ConditionalAccessPolicy",
    "StandardInfo.IntunePolicy",
  ];

  const actions = [
    {
      label: "View Log Entry",
      link: "/cipp/logs/logentry?logentry=[RowKey]",
      icon: <EyeIcon />,
      color: "primary",
    },
  ];

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={handleOpenDrawer}
        startIcon={<ReceiptLongOutlined />}
        {...props}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas title={title} visible={drawerVisible} onClose={handleCloseDrawer} size="xl">
        <Box sx={{ mb: 2 }}>
          <CippDataTable
            title={title}
            hideTitle={true}
            noCard={true}
            simple={false}
            api={{
              url: apiUrl,
              dataKey: "",
            }}
            queryKey={`APILogs-${apiFilter || "All"}`}
            simpleColumns={simpleColumns}
            exportEnabled={true}
            offCanvas={{
              extendedInfoFields: [
                "DateTime",
                "Severity",
                "Message",
                "User",
                "Tenant",
                "API",
                "LogData",
                "TenantID",
                "AppId",
                "IP",
                "StandardInfo",
              ],
            }}
            maxHeightOffset="200px"
            defaultSorting={[
              {
                id: "DateTime",
                desc: true,
              },
            ]}
            actions={actions}
          />
        </Box>
      </CippOffCanvas>
    </>
  );
};
