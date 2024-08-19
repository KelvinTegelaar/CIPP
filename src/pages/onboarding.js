import Head from "next/head";
import { Box, Container, Stack, Typography } from "@mui/material";
import { Layout as DashboardLayout } from "../layouts/dashboard";
import { CippWizard } from "../components/CippWizard/CippWizard";
import {
  BuildingOfficeIcon,
  CloudIcon,
  CpuChipIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";
import { Api, BackupTable, Key } from "@mui/icons-material";
import { CippPSACredentialsStep } from "../components/CippWizard/CippPSACredentialsStep";
import { CippPSASyncOptions } from "../components/CippWizard/CippPSASyncOptions";
import { CippWizardConfirmation } from "../components/CippWizard/CippWizardConfirmation";
import { CippWizardOptionsList } from "../components/CippWizard/CippWizardOptionsList";
import { CippDeploymentStep } from "../components/CippWizard/CIPPDeploymentStep";

const Page = () => {
  const steps = [
    {
      title: "Step 1",
      description: "Onboarding",
      component: CippWizardOptionsList,
      componentProps: {
        title: "Select your option",
        subtext: "Choose the onboarding option",
        valuesKey: "Option",
        options: [
          {
            description: "I want to deploy my instance for the first time.",
            icon: <NewspaperIcon />,
            label: "Deploy my Instance",
            value: "Deploy",
          },
          {
            description: "I want to deploy API Access for my instance.",
            icon: <Api />,
            label: "API Setup",
            value: "Api",
          },
          {
            description: "I want to see my API credentials",
            icon: <Key />,
            label: "API Credentials",
            value: "Creds",
          },
        ],
      },
    },
    {
      title: "Step 2",
      description: "Configuration",
      component: CippDeploymentStep,
    },
    {
      title: "Step 3",
      description: "Confirmation",
      component: CippWizardConfirmation,
    },
  ];

  return (
    <>
      <Head>
        <title>CyberDrain Onboarding</title>
      </Head>
      <Box
        sx={{
          backgroundColor: "background.default",
          flexGrow: 1,
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={6}>
            <div>
              <Typography variant="h4">Onboarding</Typography>
            </div>
            <Stack spacing={5}>
              <Stack spacing={1}>
                <CippWizard orientation="horizontal" steps={steps} />
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
