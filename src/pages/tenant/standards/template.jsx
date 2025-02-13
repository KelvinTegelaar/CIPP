import { Box, Button, Container, Stack, Typography, SvgIcon, Grid, Skeleton } from "@mui/material";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { Add } from "@mui/icons-material";
import { useEffect, useState } from "react";
import standards from "/src/data/standards";
import CippStandardAccordion from "../../../components/CippStandards/CippStandardAccordion";
import CippStandardDialog from "../../../components/CippStandards/CippStandardDialog";
import CippStandardsSideBar from "../../../components/CippStandards/CippStandardsSideBar";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useDialog } from "../../../hooks/use-dialog";
import { ApiGetCall } from "../../../api/ApiCall";

const Page = () => {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const formControl = useForm({ mode: "onBlur" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStandards, setSelectedStandards] = useState({});
  const [updatedAt, setUpdatedAt] = useState(false);
  const existingTemplate = ApiGetCall({
    url: `/api/listStandardTemplates`,
    data: { id: router.query.id },
    queryKey: `listStandardTemplates-${router.query.id}`,
    waiting: editMode,
  });
  useEffect(() => {
    if (router.query.id) {
      setEditMode(true);
    }

    if (existingTemplate.isSuccess) {
      formControl.reset(existingTemplate.data?.[0]);
      const apiData = existingTemplate.data?.[0];
      formControl.reset(apiData);
      if (router.query.clone) {
        formControl.setValue("templateName", `${apiData.templateName} (Clone)`);
        formControl.setValue("GUID", "");
      }
      //set the updated at date and user
      setUpdatedAt({
        date: apiData?.updatedAt,
        user: apiData?.updatedBy,
      });
      // Transform standards from the API to match the format for selectedStandards
      const standardsFromApi = apiData?.standards;
      const transformedStandards = {};

      Object.keys(standardsFromApi).forEach((key) => {
        if (Array.isArray(standardsFromApi[key])) {
          standardsFromApi[key].forEach((_, index) => {
            transformedStandards[`standards.${key}[${index}]`] = true;
          });
        } else {
          transformedStandards[`standards.${key}`] = true;
        }
      });

      setSelectedStandards(transformedStandards);
    }
  }, [existingTemplate.isSuccess, router]);

  const categories = standards.reduce((acc, standard) => {
    const { cat } = standard;
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(standard);
    return acc;
  }, {});

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSearchQuery("");
  };

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

  const handleAddMultipleStandard = (standardName) => {
    //if the standardname contains an array qualifier,e.g standardName[0], strip that away.
    const arrayPattern = /(.*)\[(\d+)\]$/;
    const match = standardName.match(arrayPattern);
    if (match) {
      standardName = match[1];
    }

    setSelectedStandards((prev) => {
      const existingInstances = Object.keys(prev).filter((name) => name.startsWith(standardName));
      const newIndex = existingInstances.length;

      return {
        ...prev,
        [`${standardName}[${newIndex}]`]: true,
      };
    });
  };

  const handleRemoveStandard = (standardName) => {
    setSelectedStandards((prev) => {
      const newSelected = { ...prev };
      delete newSelected[standardName];
      return newSelected;
    });

    const arrayPattern = /(.*)\[(\d+)\]$/;
    const match = standardName.match(arrayPattern);

    if (match) {
      const [_, baseName, index] = match;
      const currentArray = formControl.getValues(baseName) || [];
      const updatedArray = currentArray.filter((_, i) => i !== parseInt(index));
      formControl.setValue(baseName, updatedArray);
    } else {
      formControl.unregister(standardName);
    }
  };

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
    "Assigned Template to Tenants",
    "Added Standards to Template",
    "Configured all Standards",
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
            <Typography variant="h4">
              {editMode ? "Edit Standards Template" : "Add Standards Template"}
            </Typography>
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
                actions={actions}
                formControl={formControl}
                selectedStandards={selectedStandards}
                edit={editMode}
                updatedAt={updatedAt}
              />
            </Grid>
            <Grid item xs={12} lg={8}>
              <Stack spacing={3}>
                {existingTemplate.isLoading && <Skeleton />}
                {/* Show accordions based on selectedStandards (which is populated by API when editing) */}
                <CippStandardAccordion
                  standards={standards}
                  selectedStandards={selectedStandards} // Render only the relevant standards
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
