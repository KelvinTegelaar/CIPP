import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";
import { useSecureScore } from "../../../../hooks/use-securescore";
import { CippInfoBar } from "../../../../components/CippCards/CippInfoBar";
import { Container, Grid } from "@mui/material";
import { CheckCircleIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { Map, Score } from "@mui/icons-material";
import { CippChartCard } from "../../../../components/CippCards/CippChartCard";
const Page = () => {
  const secureScore = useSecureScore();
  console.log(secureScore);
  return (
    <Container
      sx={{
        flexGrow: 1,
        py: 2,
      }}
      maxWidth={false}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
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
        </Grid>
        <Grid item xs={12} md={3}>
          <CippChartCard
            isFetching={secureScore.isFetching}
            title={"Secure Score"}
            chartSeries={
              secureScore.secureScore.isSuccess
                ? [
                    {
                      name: "Secure Score",
                      //reverse the order as it is returned in descending order
                      data: secureScore.secureScore.data.Results.map((data) => ({
                        x: data.createdDateTime,
                        y: data.currentScore,
                      })).reverse(),
                    },
                  ]
                : []
            }
            chartType="area"
          />
        </Grid>
      </Grid>
    </Container>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
