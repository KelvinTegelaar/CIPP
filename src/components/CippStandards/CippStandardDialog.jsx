import { differenceInDays } from 'date-fns';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
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
import { Grid } from "@mui/system";
import { Add } from "@mui/icons-material";
import { useState, useCallback } from "react";
import { debounce } from "lodash";

const CippStandardDialog = ({
  dialogOpen,
  handleCloseDialog,
  setSearchQuery,
  categories,
  filterStandards,
  selectedStandards,
  handleToggleSingleStandard,
  handleAddMultipleStandard,
}) => {
  const [isButtonDisabled, setButtonDisabled] = useState(false);

  const handleAddClick = (standardName) => {
    setButtonDisabled(true);
    handleAddMultipleStandard(standardName);

    setTimeout(() => {
      setButtonDisabled(false);
    }, 100);
  };

  const handleSearchQueryChange = useCallback(
    debounce((query) => {
      setSearchQuery(query.trim());
    }, 50),
    []
  );

  const isNewStandard = (dateAdded) => {
    const currentDate = new Date();
    const addedDate = new Date(dateAdded);
    return differenceInDays(currentDate, addedDate) <= 30;
  };

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleCloseDialog}
      maxWidth="xxl"
      fullWidth
      PaperProps={{
        sx: {
          minWidth: "720px",
        },
      }}
    >
      <DialogTitle>Select a Standard to Add</DialogTitle>
      <DialogContent sx={{ backgroundColor: "background.default" }}>
        <TextField
          label="Filter Standards"
          fullWidth
          sx={{ mt: 3 }}
          onChange={(e) => handleSearchQueryChange(e.target.value.toLowerCase())}
        />
        <Grid container spacing={3} sx={{ overflowY: "auto", maxHeight: "60vh", mt: 2 }}>
          {Object.keys(categories).every(
            (category) => filterStandards(categories[category]).length === 0
          ) ? (
            <Typography
              variant="h6"
              color="textSecondary"
              sx={{ mt: 4, textAlign: "center", width: "100%" }}
            >
              Search returned no results
            </Typography>
          ) : (
            Object.keys(categories).map((category) =>
              filterStandards(categories[category]).map((standard) => (
                <Grid item size={{ md: 3, xs: 12 }} key={standard.name}>
                  <Card
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      position: "relative",
                    }}
                  >
                    {isNewStandard(standard.addedDate) && (
                      <Chip
                        label="New"
                        size="small"
                        color="success"
                        sx={{ position: "absolute"}}
                      />
                    )}
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
                      {standard.addedDate?.length > 0 && (
                        <>
                          <Typography variant="subtitle2" sx={{ mt: 2 }}>
                            Date Added:
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="body2" color="textSecondary">
                              {standard.addedDate}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </CardContent>

                    <CardContent>
                      {standard.multiple ? (
                        <IconButton
                          color="primary"
                          disabled={isButtonDisabled}
                          onClick={() => handleAddClick(standard.name)}
                        >
                          <Add />
                        </IconButton>
                      ) : (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={!!selectedStandards[standard.name]}
                              onChange={() => handleToggleSingleStandard(standard.name)}
                            />
                          }
                          label="Add this standard to the template"
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )
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

export default CippStandardDialog;
