import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Alert, Link } from "@mui/material";

const Page = () => {
  const pageTitle = "Check Alerts";

  // Explainer component
  const explainer = (
    <Alert severity="info" sx={{ mb: 2 }}>
      This page collects the alerts from Check by Cyberdrain, a browser plugin that blocks AiTM
      (Adversary-in-the-Middle) attacks. Check provides real-time protection against phishing and
      credential theft attempts. Learn more at{" "}
      <Link href="https://docs.check.tech" target="_blank" rel="noopener noreferrer">
        docs.check.tech
      </Link>{" "}
      or install the plugin now:
      <Link
        href="https://microsoftedge.microsoft.com/addons/detail/check-by-cyberdrain/knepjpocdagponkonnbggpcnhnaikajg"
        target="_blank"
        rel="noopener noreferrer"
      >
        Microsoft Edge
      </Link>{" "}
      |
      <Link
        href="https://chromewebstore.google.com/detail/check-by-cyberdrain/benimdeioplgkhanklclahllklceahbe"
        target="_blank"
        rel="noopener noreferrer"
      >
        Chrome
      </Link>
    </Alert>
  );

  const columns = [
    "tenantFilter",
    "type",
    "url",
    "reason",
    "score",
    "threshold",
    "potentialUserName",
    "potentialUserDisplayName",
    "reportedByIP",
    "timestamp",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListCheckExtAlerts"
      simpleColumns={columns}
      tableFilter={explainer}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
