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
      setSearchQuery(query);
    }, 50),
    []
  );

  return (
    <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xxl">
      <DialogTitle>Select a Standard to Add</DialogTitle>
      <DialogContent sx={{ backgroundColor: "background.default" }}>
        <TextField
          label="Filter Standards"
          fullWidth
          sx={{ mb: 3, mt: 3 }}
          onChange={(e) => handleSearchQueryChange(e.target.value.toLowerCase())}
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
