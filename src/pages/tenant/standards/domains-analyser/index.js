import { Button } from "@mui/material";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js"; // had to add an extra path here because I added an extra folder structure. We should switch to absolute pathing so we dont have to deal with relative.
import Link from "next/link";
import { ApiGetCall } from "../../../../api/ApiCall";
import { useSettings } from "../../../../hooks/use-settings";
import { CippApiResults } from "../../../../components/CippComponents/CippApiResults";
import { CippDomainCards } from "../../../../components/CippCards/CippDomainCards";
import { DeleteForever, TravelExplore, Refresh } from "@mui/icons-material";
import { DomainAnalyserDialog } from "../../../../components/CippComponents/DomainAnalyserDialog";
import { useDialog } from "../../../../hooks/use-dialog";

const Page = () => {
  const currentTenant = useSettings().currentTenant;
  const pageTitle = "Domains Analyser";
  const analyserDialog = useDialog();
  const apiGetCall = ApiGetCall({
    url: "/api/ExecDomainAnalyser",
    waiting: false,
  });
  const actions = [
    {
      label: "Delete from analyser",
      type: "GET",
      icon: <DeleteForever />,
      url: "/api/ExecDnsConfig",
      data: { Action: "!RemoveDomain", Domain: "Domain" },
      confirmText: "Are you sure you want to delete this domain from the analyser?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    children: (extendedData) => <CippDomainCards domain={extendedData.Domain} fullwidth={true} />,
  };
  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ListDomainAnalyser"
        cardButton={
          <>
            <Button
              component={Link}
              href="/tenant/tools/individual-domains"
              startIcon={<TravelExplore />}
            >
              Check Individual Domain
            </Button>
            <Button onClick={analyserDialog.handleOpen} startIcon={<Refresh />}>
              Run Analysis Now
            </Button>
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
      <DomainAnalyserDialog createDialog={analyserDialog} />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
