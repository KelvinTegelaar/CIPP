import { differenceInDays } from "date-fns";
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
  CircularProgress,
} from "@mui/material";
import { Grid } from "@mui/system";
import { Add } from "@mui/icons-material";
import { useState, useCallback, useMemo, memo, useEffect } from "react";
import { debounce } from "lodash";
import { Virtuoso } from "react-virtuoso";

// Memoized Standard Card component to prevent unnecessary re-renders
const StandardCard = memo(
  ({
    standard,
    category,
    selectedStandards,
    handleToggleSingleStandard,
    handleAddClick,
    isButtonDisabled,
  }) => {
    const isNewStandard = (dateAdded) => {
      const currentDate = new Date();
      const addedDate = new Date(dateAdded);
      return differenceInDays(currentDate, addedDate) <= 30;
    };

    // Create a memoized handler for this specific standard to avoid recreation on each render
    const handleToggle = useCallback(() => {
      handleToggleSingleStandard(standard.name);
    }, [handleToggleSingleStandard, standard.name]);

    // Check if this standard is selected - memoize for better performance
    const isSelected = useMemo(() => {
      return !!selectedStandards[standard.name];
    }, [selectedStandards, standard.name]);

    // Lazily render complex parts of the card only when visible
    const [expanded, setExpanded] = useState(false);

    // Use intersection observer to detect when card is visible
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setExpanded(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      const currentRef = document.getElementById(`standard-card-${standard.name}`);
      if (currentRef) {
        observer.observe(currentRef);
      }

      return () => observer.disconnect();
    }, [standard.name]);

    return (
      <Grid size={{ xs: 12, md: 3 }} key={standard.name}>
        <Card
          id={`standard-card-${standard.name}`}
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            position: "relative",
            m: 0,
          }}
        >
          {isNewStandard(standard.addedDate) && (
            <Chip label="New" size="small" color="success" sx={{ position: "absolute" }} />
          )}
          <CardContent sx={{ flexGrow: 1, pt: 3, pb: 1 }}>
            <Typography variant="h6" gutterBottom>
              {standard.label}
            </Typography>
            {expanded && standard.helpText && (
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
            {expanded &&
              standard.tag?.filter((tag) => !tag.toLowerCase().includes("impact")).length > 0 && (
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
            {expanded && standard.recommendedBy?.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  Recommended By:
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {standard.recommendedBy.join(", ")}
                </Typography>
              </>
            )}
            {expanded && standard.addedDate?.length > 0 && (
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

          <CardContent sx={{ pt: 1, pb: 2 }}>
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
                    checked={isSelected}
                    onChange={handleToggle}
                    // Add these props to improve performance
                    color="primary"
                    edge="start"
                    size="medium"
                    // Disable animation for better performance
                    disableRipple
                  />
                }
                label="Add this standard to the template"
              />
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  },
  // Custom equality function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    // Only re-render if one of these props changed
    if (prevProps.isButtonDisabled !== nextProps.isButtonDisabled) return false;
    if (prevProps.standard.name !== nextProps.standard.name) return false;

    // Only check selected state for this specific standard
    const prevSelected = !!prevProps.selectedStandards[prevProps.standard.name];
    const nextSelected = !!nextProps.selectedStandards[nextProps.standard.name];
    if (prevSelected !== nextSelected) return false;

    // If we get here, nothing important changed, skip re-render
    return true;
  }
);

StandardCard.displayName = "StandardCard";

// Virtualized grid to handle large numbers of standards efficiently
const VirtualizedStandardGrid = memo(({ items, renderItem }) => {
  const [itemsPerRow, setItemsPerRow] = useState(() =>
    window.innerWidth > 960 ? 4 : window.innerWidth > 600 ? 2 : 1
  );

  // Handle window resize for responsive grid
  useEffect(() => {
    const handleResize = () => {
      const newItemsPerRow = window.innerWidth > 960 ? 4 : window.innerWidth > 600 ? 2 : 1;
      setItemsPerRow(newItemsPerRow);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const rows = useMemo(() => {
    const rowCount = Math.ceil(items.length / itemsPerRow);
    const rowsData = [];

    for (let i = 0; i < rowCount; i++) {
      const startIdx = i * itemsPerRow;
      const rowItems = items.slice(startIdx, startIdx + itemsPerRow);
      rowsData.push(rowItems);
    }

    return rowsData;
  }, [items, itemsPerRow]);

  return (
    <Virtuoso
      style={{ height: "60vh", width: "100%" }}
      totalCount={rows.length}
      overscan={5}
      defaultItemHeight={320} // Provide estimated row height for better virtualization
      itemContent={(index) => (
        <Box sx={{ pt: index === 0 ? 0 : 2 }}>
          <Grid container spacing={2} sx={{ width: "100%", m: 0 }}>
            {rows[index].map(renderItem)}
          </Grid>
        </Box>
      )}
    />
  );
});

VirtualizedStandardGrid.displayName = "VirtualizedStandardGrid";

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
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Optimize handleAddClick to be more performant
  const handleAddClick = useCallback(
    (standardName) => {
      setButtonDisabled(true);
      handleAddMultipleStandard(standardName);
      // Use requestAnimationFrame for smoother UI updates
      requestAnimationFrame(() => {
        setTimeout(() => {
          setButtonDisabled(false);
        }, 100);
      });
    },
    [handleAddMultipleStandard]
  );

  // Optimize search debounce with a higher timeout for better performance
  const handleSearchQueryChange = useCallback(
    debounce((query) => {
      setSearchQuery(query.trim());
    }, 350), // Increased debounce time for better performance
    [setSearchQuery]
  );

  // Only process visible categories on demand to improve performance
  const [processedItems, setProcessedItems] = useState([]);

  // Handle search input change locally
  const handleLocalSearchChange = useCallback(
    (e) => {
      const value = e.target.value.toLowerCase();
      setLocalSearchQuery(value);
      handleSearchQueryChange(value);
    },
    [handleSearchQueryChange]
  );

  // Clear dialog state on close
  const handleClose = useCallback(() => {
    setLocalSearchQuery(""); // Clear local search state
    handleSearchQueryChange(""); // Clear parent search state
    handleCloseDialog();
  }, [handleCloseDialog, handleSearchQueryChange]);

  // Process standards data only when dialog is opened, to improve performance
  useEffect(() => {
    if (dialogOpen) {
      // Use requestIdleCallback if available, or setTimeout as fallback
      const processStandards = () => {
        // Create a flattened list of all standards for virtualized rendering
        const allItems = [];

        Object.keys(categories).forEach((category) => {
          const filteredStandards = filterStandards(categories[category]);
          filteredStandards.forEach((standard) => {
            allItems.push({
              standard,
              category,
            });
          });
        });

        setProcessedItems(allItems);
        setIsInitialLoading(false);
      };

      if (window.requestIdleCallback) {
        window.requestIdleCallback(processStandards, { timeout: 500 });
      } else {
        setTimeout(processStandards, 100);
      }

      return () => {
        if (window.cancelIdleCallback) {
          window.cancelIdleCallback(processStandards);
        }
      };
    } else {
      setIsInitialLoading(true);
    }
  }, [dialogOpen, categories, filterStandards, localSearchQuery]);

  // Render individual standard card
  const renderStandardCard = useCallback(
    ({ standard, category }) => (
      <StandardCard
        key={standard.name}
        standard={standard}
        category={category}
        selectedStandards={selectedStandards}
        handleToggleSingleStandard={handleToggleSingleStandard}
        handleAddClick={handleAddClick}
        isButtonDisabled={isButtonDisabled}
      />
    ),
    [selectedStandards, handleToggleSingleStandard, handleAddClick, isButtonDisabled]
  );

  // Don't render dialog contents until it's actually open (improves performance)
  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      maxWidth="xxl"
      fullWidth
      keepMounted={false}
      TransitionProps={{
        onExited: () => {
          // Clear processed items on dialog close to free up memory
          setProcessedItems([]);
        },
      }}
      PaperProps={{
        sx: {
          minWidth: "720px",
        },
      }}
    >
      <DialogTitle>Select a Standard to Add</DialogTitle>
      <DialogContent sx={{ backgroundColor: "background.default", pb: 1 }}>
        <TextField
          label="Filter Standards"
          fullWidth
          sx={{ mt: 3, mb: 3 }}
          onChange={handleLocalSearchChange}
          value={localSearchQuery}
          autoComplete="off"
        />

        {isInitialLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : processedItems.length === 0 ? (
          <Typography
            variant="h6"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center", width: "100%" }}
          >
            Search returned no results
          </Typography>
        ) : (
          <VirtualizedStandardGrid items={processedItems} renderItem={renderStandardCard} />
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CippStandardDialog;
