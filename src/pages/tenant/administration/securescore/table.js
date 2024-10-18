import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";
import CippTablePage from "../../../../components/CippComponents/CippTablePage";
import { useSecureScore } from "../../../../hooks/use-securescore";
import { CippInfoBar } from "../../../../components/CippCards/CippInfoBar";
import { CheckCircleIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { Map, Score } from "@mui/icons-material";
import { Container, Grid } from "@mui/material";
import { useSettings } from "../../../../hooks/use-settings";
import { CippImageCard } from "../../../../components/CippCards/CippImageCard";
const Page = () => {
  const secureScore = useSecureScore();
  const currentTenant = useSettings().currentTenant;
  return (
    <>
      <Container
        sx={{
          flexGrow: 1,
          py: 2,
        }}
        maxWidth={false}
      >
        {currentTenant === "AllTenants" && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <CippImageCard
                title="Not supported"
                imageUrl="/assets/illustrations/undraw_website_ij0l.svg"
                text={
                  "The Tenant Overview does not support all Tenants, please select a different tenant using the tenant selector. If you'd only like to see the scores for all tenants? Check out the Best Practices report instead."
                }
              />
            </Grid>
          </Grid>
        )}
        {currentTenant !== "AllTenants" && (
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
        )}
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
