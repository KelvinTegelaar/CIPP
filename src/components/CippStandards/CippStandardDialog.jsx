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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Divider,
} from "@mui/material";
import { Grid } from "@mui/system";
import { Add, Sort, Clear, FilterList } from "@mui/icons-material";
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
  
  // Enhanced filtering and sorting state
  const [sortBy, setSortBy] = useState("addedDate"); // Default sort by date added
  const [sortOrder, setSortOrder] = useState("desc"); // desc to show newest first
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedImpacts, setSelectedImpacts] = useState([]);
  const [selectedRecommendedBy, setSelectedRecommendedBy] = useState([]);
  const [showOnlyNew, setShowOnlyNew] = useState(false); // Show only standards added in last 30 days

  // Get all unique values for filters
  const { allCategories, allImpacts, allRecommendedBy } = useMemo(() => {
    const categorySet = new Set();
    const impactSet = new Set();
    const recommendedBySet = new Set();

    Object.keys(categories).forEach((category) => {
      categorySet.add(category);
      categories[category].forEach((standard) => {
        if (standard.impact) impactSet.add(standard.impact);
        if (standard.recommendedBy && Array.isArray(standard.recommendedBy)) {
          standard.recommendedBy.forEach(rec => recommendedBySet.add(rec));
        }
      });
    });

    return {
      allCategories: Array.from(categorySet).sort(),
      allImpacts: Array.from(impactSet).sort(),
      allRecommendedBy: Array.from(recommendedBySet).sort(),
    };
  }, [categories]);

  // Enhanced filter function
  const enhancedFilterStandards = useCallback((standardsList) => {
    return standardsList.filter((standard) => {
      // Original text search
      const matchesSearch = !localSearchQuery || 
        standard.label.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        standard.helpText.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        (standard.tag && standard.tag.some((tag) => 
          tag.toLowerCase().includes(localSearchQuery.toLowerCase())
        ));

      // Category filter
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.includes(standard.cat);

      // Impact filter
      const matchesImpact = selectedImpacts.length === 0 || 
        selectedImpacts.includes(standard.impact);

      // Recommended by filter
      const matchesRecommendedBy = selectedRecommendedBy.length === 0 || 
        (standard.recommendedBy && Array.isArray(standard.recommendedBy) &&
         standard.recommendedBy.some(rec => selectedRecommendedBy.includes(rec)));

      // New standards filter (last 30 days)
      const isNewStandard = (dateAdded) => {
        if (!dateAdded) return false;
        const currentDate = new Date();
        const addedDate = new Date(dateAdded);
        return differenceInDays(currentDate, addedDate) <= 30;
      };
      const matchesNewFilter = !showOnlyNew || isNewStandard(standard.addedDate);

      return matchesSearch && matchesCategory && matchesImpact && matchesRecommendedBy && matchesNewFilter;
    });
  }, [localSearchQuery, selectedCategories, selectedImpacts, selectedRecommendedBy, showOnlyNew]);

  // Enhanced sort function
  const sortStandards = useCallback((standardsList) => {
    return [...standardsList].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "label":
          aValue = a.label.toLowerCase();
          bValue = b.label.toLowerCase();
          break;
        case "addedDate":
          aValue = new Date(a.addedDate || "1900-01-01");
          bValue = new Date(b.addedDate || "1900-01-01");
          break;
        case "category":
          aValue = a.cat?.toLowerCase() || "";
          bValue = b.cat?.toLowerCase() || "";
          break;
        case "impact":
          // Sort by impact priority: High > Medium > Low
          const impactOrder = { "High Impact": 3, "Medium Impact": 2, "Low Impact": 1 };
          aValue = impactOrder[a.impact] || 0;
          bValue = impactOrder[b.impact] || 0;
          break;
        case "recommendedBy":
          aValue = (a.recommendedBy && a.recommendedBy.length > 0) ? a.recommendedBy.join(", ").toLowerCase() : "";
          bValue = (b.recommendedBy && b.recommendedBy.length > 0) ? b.recommendedBy.join(", ").toLowerCase() : "";
          break;
        default:
          aValue = a.label.toLowerCase();
          bValue = b.label.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [sortBy, sortOrder]);

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
      const value = e.target.value;
      setLocalSearchQuery(value);
      handleSearchQueryChange(value);
    },
    [handleSearchQueryChange]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setLocalSearchQuery("");
    setSelectedCategories([]);
    setSelectedImpacts([]);
    setSelectedRecommendedBy([]);
    setShowOnlyNew(false);
    setSortBy("addedDate");
    setSortOrder("desc");
    handleSearchQueryChange("");
  }, [handleSearchQueryChange]);

  // Clear dialog state on close
  const handleClose = useCallback(() => {
    setLocalSearchQuery(""); // Clear local search state
    setSelectedCategories([]);
    setSelectedImpacts([]);
    setSelectedRecommendedBy([]);
    setShowOnlyNew(false);
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
          const categoryStandards = categories[category];
          const filteredStandards = enhancedFilterStandards(categoryStandards);
          
          filteredStandards.forEach((standard) => {
            allItems.push({
              standard,
              category,
            });
          });
        });

        // Apply sorting to the final combined array instead of per-category
        const sortedAllItems = sortStandards(allItems.map(item => item.standard)).map(standard => {
          const item = allItems.find(item => item.standard.name === standard.name);
          return item;
        });

        setProcessedItems(sortedAllItems);
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
  }, [dialogOpen, categories, enhancedFilterStandards, sortStandards]);

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

  // Count active filters
  const activeFiltersCount = selectedCategories.length + selectedImpacts.length + selectedRecommendedBy.length + (showOnlyNew ? 1 : 0);

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
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle>Select a Standard to Add</DialogTitle>
      <DialogContent sx={{ backgroundColor: "background.default", pb: 1 }}>
        {/* Search and Filter Controls */}
        <Box sx={{ mt: 2, mb: 3 }}>
          {/* Search Box */}
          <TextField
            label="Search Standards"
            fullWidth
            onChange={handleLocalSearchChange}
            value={localSearchQuery}
            autoComplete="off"
            placeholder="Search by name, description, or tags..."
            sx={{ mb: 3 }}
          />

          {/* Filter Controls Section */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
              Sort & Filter Options
            </Typography>
            
            {/* Sort Controls Row */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{ height: 45 }}
                >
                  <MenuItem value="label">Name</MenuItem>
                  <MenuItem value="addedDate">Date Added</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Order</InputLabel>
                <Select
                  value={sortOrder}
                  label="Order"
                  onChange={(e) => setSortOrder(e.target.value)}
                  sx={{ height: 45 }}
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>

              {/* Clear All Filters Button */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={clearAllFilters}
                  sx={{ ml: 'auto', height: 45 }}
                >
                  Clear All ({activeFiltersCount})
                </Button>
              )}
            </Box>

            {/* Filter Controls Row */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Category Filter */}
              <FormControl sx={{ minWidth: 220 }}>
                <InputLabel>Categories</InputLabel>
                <Select
                  multiple
                  value={selectedCategories}
                  label="Categories"
                  onChange={(e) => setSelectedCategories(e.target.value)}
                  sx={{ height: 45 }}
                  renderValue={(selected) => 
                    selected.length === 0 ? "All Categories" : `${selected.length} selected`
                  }
                >
                  {allCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Impact Filter */}
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Impact</InputLabel>
                <Select
                  multiple
                  value={selectedImpacts}
                  label="Impact"
                  onChange={(e) => setSelectedImpacts(e.target.value)}
                  sx={{ height: 45 }}
                  renderValue={(selected) => 
                    selected.length === 0 ? "All Impacts" : `${selected.length} selected`
                  }
                >
                  {allImpacts.map((impact) => (
                    <MenuItem key={impact} value={impact}>
                      {impact}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Recommended By Filter */}
              <FormControl sx={{ minWidth: 220 }}>
                <InputLabel>Recommended By</InputLabel>
                <Select
                  multiple
                  value={selectedRecommendedBy}
                  label="Recommended By"
                  onChange={(e) => setSelectedRecommendedBy(e.target.value)}
                  sx={{ height: 45 }}
                  renderValue={(selected) => 
                    selected.length === 0 ? "All Recommendations" : `${selected.length} selected`
                  }
                >
                  {allRecommendedBy.map((rec) => (
                    <MenuItem key={rec} value={rec}>
                      {rec}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* New Standards Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={showOnlyNew}
                    onChange={(e) => setShowOnlyNew(e.target.checked)}
                  />
                }
                label="New (30 days)"
                sx={{ ml: 1 }}
              />
            </Box>
          </Box>

          {/* Active Filter Chips */}
          {activeFiltersCount > 0 && (
            <Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {selectedCategories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    size="small"
                    onDelete={() => setSelectedCategories(prev => prev.filter(c => c !== category))}
                    color="primary"
                    variant="outlined"
                  />
                ))}
                {selectedImpacts.map((impact) => (
                  <Chip
                    key={impact}
                    label={impact}
                    size="small"
                    onDelete={() => setSelectedImpacts(prev => prev.filter(i => i !== impact))}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
                {selectedRecommendedBy.map((rec) => (
                  <Chip
                    key={rec}
                    label={rec}
                    size="small"
                    onDelete={() => setSelectedRecommendedBy(prev => prev.filter(r => r !== rec))}
                    color="success"
                    variant="outlined"
                  />
                ))}
                {showOnlyNew && (
                  <Chip
                    label="New Standards"
                    size="small"
                    onDelete={() => setShowOnlyNew(false)}
                    color="info"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>
          )}

          <Divider />
        </Box>

        {/* Results */}
        {isInitialLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : processedItems.length === 0 ? (
          <Box sx={{ textAlign: "center", p: 4 }}>
            <Typography variant="h6" color="textSecondary">
              No standards match your search and filter criteria
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Try adjusting your search terms or clearing some filters
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Showing {processedItems.length} standard{processedItems.length !== 1 ? 's' : ''}
            </Typography>
            <VirtualizedStandardGrid items={processedItems} renderItem={renderStandardCard} />
          </Box>
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
