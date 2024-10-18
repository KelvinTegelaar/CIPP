import { Button } from "@mui/material";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js"; // had to add an extra path here because I added an extra folder structure. We should switch to absolute pathing so we dont have to deal with relative.
import Link from "next/link";
import { ApiGetCall } from "../../../../api/ApiCall";
import { useSettings } from "../../../../hooks/use-settings";
import { CippApiResults } from "../../../../components/CippComponents/CippApiResults";

const Page = () => {
  const currentTenant = useSettings().currentTenant;
  const pageTitle = "Domains Analyser";
  const apiGetCall = ApiGetCall({
    url: "/api/ExecDomainAnalyser",
    waiting: false,
  });
  const actions = [];

  const offCanvas = {
    extendedInfoFields: [
      "Domain",
      "ScorePercentage",
      "MailProvider",
      "SPFPassAll",
      "MXPassTest",
      "DMARCPresent",
      "DMARCActionPolicy",
      "DMARCPercentagePass",
      "DNSSECPresent",
      "DKIMEnabled",
    ],
  };
  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListDomainAnalyser"
      cardButton={
        <>
          <Button component={Link} href="bpa-report/builder">
            Check Individual Domain
          </Button>
          {/* This needs to be replaced with a CippApiDialog. */}
          <Button onClick={apiGetCall.refetch}>Run Analysis Now</Button>
        </>
      }
      prependComponents={<CippApiResults apiObject={apiGetCall} />}
      queryKey={`ListDomains-${currentTenant}`}
      simpleColumns={[
        "Domain",
        "ScorePercentage",
        "MailProvider",
        "SPFPassAll",
        "MXPassTest",
        "DMARCPresent",
        "DMARCActionPolicy",
        "DMARCPercentagePass",
        "DNSSECPresent",
        "DKIMEnabled",
      ]}
      offCanvas={offCanvas}
      actions={actions}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
