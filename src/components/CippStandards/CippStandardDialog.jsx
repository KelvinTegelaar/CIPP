import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  FormControlLabel,
  Switch,
  Button,
  IconButton,
} from "@mui/material";
import PropTypes from "prop-types";
import { Add } from "@mui/icons-material";
import { useState } from "react";

const CippStandardDialog = ({
  dialogOpen,
  handleCloseDialog,
  searchQuery,
  setSearchQuery,
  categories,
  filterStandards,
  selectedStandards,
  handleToggleSingleStandard, // Renaming for clarity
  handleAddMultipleStandard,
}) => {
  const [isButtonDisabled, setButtonDisabled] = useState(false);

  // Helper function to handle the + button logic
  const handleAddClick = (standardName) => {
    setButtonDisabled(true); // Disable button briefly
    handleAddMultipleStandard(standardName);

    setTimeout(() => {
      setButtonDisabled(false); // Re-enable after 100ms
    }, 100); // 100ms delay to show the effect
  };

  return (
    <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xxl">
      <DialogTitle>Select a Standard to Add</DialogTitle>
      <DialogContent sx={{ backgroundColor: "background.default" }}>
        <TextField
          label="Filter Standards"
          variant="outlined"
          fullWidth
          sx={{ mb: 3, mt: 3 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
        />
        <Grid container spacing={3}>
          {Object.keys(categories).map((category) =>
            filterStandards(categories[category]).map((standard) => (
              <Grid item xs={12} md={3} key={standard.name}>
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {standard.label}
                    </Typography>
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
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>
                      Category:
                    </Typography>
                    <Chip label={category} size="small" color="primary" sx={{ mt: 1, mb: 2 }} />
                    {standard.tag?.filter((tag) => !tag.toLowerCase().includes("impact")).length >
                      0 && (
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
                    {standard.multiple ? (
                      // Show + button for standards with `multiple: true`
                      <IconButton
                        color="primary"
                        disabled={isButtonDisabled}
                        onClick={() => handleAddClick(standard.name)}
                      >
                        <Add />
                      </IconButton>
                    ) : (
                      // Show Switch for single standards
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!selectedStandards[standard.name]} // Ensure a single value toggle
                            onChange={() => handleToggleSingleStandard(standard.name)} // Handle single standard toggle
                          />
                        }
                        label="Add this standard to the template"
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => {
            handleCloseDialog();
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

CippStandardDialog.propTypes = {
  dialogOpen: PropTypes.bool.isRequired,
  handleCloseDialog: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  categories: PropTypes.object.isRequired,
  filterStandards: PropTypes.func.isRequired,
  selectedStandards: PropTypes.object.isRequired,
  handleToggleSingleStandard: PropTypes.func.isRequired, // Updated PropType for single toggle
  handleAddMultipleStandard: PropTypes.func.isRequired,
};

export default CippStandardDialog;
