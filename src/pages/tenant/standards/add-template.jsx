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
import { useDialog } from "../../../hooks/use-dialog";

const Page = () => {
  const router = useRouter();
  const formControl = useForm({ mode: "onBlur" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStandards, setSelectedStandards] = useState({});
  const [templateName, setTemplateName] = useState("");

  // Categorize standards by their category (cat)
  const categories = standards.reduce((acc, standard) => {
    const { cat } = standard;
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(standard);
    return acc;
  }, {});

  // Open and close dialog
  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  // Filter standards based on search query
  const filterStandards = (standardsList) =>
    standardsList.filter(
      (standard) =>
        standard.label.toLowerCase().includes(searchQuery) ||
        standard.helpText.toLowerCase().includes(searchQuery) ||
        (standard.tag && standard.tag.some((tag) => tag.toLowerCase().includes(searchQuery)))
    );

  // Handle single standard toggle (not multiple)
  const handleToggleStandard = (standardName) => {
    setSelectedStandards((prev) => ({
      ...prev,
      [standardName]: !prev[standardName], // Toggle single standard presence
    }));
  };

  // Add multiple instances of a standard using the + button
  const handleAddMultipleStandard = (standardName) => {
    setSelectedStandards((prev) => {
      const existingInstances = Object.keys(prev).filter((name) => name.startsWith(standardName));
      const newIndex = existingInstances.length;

      // Add the new instance with an incremented index
      return {
        ...prev,
        [`${standardName}[${newIndex}]`]: true, // New instance with incremental index
      };
    });
  };

  // Remove a standard instance
  const handleRemoveStandard = (standardName) => {
    setSelectedStandards((prev) => {
      const newSelected = { ...prev };
      delete newSelected[standardName]; // Remove the specific instance
      return newSelected;
    });
  };

  // Toggle accordion open or closed
  const handleAccordionToggle = (standardName) => {
    setExpanded((prev) => (prev === standardName ? null : standardName));
  };

  const actions = [
    {
      label: "Save Template",
      handler: () => createDialog.handleOpen(),
      icon: <CheckCircleIcon />,
    },
  ];
  const createDialog = useDialog();

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
                createDialog={createDialog}
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
                  handleAddMultipleStandard={handleAddMultipleStandard} // Pass the handler for adding multiple
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
          handleToggleSingleStandard={handleToggleStandard} // Single standard toggle handler
          handleAddMultipleStandard={handleAddMultipleStandard} // Pass the handler for adding multiple
        />
      </Container>
    </Box>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
