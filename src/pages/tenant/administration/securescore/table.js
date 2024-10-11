import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";
import CippTablePage from "../../../../components/CippComponents/CippTablePage";
import { useSecureScore } from "../../../../hooks/use-securescore";
import { CippInfoBar } from "../../../../components/CippCards/CippInfoBar";
import {
  CheckCircleIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleRounded, Map, Score } from "@mui/icons-material";
import { Container } from "@mui/material";
const Page = () => {
  const secureScore = useSecureScore();
  return (
    <>
      <Container
        sx={{
          flexGrow: 1,
          py: 2,
        }}
        maxWidth={false}
      >
        <CippInfoBar
          isFetching={secureScore.isFetching}
          data={[
            {
              icon: <CheckCircleIcon />,
              data: secureScore.translatedData.percentageCurrent + "%",
              name: "Current Score",
              color: "secondary",
            },
            {
              icon: <GlobeAltIcon />,
              data: secureScore.translatedData.percentageVsAllTenants + "%",
              name: "Compared score (All Tenants)",
              color: "green",
            },
            {
              icon: <Map />,
              data: secureScore.translatedData.percentageVsSimilar + "%",
              name: "Compared score (Similar Tenants)",
            },
            {
              icon: <Score />,
              data: `${secureScore.translatedData.currentScore} of ${secureScore.translatedData.maxScore}`,
              name: "Score in points",
            },
          ]}
        />
      </Container>
      <CippTablePage
        title="Secure Score"
        data={secureScore.translatedData.controlScores}
        simpleColumns={["title", "tier", "actionUrl", "userImpact", "threats"]}
      />
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
