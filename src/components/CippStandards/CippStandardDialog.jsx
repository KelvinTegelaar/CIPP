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
  Collapse,
} from "@mui/material";
import { Grid } from "@mui/system";
import { Add, Sort, Clear, FilterList, ExpandMore, ExpandLess } from "@mui/icons-material";
import { useState, useCallback, useMemo, memo, useEffect } from "react";
import { debounce } from "lodash";
import { Virtuoso } from "react-virtuoso";
import ReactMarkdown from "react-markdown";

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
      <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }} key={standard.name}>
        <Box
          sx={{
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            ...(isNewStandard(standard.addedDate) && {
              mt: 1.5, // Add top margin to accommodate the "New" label
            })
          }}
        >
          {isNewStandard(standard.addedDate) && (
            <Chip
              label="New"
              size="small"
              color="success"
              sx={{
                position: 'absolute',
                top: -10,
                left: 12,
                zIndex: 1,
                fontSize: '0.7rem',
                height: 20,
                fontWeight: 'bold'
              }}
            />
          )}
        <Card
          id={`standard-card-${standard.name}`}
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            flex: 1,
            position: "relative",
            m: 0,
              ...(isNewStandard(standard.addedDate) && {
                border: '2px solid',
                borderColor: 'success.main'
              })
          }}
        >
          <CardContent sx={{ flexGrow: 1, pt: 3, pb: 1 }}>
            <Typography variant="h6" gutterBottom>
              {standard.label}
            </Typography>
            {expanded && standard.helpText && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  Description:
                </Typography>
                <Box
                  sx={{
                    // Style markdown links to match CIPP theme
                    "& a": {
                      color: (theme) => theme.palette.primary.main,
                      textDecoration: "underline",
                      "&:hover": {
                        textDecoration: "none",
                      },
                    },
                    color: "text.secondary",
                    fontSize: "0.875rem",
                    lineHeight: 1.43,
                    mb: 2,
                  }}
                >
                  <ReactMarkdown
                    components={{
                      // Make links open in new tab with security attributes
                      a: ({ href, children, ...props }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          {...props}
                        >
                          {children}
                        </a>
                      ),
                      // Convert paragraphs to spans to avoid unwanted spacing
                      p: ({ children }) => <span>{children}</span>,
                    }}
                  >
                    {standard.helpText}
                  </ReactMarkdown>
                </Box>
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
        </Box>
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
          <Grid 
            container 
            spacing={2} 
            sx={{ 
              width: "100%", 
              m: 0,
              display: 'flex',
              alignItems: 'stretch' // This ensures all items in the row have equal height
            }}
          >
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
  const [selectedTagFrameworks, setSelectedTagFrameworks] = useState([]);
  const [showOnlyNew, setShowOnlyNew] = useState(false); // Show only standards added in last 30 days
  const [filtersExpanded, setFiltersExpanded] = useState(true); // Control filter section collapse/expand

  // Auto-adjust sort order when sort type changes
  useEffect(() => {
    if (sortBy === "label") {
      setSortOrder("asc"); // Names: A-Z
    } else if (sortBy === "addedDate") {
      setSortOrder("desc"); // Dates: Newest first
    } else if (sortBy === "impact") {
      setSortOrder("desc"); // Impact: High to Low
    }
  }, [sortBy]);

  // Get all unique values for filters
  const { allCategories, allImpacts, allRecommendedBy, allTagFrameworks } = useMemo(() => {
    const categorySet = new Set();
    const impactSet = new Set();
    const recommendedBySet = new Set();
    const tagFrameworkSet = new Set();

          // Function to extract base framework from tag
      const extractTagFramework = (tag) => {
        // Compliance Frameworks - extract version dynamically
        if (tag.startsWith('CIS M365')) {
          const versionMatch = tag.match(/CIS M365 (\d+\.\d+)/);
          return versionMatch ? `CIS M365 ${versionMatch[1]}` : 'CIS M365';
        }
        if (tag.startsWith('CISA ')) return 'CISA';
        if (tag.startsWith('EIDSCA.')) return 'EIDSCA';
        if (tag.startsWith('Essential 8')) return 'Essential 8';
        if (tag.startsWith('NIST CSF')) {
          const versionMatch = tag.match(/NIST CSF (\d+\.\d+)/);
          return versionMatch ? `NIST CSF ${versionMatch[1]}` : 'NIST CSF';
        }
        
        // Microsoft Secure Score Categories
        if (tag.startsWith('exo_')) return 'Secure Score - Exchange';
        if (tag.startsWith('mdo_')) return 'Secure Score - Defender';
        if (tag.startsWith('spo_')) return 'Secure Score - SharePoint';
        if (tag.startsWith('mip_')) return 'Secure Score - Purview';
        
        // For any other tags, return null to exclude them
        return null;
      };

    Object.keys(categories).forEach((category) => {
      categorySet.add(category);
      categories[category].forEach((standard) => {
        if (standard.impact) impactSet.add(standard.impact);
        if (standard.recommendedBy && Array.isArray(standard.recommendedBy)) {
          standard.recommendedBy.forEach(rec => recommendedBySet.add(rec));
        }
        // Process tags to extract frameworks
        if (standard.tag && Array.isArray(standard.tag)) {
          standard.tag.forEach(tag => {
            const framework = extractTagFramework(tag);
            if (framework) { // Only add non-null frameworks
              tagFrameworkSet.add(framework);
            }
          });
        }
      });
    });

    // Custom sort order for impacts: Low -> Medium -> High
    const impactOrder = ["Low Impact", "Medium Impact", "High Impact"];
    const sortedImpacts = Array.from(impactSet).sort((a, b) => {
      const aIndex = impactOrder.indexOf(a);
      const bIndex = impactOrder.indexOf(b);
      return aIndex - bIndex;
    });

    // Sort tag frameworks with compliance frameworks first, then service categories
    const sortedTagFrameworks = Array.from(tagFrameworkSet).sort((a, b) => {
      // Define priority groups
      const getFrameworkPriority = (framework) => {
        if (framework.startsWith('CIS M365')) return 1;
        if (framework === 'CISA') return 2;
        if (framework === 'EIDSCA') return 3;
        if (framework === 'Essential 8') return 4;
        if (framework.startsWith('NIST CSF')) return 5;
        if (framework.startsWith('Secure Score -')) return 6;
        return 999; // Other tags go last
      };
      
      const aPriority = getFrameworkPriority(a);
      const bPriority = getFrameworkPriority(b);
      
      // If different priorities, sort by priority
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // If same priority, sort alphabetically
      return a.localeCompare(b);
    });

    return {
      allCategories: Array.from(categorySet).sort(),
      allImpacts: sortedImpacts,
      allRecommendedBy: Array.from(recommendedBySet).sort(),
      allTagFrameworks: sortedTagFrameworks,
    };
  }, [categories]);

  // Enhanced filter function
  const enhancedFilterStandards = useCallback((standardsList) => {
          // Function to extract base framework from tag (same as in useMemo)
      const extractTagFramework = (tag) => {
        // Compliance Frameworks - extract version dynamically
        if (tag.startsWith('CIS M365')) {
          const versionMatch = tag.match(/CIS M365 (\d+\.\d+)/);
          return versionMatch ? `CIS M365 ${versionMatch[1]}` : 'CIS M365';
        }
        if (tag.startsWith('CISA ')) return 'CISA';
        if (tag.startsWith('EIDSCA.')) return 'EIDSCA';
        if (tag.startsWith('Essential 8')) return 'Essential 8';
        if (tag.startsWith('NIST CSF')) {
          const versionMatch = tag.match(/NIST CSF (\d+\.\d+)/);
          return versionMatch ? `NIST CSF ${versionMatch[1]}` : 'NIST CSF';
        }
        
        // Microsoft Secure Score Categories
        if (tag.startsWith('exo_')) return 'Secure Score - Exchange';
        if (tag.startsWith('mdo_')) return 'Secure Score - Defender';
        if (tag.startsWith('spo_')) return 'Secure Score - SharePoint';
        if (tag.startsWith('mip_')) return 'Secure Score - Purview';
        
        // For any other tags, return null to exclude them
        return null;
      };

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

      // Tag framework filter
      const matchesTagFramework = selectedTagFrameworks.length === 0 || 
        (standard.tag && Array.isArray(standard.tag) &&
         standard.tag.some(tag => {
           const framework = extractTagFramework(tag);
           return framework && selectedTagFrameworks.includes(framework);
         }));

      // New standards filter (last 30 days)
      const isNewStandard = (dateAdded) => {
        if (!dateAdded) return false;
        const currentDate = new Date();
        const addedDate = new Date(dateAdded);
        return differenceInDays(currentDate, addedDate) <= 30;
      };
      const matchesNewFilter = !showOnlyNew || isNewStandard(standard.addedDate);

      return matchesSearch && matchesCategory && matchesImpact && matchesRecommendedBy && matchesTagFramework && matchesNewFilter;
    });
  }, [localSearchQuery, selectedCategories, selectedImpacts, selectedRecommendedBy, selectedTagFrameworks, showOnlyNew]);

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
    setSelectedTagFrameworks([]);
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
    setSelectedTagFrameworks([]);
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
  const activeFiltersCount = selectedCategories.length + selectedImpacts.length + selectedRecommendedBy.length + selectedTagFrameworks.length + (showOnlyNew ? 1 : 0);

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
            {/* Clickable header bar */}
            <Box 
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                mb: 2,
                p: 1,
                borderRadius: 1,
                cursor: 'pointer',
                bgcolor: 'action.hover',
                '&:hover': {
                  bgcolor: 'action.selected'
                }
              }}
            >
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Sort & Filter Options
              </Typography>
              {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
            </Box>

            {/* Compact summary when collapsed */}
            {!filtersExpanded && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                py: 0.5,
                px: 1,
                bgcolor: 'action.hover',
                borderRadius: 0.5,
                mb: 1
              }}>
                <Typography variant="caption" color="text.secondary">
                  Sorted by <strong>{sortBy === 'addedDate' ? 'Date Added' : 'Name'}</strong> ({sortOrder === 'desc' ? 'Desc' : 'Asc'})
                </Typography>
                {activeFiltersCount > 0 && (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      • <strong>{activeFiltersCount}</strong> filter{activeFiltersCount !== 1 ? 's' : ''}
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={clearAllFilters}
                      sx={{ 
                        ml: 'auto', 
                        minWidth: 'auto', 
                        px: 1, 
                        py: 0.25,
                        fontSize: '0.75rem',
                        height: 'auto'
                      }}
                    >
                      Clear
                    </Button>
                  </>
                )}
              </Box>
            )}
            
            {/* Collapsible filter controls */}
            <Collapse in={filtersExpanded}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {/* Sort Controls Card */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  alignItems: 'center',
                  p: 2,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', minWidth: 'fit-content' }}>
                    SORT:
                  </Typography>
                  <FormControl sx={{ minWidth: 140 }}>
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
                  
                  <FormControl sx={{ minWidth: 120 }}>
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
                </Box>

                {/* Filter Controls Card */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  alignItems: 'center',
                  p: 2,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  flex: 1
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', minWidth: 'fit-content' }}>
                    FILTER:
                  </Typography>
                  <FormControl sx={{ minWidth: 160 }}>
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

                  <FormControl sx={{ minWidth: 120 }}>
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

                  <FormControl sx={{ minWidth: 160 }}>
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

                  <FormControl sx={{ minWidth: 160 }}>
                    <InputLabel>Compliance Tags</InputLabel>
                    <Select
                      multiple
                      value={selectedTagFrameworks}
                      label="Compliance Tags"
                      onChange={(e) => setSelectedTagFrameworks(e.target.value)}
                      sx={{ height: 45 }}
                      renderValue={(selected) => 
                        selected.length === 0 ? "All Tags" : `${selected.length} selected`
                      }
                    >
                      {allTagFrameworks.map((framework) => (
                        <MenuItem key={framework} value={framework}>
                          {framework}
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
              </Box>
            </Collapse>
          </Box>

          {/* Active Filter Chips */}
          {activeFiltersCount > 0 && (
            <Box sx={{ mb: 2 }}>
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
                {selectedTagFrameworks.map((framework) => (
                  <Chip
                    key={framework}
                    label={framework}
                    size="small"
                    onDelete={() => setSelectedTagFrameworks(prev => prev.filter(f => f !== framework))}
                    color="warning"
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
