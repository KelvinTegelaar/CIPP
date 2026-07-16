import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import {
  CippAnonymizedReportAlert,
  useReportAnonymized,
} from "../../../../components/CippComponents/CippAnonymizedReportAlert";
import { useSettings } from "../../../../hooks/use-settings";

const Page = () => {
  const tenant = useSettings().currentTenant;
  const apiData = {
    Endpoint: "reports/getMailboxUsageDetail(period='D7')",
    $format: "application/json",
  };
  const queryKey = `MailboxStatistics-${tenant}`;

  const anonymized = useReportAnonymized({
    url: "/api/ListGraphRequest",
    data: apiData,
    queryKey: queryKey,
    dataKey: "Results",
    fields: ["userPrincipalName", "displayName"],
  });

  return (
    <CippTablePage
      title="Mailbox Statistics"
      apiUrl="/api/ListGraphRequest"
      apiData={apiData}
      apiDataKey="Results"
      queryKey={queryKey}
      tableFilter={<CippAnonymizedReportAlert show={anonymized} />}
      simpleColumns={[
        /* Columns from the original component translated to simpleColumns */
        "tenant", // Original conditional column, included directly here as per simplified requirements
        "CippStatus", // Maps to "Retrieval Status" in original
        "userPrincipalName", // Maps to "User Principal Name"
        "displayName", // Maps to "Display Name"
        "recipientType", // Maps to "Mailbox Type"
        "lastActivityDate", // Maps to "Last Active"
        "storageUsedInBytes", // Maps to "Used Space (GB)"
        "prohibitSendReceiveQuotaInBytes", // Maps to "Quota (GB)"
        "quotaUsedPercentage", // Calculated quota usage percentage, mapped here for backend processing if needed
        "itemCount", // Maps to "Item Count (Total)"
        "hasArchive", // Maps to "Archiving Enabled"
      ]}
      /* No actions specified in the original file */
      offCanvas={null} // No off-canvas data specified, so set to null
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
