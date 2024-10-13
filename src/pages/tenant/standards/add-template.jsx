import { Box, Button, Container, Stack, Typography, SvgIcon, Grid } from "@mui/material";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { Add } from "@mui/icons-material";
import { useState } from "react";
import standards from "/src/data/standards";
import CippStandardAccordion from "../../../components/CippStandards/CippStandardAccordion";
import CippStandardDialog from "../../../components/CippStandards/CippStandardDialog";
import CippStandardsSideBar from "../../../components/CippStandards/CippStandardsSideBar";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";

const Page = () => {
  const router = useRouter();
  const formControl = useForm({ mode: "onBlur" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStandards, setSelectedStandards] = useState({});
  const [templateName, setTemplateName] = useState("");

  const categories = standards.reduce((acc, standard) => {
    const { cat } = standard;
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(standard);
    return acc;
  }, {});

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);
  const filterStandards = (standardsList) =>
    standardsList.filter(
      (standard) =>
        standard.label.toLowerCase().includes(searchQuery) ||
        standard.helpText.toLowerCase().includes(searchQuery) ||
        (standard.tag && standard.tag.some((tag) => tag.toLowerCase().includes(searchQuery)))
    );
  const handleToggleStandard = (standardName) => {
    setSelectedStandards((prev) => ({
      ...prev,
      [standardName]: !prev[standardName],
    }));
  };
  const handleRemoveStandard = (standardName) => {
    setSelectedStandards((prev) => {
      const newSelected = { ...prev };
      delete newSelected[standardName];
      return newSelected;
    });
  };
  const handleAccordionToggle = (standardName) => {
    setExpanded((prev) => (prev === standardName ? null : standardName));
  };

  const actions = [
    {
      label: "Save Template",
      handler: () => console.log("Mark as complete"),
      icon: <CheckCircleIcon />,
    },
  ];

  const steps = [
    "Set a name for the Template",
    "Added Standards to Template",
    "Configured all Standards",
    "Assigned Template to Tenants",
  ];

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth={"xl"}>
        <Stack spacing={4}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Button
              color="inherit"
              onClick={() => router.back()}
              startIcon={
                <SvgIcon fontSize="small">
                  <ArrowLeftIcon />
                </SvgIcon>
              }
            >
              Back to Templates
            </Button>
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={4}
            sx={{ mb: 3 }}
          >
            <Typography variant="h4">Add Standards Template</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenDialog}
              startIcon={<Add />}
            >
              Add Standard to this template
            </Button>
          </Stack>

          <Grid container spacing={3}>
            {/* Left Column for Accordions */}
            <Grid item xs={12} lg={4}>
              <CippStandardsSideBar
                title="Standard Template Setup"
                subtitle="Follow the steps to configure the Standard"
                steps={steps}
                templateName={templateName}
                setTemplateName={setTemplateName}
                actions={actions}
                formControl={formControl}
                selectedStandards={selectedStandards}
              />
            </Grid>
            <Grid item xs={12} lg={8}>
              <Stack spacing={3}>
                <CippStandardAccordion
                  standards={standards}
                  selectedStandards={selectedStandards}
                  expanded={expanded}
                  handleAccordionToggle={handleAccordionToggle}
                  handleRemoveStandard={handleRemoveStandard}
                  formControl={formControl}
                />
              </Stack>
            </Grid>
          </Grid>
        </Stack>

        <CippStandardDialog
          dialogOpen={dialogOpen}
          handleCloseDialog={handleCloseDialog}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categories={categories}
          filterStandards={filterStandards}
          selectedStandards={selectedStandards}
          handleToggleStandard={handleToggleStandard}
        />
      </Container>
    </Box>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
