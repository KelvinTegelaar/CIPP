import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { EyeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import CippAuditLogDetails from "/src/components/CippComponents/CippAuditLogDetails.jsx";
import { Button, SvgIcon } from "@mui/material";

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

  // Define offcanvas configuration with larger size for audit log details
  const offcanvas = {
    title: "Audit Log Details",
    size: "xl", // Make the offcanvas extra large
    children: (row) => <CippAuditLogDetails row={row} />,
  };

  return (
    <CippTablePage
      title={pageTitle}
      cardButton={
        <Button
          variant="outlined"
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
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
