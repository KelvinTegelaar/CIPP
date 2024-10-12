import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  SvgIcon,
  TextField,
  Typography,
  Chip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import CippFormComponent from "../../../components/CippComponents/CippFormComponent";
import { useRouter } from "next/router";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import CippButtonCard from "../../../components/CippCards/CippButtonCard";
import { useState } from "react";
import standards from "/src/data/standards";

const Page = () => {
  const router = useRouter();
  const handleBackClick = () => {
    router.back(); // Navigate to the previous page when the button is clicked
  };
  const formControl = useForm({ mode: "onChange" });
  const watcher = useWatch({ control: formControl.control });

  // State to manage dialog visibility, selected category, and toggled standards
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStandards, setSelectedStandards] = useState({});

  // Group standards by categories
  const categories = standards.reduce((acc, standard) => {
    const { cat } = standard;
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(standard);
    return acc;
  }, {});

  // Function to handle opening the dialog
  const handleOpenDialog = (category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  // Function to handle closing the dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCategory(null);
  };

  // Search filtering function
  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filterStandards = (standardsList) => {
    return standardsList.filter(
      (standard) =>
        standard.label.toLowerCase().includes(searchQuery) ||
        standard.helpText.toLowerCase().includes(searchQuery) ||
        (standard.tag && standard.tag.some((tag) => tag.toLowerCase().includes(searchQuery)))
    );
  };

  // Handle slider (switch) change for selecting standards
  const handleToggleStandard = (standardName) => {
    setSelectedStandards((prev) => ({
      ...prev,
      [standardName]: !prev[standardName],
    }));
  };

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Stack spacing={2}>
            <div>
              <Button
                color="inherit"
                onClick={handleBackClick}
                startIcon={
                  <SvgIcon fontSize="small">
                    <ArrowLeftIcon />
                  </SvgIcon>
                }
              >
                Back to Templates
              </Button>
            </div>
            <div>
              <Typography variant="h4">Add Standards Template</Typography>
            </div>
          </Stack>
        </Stack>

        <Stack spacing={3}>
          <Card>
            <CardContent>
              <CippFormComponent
                type="textField"
                fullWidth
                label="Template Name"
                name="templateName"
                placeholder="Enter a name for the template"
                formControl={formControl}
              />
            </CardContent>
          </Card>

          {/* Loop through each category */}
          {Object.keys(categories).map((category) => (
            <CippButtonCard
              key={category}
              cardActions={
                <Button color="primary" variant="text" onClick={() => handleOpenDialog(category)}>
                  Add {category} Standard
                </Button>
              }
              title={category}
            >
              <Typography>No configured {category} settings.</Typography>
            </CippButtonCard>
          ))}
        </Stack>

        {/* Dialog for adding a standard */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xxl" fullWidth>
          <DialogTitle>
            <Typography variant="h6">Select a Standard to Add</Typography>
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: "background.default" }}>
            {/* Search filter box */}
            <TextField
              label="Filter Standards"
              variant="outlined"
              fullWidth
              sx={{ mb: 3, mt: 3 }}
              value={searchQuery}
              onChange={handleSearch}
            />

            {/* Display the filtered standards */}
            {selectedCategory && categories[selectedCategory] ? (
              <Grid container spacing={3}>
                {filterStandards(categories[selectedCategory]).map((standard) => (
                  <Grid item xs={12} md={3} key={standard.name}>
                    <Card
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%", // Ensures all cards have the same height
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {standard.label}
                        </Typography>

                        {/* Description with a line break */}
                        {standard.helpText && (
                          <>
                            <Typography variant="subtitle2" sx={{ mt: 2 }}>
                              Description:
                            </Typography>
                            <Typography variant="body2" color="textSecondary" paragraph>
                              {standard.helpText}
                            </Typography>
                          </>
                        )}

                        {/* Tags with their own heading, filtering out any tag with "impact" */}
                        {standard.tag?.filter((tag) => !tag.toLowerCase().includes("impact"))
                          .length > 0 && (
                          <>
                            <Typography variant="subtitle2" sx={{ mt: 2 }}>
                              Tags:
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", mb: 2 }}>
                              {standard.tag
                                .filter((tag) => !tag.toLowerCase().includes("impact"))
                                .map((tag, idx) => (
                                  <Chip
                                    key={idx}
                                    label={tag}
                                    size="small"
                                    color="info"
                                    sx={{ mr: 1, mt: 1 }}
                                  />
                                ))}
                            </Box>
                          </>
                        )}

                        {/* Impact */}
                        <Typography variant="subtitle2" sx={{ mt: 2 }}>
                          Impact:
                        </Typography>
                        <Chip
                          label={standard.impact}
                          size="small"
                          color={
                            standard.impact === "High Impact"
                              ? "error"
                              : standard.impact === "Medium Impact"
                              ? "warning"
                              : "info"
                          }
                        />

                        {/* Recommended By */}
                        {standard.recommendedBy?.length > 0 && (
                          <>
                            <Typography variant="subtitle2" sx={{ mt: 2 }}>
                              Recommended By:
                            </Typography>
                            <Typography variant="body2" color="textSecondary" paragraph>
                              {standard.recommendedBy.join(", ")}
                            </Typography>
                          </>
                        )}
                      </CardContent>

                      <CardContent>
                        {/* Slider switch for selecting the standard */}
                        <FormControlLabel
                          control={
                            <Switch
                              checked={selectedStandards[standard.name] || false}
                              onChange={() => handleToggleStandard(standard.name)}
                            />
                          }
                          label="Select Standard"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>No standards available in this category.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => {
                console.log("Selected standards:", selectedStandards);
                handleCloseDialog();
              }}
            >
              Select
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
