import { Grid } from "@mui/material";
import { Layout as DashboardLayout } from "../layouts/index.js";
import Head from "next/head.js";
import { CippImageCard } from "../components/CippCards/CippImageCard.jsx";

const UnauthenticatedPage = () => {
  return (
    <DashboardLayout>
      <Head>
        <title>Devices</title>
      </Head>
      <Grid container spacing={3}>
        <Grid item style={{ display: "flex" }} xs={12} md={6}>
          <CippImageCard
            text={
              "Lets get started. Are you a Github user? Use the button to login. Generally speaking this is the option for first time users."
            }
            title="Github Login"
            linkText="Logon using Github"
            link={"/.auth/login/github"}
            imageUrl="/assets/home-flows.png"
          />
        </Grid>
        <Grid item style={{ display: "flex" }} xs={12} md={6}>
          <CippImageCard
            text={
              "And if you're a M365 user, or a secondary admin, use this button to login using your M365 account."
            }
            title="Microsoft Login"
            linkText="Logon using Microsoft"
            link={"/.auth/login/aad"}
            imageUrl="/assets/home-hero.png"
          />
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default UnauthenticatedPage;
