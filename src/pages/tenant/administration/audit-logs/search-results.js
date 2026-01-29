import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { CippApiDialog } from "../../../../components/CippComponents/CippApiDialog.jsx";
import { EyeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import CippAuditLogDetails from "../../../../components/CippComponents/CippAuditLogDetails.jsx";
import { Button, SvgIcon, Box } from "@mui/material";
import { ManageSearch } from "@mui/icons-material";
import { useDialog } from "../../../../hooks/use-dialog";

const searchResultsColumns = [
  "createdDateTime",
  "userPrincipalName",
  "operation",
  "service",
  "auditLogRecordType",
  "clientIp",
  "Actions",
];

const Page = () => {
  const router = useRouter();
  const [searchId, setSearchId] = useState(null);
  const [searchName, setSearchName] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const processLogsDialog = useDialog();

  useEffect(() => {
    if (router.isReady) {
      setSearchId(router.query.id || router.query.searchId);
      setSearchName(router.query.name ? decodeURIComponent(router.query.name) : null);
      setIsReady(true);
    }
  }, [router.isReady, router.query.id, router.query.searchId, router.query.name]);

  if (!isReady) {
    return <div>Loading...</div>;
  }

  if (!searchId) {
    return <div>Search ID is required</div>;
  }

  const pageTitle = searchName ? `${searchName}` : `Search Results - ${searchId}`;

  const handleBackClick = () => {
    router.push("/tenant/administration/audit-logs/searches");
  };

  // Process Logs API configuration
  const processLogsApi = {
    type: "POST",
    url: "/api/ExecAuditLogSearch",
    confirmText:
      "Process these logs? Note: This will only alert on logs that match your Alert Configuration rules.",
    relatedQueryKeys: ["AuditLogSearches"],
    allowResubmit: true,
    data: {
      Action: "ProcessLogs",
      SearchId: searchId,
    },
  };

  // Define offcanvas configuration with larger size for audit log details
  const offcanvas = {
    title: "Audit Log Details",
    size: "xl", // Make the offcanvas extra large
    children: (row) => <CippAuditLogDetails row={row} />,
  };

  return (
    <>
      <CippTablePage
        title={pageTitle}
        cardButton={
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              color="primary"
              onClick={handleBackClick}
              startIcon={
                <SvgIcon fontSize="small">
                  <ArrowLeftIcon />
                </SvgIcon>
              }
            >
              Back to Searches
            </Button>
            <Button
              color="primary"
              onClick={() => processLogsDialog.handleOpen()}
              startIcon={<ManageSearch />}
            >
              Process Logs
            </Button>
          </Box>
        }
        apiUrl="/api/ListAuditLogSearches"
        apiDataKey="Results"
        simpleColumns={searchResultsColumns}
        queryKey={`AuditLogSearchResults-${searchId}`}
        apiData={{
          Type: "SearchResults",
          SearchId: searchId,
        }}
        offCanvas={offcanvas}
        actions={[]}
      />

      <CippApiDialog
        createDialog={processLogsDialog}
        title="Process Logs for Alerts"
        api={processLogsApi}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
