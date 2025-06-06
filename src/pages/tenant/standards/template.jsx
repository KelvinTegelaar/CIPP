import { Box, Button, Container, Stack, Typography, SvgIcon, Skeleton } from "@mui/material";
import { Grid } from "@mui/system";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/router";
import { Add, SaveRounded } from "@mui/icons-material";
import { useEffect, useState, useCallback, useMemo, useRef, lazy, Suspense } from "react";
import standards from "/src/data/standards";
import CippStandardAccordion from "../../../components/CippStandards/CippStandardAccordion";
// Lazy load the dialog to improve initial page load performance
const CippStandardDialog = lazy(() =>
  import("../../../components/CippStandards/CippStandardDialog")
);
import CippStandardsSideBar from "../../../components/CippStandards/CippStandardsSideBar";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import { useDialog } from "../../../hooks/use-dialog";
import { ApiGetCall } from "../../../api/ApiCall";
import _ from "lodash";

const Page = () => {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const formControl = useForm({ mode: "onBlur" });
  const { formState } = formControl;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStandards, setSelectedStandards] = useState({});
  const [updatedAt, setUpdatedAt] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const initialStandardsRef = useRef({});

  // Watch form values to check valid configuration
  const watchForm = useWatch({ control: formControl.control });

  const existingTemplate = ApiGetCall({
    url: `/api/listStandardTemplates`,
    data: { id: router.query.id },
    queryKey: `listStandardTemplates-${router.query.id}`,
    waiting: editMode,
  });

  // Check if the template configuration is valid and update currentStep
  useEffect(() => {
    const stepsStatus = {
      step1: !!_.get(watchForm, "templateName"),
      step2: _.get(watchForm, "tenantFilter", []).length > 0,
      step3: Object.keys(selectedStandards).length > 0,
      step4:
        _.get(watchForm, "standards") &&
        Object.keys(selectedStandards).length > 0 &&
        Object.keys(selectedStandards).every((standardName) => {
          const standardValues = _.get(watchForm, standardName, {});
          // Always require an action value which should be an array with at least one element
          const actionValue = _.get(standardValues, "action");
          return actionValue && (!Array.isArray(actionValue) || actionValue.length > 0);
        }),
    };

    const completedSteps = Object.values(stepsStatus).filter(Boolean).length;
    setCurrentStep(completedSteps);
  }, [selectedStandards, watchForm]);

  // Handle route change events
  const handleRouteChange = useCallback(
    (url) => {
      if (hasUnsavedChanges) {
        const confirmLeave = window.confirm(
          "You have unsaved changes. Are you sure you want to leave this page?"
        );
        if (!confirmLeave) {
          router.events.emit("routeChangeError");
          throw "Route change was aborted";
        }
      }
    },
    [hasUnsavedChanges, router]
  );

  // Handle browser back/forward navigation or tab close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave this page?";
        return e.returnValue;
      }
    };

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    router.events.on("routeChangeStart", handleRouteChange);

    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [hasUnsavedChanges, handleRouteChange, router.events]);

  // Track form changes
  useEffect(() => {
    // Compare the current form values with the initial values to check for real changes
    const currentValues = formControl.getValues();
    const initialValues = initialStandardsRef.current;

    if (
      formState.isDirty ||
      JSON.stringify(selectedStandards) !== JSON.stringify(initialStandardsRef.current)
    ) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [formState.isDirty, selectedStandards, formControl]);

  useEffect(() => {
    if (router.query.id) {
      setEditMode(true);
    }

    if (existingTemplate.isSuccess) {
      //formControl.reset(existingTemplate.data?.[0]);
      const apiData = existingTemplate.data?.[0];

      Object.keys(apiData.standards).forEach((key) => {
        if (Array.isArray(apiData.standards[key])) {
          apiData.standards[key] = apiData.standards[key].filter(
            (value) => value !== null && value !== undefined
          );
        }
      });

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
      // Store initial state for change detection
      initialStandardsRef.current = { ...transformedStandards };
      setHasUnsavedChanges(false);
    }
  }, [existingTemplate.isSuccess, router]);

  // Memoize categories to avoid unnecessary recalculations
  const categories = useMemo(() => {
    return standards.reduce((acc, standard) => {
      const { cat } = standard;
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(standard);
      return acc;
    }, {});
  }, []);

  const handleOpenDialog = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setSearchQuery("");
  }, []);

  const filterStandards = (standardsList) =>
    standardsList.filter(
      (standard) =>
        standard.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        standard.helpText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (standard.tag &&
          standard.tag.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
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

  const createDialog = useDialog();

  // Save action that will open the create dialog
  const handleSave = () => {
    createDialog.handleOpen();
    // Will be set to false after successful save in the dialog component
  };

  // Determine if save button should be disabled based on configuration
  const isSaveDisabled =
    !_.get(watchForm, "tenantFilter") ||
    !_.get(watchForm, "tenantFilter").length ||
    currentStep < 3;

  const actions = [];

  const steps = [
    "Set a name for the Template",
    "Assigned Template to Tenants",
    "Added Standards to Template",
    "Configured all Standards",
  ];

  const handleSafeNavigation = (url) => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave this page?"
      );
      if (confirmLeave) {
        router.push(url);
      }
    } else {
      router.push(url);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth={"xl"}>
        <Stack spacing={4}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Button
              color="inherit"
              onClick={() =>
                hasUnsavedChanges
                  ? window.confirm(
                      "You have unsaved changes. Are you sure you want to leave this page?"
                    ) && router.back()
                  : router.back()
              }
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
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                startIcon={<SaveRounded />}
                disabled={isSaveDisabled}
              >
                Save Template
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleOpenDialog}
                startIcon={<Add />}
              >
                Add Standard to Template
              </Button>
            </Stack>
          </Stack>

          <Grid container spacing={3}>
            {/* Left Column for Accordions */}
            <Grid size={{ xs: 12, lg: 4 }}>
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
                onSaveSuccess={() => {
                  // Reset unsaved changes flag
                  setHasUnsavedChanges(false);
                  // Update reference for future change detection
                  initialStandardsRef.current = { ...selectedStandards };
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Stack spacing={3}>
                {/* Show accordions based on selectedStandards (which is populated by API when editing) */}
                {existingTemplate.isLoading ? (
                  <Skeleton variant="rectangular" height="700px" />
                ) : (
                  <CippStandardAccordion
                    standards={standards}
                    selectedStandards={selectedStandards} // Render only the relevant standards
                    expanded={expanded}
                    handleAccordionToggle={handleAccordionToggle}
                    handleRemoveStandard={handleRemoveStandard}
                    handleAddMultipleStandard={handleAddMultipleStandard} // Pass the handler for adding multiple
                    formControl={formControl}
                    editMode={editMode}
                  />
                )}
              </Stack>
            </Grid>
          </Grid>
        </Stack>

        {/* Only render the dialog when it's needed */}
        {dialogOpen && (
          <Suspense fallback={<div />}>
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
          </Suspense>
        )}
      </Container>
    </Box>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
