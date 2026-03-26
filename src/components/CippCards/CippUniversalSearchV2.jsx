import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  TextField,
  Box,
  Typography,
  Skeleton,
  MenuItem,
  ListItemText,
  Paper,
  CircularProgress,
  InputAdornment,
  Portal,
  Button,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { ApiGetCall } from "../../api/ApiCall";
import { useRouter } from "next/router";
import { BulkActionsMenu } from "../bulk-actions-menu";
import { CippOffCanvas } from "../CippComponents/CippOffCanvas";
import { CippBitlockerKeySearch } from "../CippComponents/CippBitlockerKeySearch";
import { nativeMenuItems } from "../../layouts/config";
import { usePermissions } from "../../hooks/use-permissions";

function getLeafItems(items = []) {
  let result = [];

  for (const item of items) {
    if (item.items && Array.isArray(item.items) && item.items.length > 0) {
      result = result.concat(getLeafItems(item.items));
    } else {
      result.push(item);
    }
  }

  return result;
}

async function loadTabOptions() {
  const tabOptionPaths = [
    "/email/administration/exchange-retention",
    "/cipp/custom-data",
    "/cipp/super-admin",
    "/tenant/standards",
    "/tenant/manage",
    "/tenant/administration/applications",
    "/tenant/administration/tenants",
    "/tenant/administration/audit-logs",
    "/identity/administration/users/user",
    "/tenant/administration/securescore",
    "/tenant/gdap-management",
    "/tenant/gdap-management/relationships/relationship",
    "/cipp/settings",
  ];

  const tabOptions = [];

  for (const basePath of tabOptionPaths) {
    try {
      const module = await import(`../../pages${basePath}/tabOptions.json`);
      const options = module.default || module;

      options.forEach((option) => {
        tabOptions.push({
          title: option.label,
          path: option.path,
          type: "tab",
          basePath,
        });
      });
    } catch (error) {
      console.debug(`Could not load tabOptions for ${basePath}:`, error);
    }
  }

  return tabOptions;
}

function filterItemsByPermissionsAndRoles(items, userPermissions, userRoles) {
  return items.filter((item) => {
    if (item.permissions && item.permissions.length > 0) {
      const hasPermission = userPermissions?.some((userPerm) => {
        return item.permissions.some((requiredPerm) => {
          if (userPerm === requiredPerm) {
            return true;
          }

          if (requiredPerm.includes("*")) {
            const regexPattern = requiredPerm
              .replace(/\\/g, "\\\\")
              .replace(/\./g, "\\.")
              .replace(/\*/g, ".*");
            const regex = new RegExp(`^${regexPattern}$`);
            return regex.test(userPerm);
          }

          return false;
        });
      });
      if (!hasPermission) {
        return false;
      }
    }

    return true;
  });
}

export const CippUniversalSearchV2 = React.forwardRef(
  (
    {
      onConfirm = () => {},
      onChange = () => {},
      maxResults = 10,
      value = "",
      autoFocus = false,
      defaultSearchType = "Users",
    },
    ref,
  ) => {
    const [searchValue, setSearchValue] = useState(value);
    const [searchType, setSearchType] = useState(defaultSearchType);
    const [bitlockerLookupType, setBitlockerLookupType] = useState("keyId");
    const [tabOptions, setTabOptions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [bitlockerDrawerVisible, setBitlockerDrawerVisible] = useState(false);
    const [bitlockerDrawerDefaults, setBitlockerDrawerDefaults] = useState({
      searchTerm: "",
      searchType: "keyId",
    });
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const [dropdownMaxHeight, setDropdownMaxHeight] = useState(400);
    const containerRef = useRef(null);
    const textFieldRef = useRef(null);
    const dropdownRef = useRef(null);
    const router = useRouter();
    const { userPermissions, userRoles } = usePermissions();

    const universalSearch = ApiGetCall({
      url: `/api/ExecUniversalSearchV2`,
      data: {
        searchTerms: searchValue,
        limit: maxResults,
        type: searchType,
      },
      queryKey: `searchV2-${searchType}-${searchValue}`,
      waiting: false,
    });

    const bitlockerSearch = ApiGetCall({
      url: "/api/ExecBitlockerSearch",
      data: {
        [bitlockerLookupType]: searchValue,
      },
      queryKey: `bitlocker-universal-${bitlockerLookupType}-${searchValue}`,
      waiting: false,
    });

    const activeSearch =
      searchType === "BitLocker" ? bitlockerSearch : searchType === "Pages" ? null : universalSearch;

    const flattenedMenuItems = useMemo(() => {
      const allLeafItems = getLeafItems(nativeMenuItems);

      const buildBreadcrumbPath = (items, targetPath) => {
        const searchRecursive = (nestedItems, currentPath = []) => {
          for (const item of nestedItems) {
            const shouldAddToPath = item.title !== "Dashboard" || item.path !== "/";
            const newPath = shouldAddToPath ? [...currentPath, item.title] : currentPath;

            if (item.path) {
              const normalizedItemPath = item.path.replace(/\/$/, "");
              const normalizedTargetPath = targetPath.replace(/\/$/, "");

              if (normalizedItemPath !== "/" && normalizedItemPath.startsWith(normalizedTargetPath)) {
                return newPath;
              }
            }

            if (item.items && item.items.length > 0) {
              const childResult = searchRecursive(item.items, newPath);
              if (childResult.length > 0) {
                return childResult;
              }
            }
          }
          return [];
        };

        return searchRecursive(items);
      };

      const filteredMainMenu = filterItemsByPermissionsAndRoles(
        allLeafItems,
        userPermissions,
        userRoles,
      ).map((item) => {
        const rawBreadcrumbs = buildBreadcrumbPath(nativeMenuItems, item.path) || [];
        const trimmedBreadcrumbs =
          rawBreadcrumbs.length > 0 && rawBreadcrumbs[rawBreadcrumbs.length - 1] === item.title
            ? rawBreadcrumbs.slice(0, -1)
            : rawBreadcrumbs;
        return {
          ...item,
          breadcrumbs: trimmedBreadcrumbs,
        };
      });

      const leafItemIndex = allLeafItems.reduce((acc, item) => {
        if (item.path) {
          acc[item.path.replace(/\/$/, "")] = item;
        }
        return acc;
      }, {});

      const filteredTabOptions = tabOptions
        .map((tab) => {
          const normalizedTabPath = tab.path.replace(/\/$/, "");
          const normalizedBasePath = tab.basePath?.replace(/\/$/, "");

          let pageItem = leafItemIndex[normalizedTabPath];

          if (!pageItem && normalizedBasePath) {
            pageItem = allLeafItems.find((item) => {
              const normalizedItemPath = item.path?.replace(/\/$/, "");
              return normalizedItemPath && normalizedItemPath.startsWith(normalizedBasePath);
            });
          }

          if (!pageItem) return null;

          const hasAccessToPage =
            filterItemsByPermissionsAndRoles([pageItem], userPermissions, userRoles).length > 0;
          if (!hasAccessToPage) return null;

          const breadcrumbs = buildBreadcrumbPath(nativeMenuItems, pageItem.path) || [];
          const trimmedBreadcrumbs =
            breadcrumbs.length > 0 && breadcrumbs[breadcrumbs.length - 1] === tab.title
              ? breadcrumbs.slice(0, -1)
              : breadcrumbs;

          return {
            ...tab,
            breadcrumbs: trimmedBreadcrumbs,
          };
        })
        .filter(Boolean);

      return [...filteredMainMenu, ...filteredTabOptions];
    }, [userPermissions, userRoles, tabOptions]);

    const normalizedSearch = searchValue.trim().toLowerCase();
    const pageResults = flattenedMenuItems.filter((leaf) => {
      const inTitle = leaf.title?.toLowerCase().includes(normalizedSearch);
      const inPath = leaf.path?.toLowerCase().includes(normalizedSearch);
      const inBreadcrumbs = leaf.breadcrumbs?.some((crumb) =>
        crumb?.toLowerCase().includes(normalizedSearch),
      );
      const inScope = (leaf.scope === "global" ? "global" : "tenant").includes(normalizedSearch);

      return normalizedSearch ? inTitle || inPath || inBreadcrumbs || inScope : false;
    });

    const handleChange = (event) => {
      const newValue = event.target.value;
      setSearchValue(newValue);
      onChange(newValue);

      if (newValue.length === 0) {
        setShowDropdown(false);
      } else if (searchType === "Pages") {
        updateDropdownPosition();
        setShowDropdown(true);
      }
    };

    const updateDropdownPosition = () => {
      if (textFieldRef.current) {
        const rect = textFieldRef.current.getBoundingClientRect();
        const availableHeight = Math.max(220, window.innerHeight - rect.bottom - 16);
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
        setDropdownMaxHeight(availableHeight);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && showDropdown) {
        event.preventDefault();
        setShowDropdown(false);
        setHighlightedIndex(-1);
        return;
      }

      if ((event.key === "ArrowDown" || event.key === "ArrowUp") && showDropdown && hasResults) {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const total = activeResults.length;
        setHighlightedIndex((prev) => {
          if (prev < 0) {
            return direction === 1 ? 0 : total - 1;
          }
          return (prev + direction + total) % total;
        });
        return;
      }

      if (event.key === "Enter" && showDropdown && hasResults && highlightedIndex >= 0) {
        event.preventDefault();
        const selectedItem = activeResults[highlightedIndex];
        if (!selectedItem) {
          return;
        }
        if (searchType === "BitLocker") {
          handleBitlockerResultClick(selectedItem);
        } else {
          handleResultClick(selectedItem);
        }
        return;
      }

      if (event.key === "Enter" && searchValue.length > 0) {
        handleSearch();
      }
    };

    const handleSearch = () => {
      if (searchValue.length > 0) {
        updateDropdownPosition();
        if (searchType !== "Pages") {
          activeSearch?.refetch();
        }
        setShowDropdown(true);
      }
    };

    const handleResultClick = (match) => {
      const itemData = match.Data || {};
      const tenantDomain = match.Tenant || "";
      if (searchType === "Users") {
        router.push(
          `/identity/administration/users/user?tenantFilter=${tenantDomain}&userId=${itemData.id}`,
        );
      } else if (searchType === "Groups") {
        router.push(
          `/identity/administration/groups/group?groupId=${itemData.id}&tenantFilter=${tenantDomain}`,
        );
      } else if (searchType === "Pages") {
        router.push(match.path, undefined, { shallow: true });
      }
      setSearchValue("");
      setShowDropdown(false);
      onConfirm(match);
    };

    const handleTypeChange = (type) => {
      setSearchType(type);
      if (type === "BitLocker") {
        setBitlockerLookupType("keyId");
      }
      setShowDropdown(false);
    };

    const handleBitlockerResultClick = (match) => {
      setBitlockerDrawerDefaults({
        searchTerm:
          bitlockerLookupType === "deviceId"
            ? match?.deviceId || searchValue
            : match?.keyId || searchValue,
        searchType: bitlockerLookupType,
      });
      setBitlockerDrawerVisible(true);
      setSearchValue("");
      setShowDropdown(false);
      onConfirm(match);
    };

    const typeMenuActions = [
      {
        label: "Users",
        icon: "UsersIcon",
        onClick: () => handleTypeChange("Users"),
      },
      {
        label: "Groups",
        icon: "Group",
        onClick: () => handleTypeChange("Groups"),
      },
      {
        label: "BitLocker",
        icon: "FilePresent",
        onClick: () => handleTypeChange("BitLocker"),
      },
      {
        label: "Pages",
        icon: "GlobeAltIcon",
        onClick: () => handleTypeChange("Pages"),
      },
    ];

    const bitlockerLookupActions = [
      {
        label: "Key ID",
        icon: "FilePresent",
        onClick: () => setBitlockerLookupType("keyId"),
      },
      {
        label: "Device ID",
        icon: "Laptop",
        onClick: () => setBitlockerLookupType("deviceId"),
      },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target) &&
          !event.target.closest("[data-dropdown-portal]")
        ) {
          setShowDropdown(false);
        }
      };

      if (showDropdown) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }
    }, [showDropdown]);

    // Update position on scroll/resize
    useEffect(() => {
      if (showDropdown) {
        updateDropdownPosition();
        const handleScroll = () => updateDropdownPosition();
        const handleResize = () => updateDropdownPosition();
        window.addEventListener("scroll", handleScroll, true);
        window.addEventListener("resize", handleResize);
        return () => {
          window.removeEventListener("scroll", handleScroll, true);
          window.removeEventListener("resize", handleResize);
        };
      }
    }, [showDropdown]);

    useEffect(() => {
      setHighlightedIndex(-1);
    }, [searchType, searchValue, showDropdown]);

    useEffect(() => {
      if (!showDropdown || highlightedIndex < 0 || !dropdownRef.current) {
        return;
      }

      const activeRow = dropdownRef.current.querySelector(
        `[data-result-index="${highlightedIndex}"]`,
      );

      if (activeRow && typeof activeRow.scrollIntoView === "function") {
        activeRow.scrollIntoView({ block: "nearest" });
      }
    }, [highlightedIndex, showDropdown]);

    useEffect(() => {
      loadTabOptions().then(setTabOptions);
    }, []);

    useEffect(() => {
      setSearchType(defaultSearchType);
      if (defaultSearchType === "BitLocker") {
        setBitlockerLookupType("keyId");
      }
    }, [defaultSearchType]);

    const bitlockerResults = Array.isArray(bitlockerSearch?.data?.Results)
      ? bitlockerSearch.data.Results
      : [];
    const universalResults = Array.isArray(universalSearch?.data) ? universalSearch.data : [];
    const activeResults =
      searchType === "BitLocker"
        ? bitlockerResults
        : searchType === "Pages"
          ? pageResults
          : universalResults;
    const hasResults =
      searchType === "BitLocker"
        ? bitlockerResults.length > 0
        : searchType === "Pages"
          ? pageResults.length > 0
          : universalResults.length > 0;
    const shouldShowDropdown = showDropdown && searchValue.length > 0;

    const getLabel = () => {
      if (searchType === "Users") {
        return "Search users by UPN or Display Name";
      } else if (searchType === "Groups") {
        return "Search groups by Display Name";
      } else if (searchType === "BitLocker") {
        return bitlockerLookupType === "deviceId"
          ? "Search BitLocker by Device ID"
          : "Search BitLocker by Recovery Key ID";
      } else if (searchType === "Pages") {
        return "Search pages, tabs, paths, or scope";
      }
      return "Search";
    };

    return (
      <>
        <Box ref={containerRef} sx={{ width: "100%", display: "flex", gap: 1, alignItems: "flex-start" }}>
          <BulkActionsMenu
            buttonName={searchType}
            actions={typeMenuActions}
          />
          {searchType === "BitLocker" && (
            <BulkActionsMenu
              buttonName={bitlockerLookupType === "deviceId" ? "Device ID" : "Key ID"}
              actions={bitlockerLookupActions}
            />
          )}
          <TextField
            ref={(node) => {
              textFieldRef.current = node;
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            fullWidth
            type="text"
            placeholder={getLabel()}
            autoFocus={autoFocus}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            value={searchValue}
            InputProps={{
              startAdornment: (
                <InputAdornment
                  position="start"
                  sx={{ display: "flex", alignItems: "center", mb: 0, mt: "12px" }}
                >
                  <SearchIcon color="action" sx={{ fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: activeSearch?.isFetching ? (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ) : null,
              sx: {
                "& .MuiInputAdornment-root": {
                  marginTop: "0 !important",
                  alignSelf: "center",
                },
              },
            }}
          />
          {searchType !== "Pages" && (
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={searchValue.length === 0 || activeSearch?.isFetching}
              startIcon={<SearchIcon />}
              sx={{ flexShrink: 0 }}
            >
              Search
            </Button>
          )}
        </Box>

        {shouldShowDropdown && (
          <Portal>
            <Paper
              data-dropdown-portal
              ref={dropdownRef}
              elevation={8}
              sx={{
                position: "absolute",
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                maxHeight: `${dropdownMaxHeight}px`,
                overflow: "auto",
                zIndex: 9999,
                boxShadow: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              {activeSearch?.isFetching ? (
                <Box sx={{ p: 2 }}>
                  <Skeleton height={60} sx={{ mb: 1 }} />
                  <Skeleton height={60} />
                </Box>
              ) : hasResults ? (
                searchType === "BitLocker" ? (
                  <BitlockerResults
                    items={bitlockerResults}
                    onResultClick={handleBitlockerResultClick}
                    highlightedIndex={highlightedIndex}
                    setHighlightedIndex={setHighlightedIndex}
                  />
                ) : searchType === "Pages" ? (
                  <PageResults
                    items={pageResults}
                    searchValue={searchValue}
                    onResultClick={handleResultClick}
                    highlightedIndex={highlightedIndex}
                    setHighlightedIndex={setHighlightedIndex}
                  />
                ) : (
                  <Results
                    items={universalResults}
                    searchValue={searchValue}
                    onResultClick={handleResultClick}
                    searchType={searchType}
                    highlightedIndex={highlightedIndex}
                    setHighlightedIndex={setHighlightedIndex}
                  />
                )
              ) : (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    No results found.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Portal>
        )}

        <CippOffCanvas
          title="BitLocker Key Details"
          visible={bitlockerDrawerVisible}
          onClose={() => setBitlockerDrawerVisible(false)}
          size="xl"
          contentPadding={0}
        >
          <CippBitlockerKeySearch
            initialSearchTerm={bitlockerDrawerDefaults.searchTerm}
            initialSearchType={bitlockerDrawerDefaults.searchType}
            autoSearch={true}
          />
        </CippOffCanvas>
      </>
    );
  },
);

CippUniversalSearchV2.displayName = "CippUniversalSearchV2";

const Results = ({
  items = [],
  searchValue,
  onResultClick,
  searchType = "Users",
  highlightedIndex = -1,
  setHighlightedIndex = () => {},
}) => {
  const highlightMatch = (text) => {
    if (!text || !searchValue) return text;
    const escapedSearch = searchValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text?.split(new RegExp(`(${escapedSearch})`, "gi"));
    return parts?.map((part, index) =>
      part.toLowerCase() === searchValue.toLowerCase() ? (
        <Box component="span" fontWeight="bold" key={index}>
          {part}
        </Box>
      ) : (
        part
      ),
    );
  };

  return (
    <>
      {items.map((match, index) => {
        const itemData = match.Data || {};
        const tenantDomain = match.Tenant || "";

        return (
          <MenuItem
            key={match.RowKey || index}
            data-result-index={index}
            onClick={() => onResultClick(match)}
            onMouseEnter={() => setHighlightedIndex(index)}
            selected={highlightedIndex === index}
            sx={{
              py: 1.5,
              px: 2,
              borderBottom: index < items.length - 1 ? "1px solid" : "none",
              borderColor: "divider",
              backgroundColor: highlightedIndex === index ? "action.selected" : "transparent",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            <ListItemText
              primary={
                <Typography variant="body1" fontWeight="medium">
                  {highlightMatch(itemData.displayName || "")}
                </Typography>
              }
              secondary={
                <Box>
                  {searchType === "Users" && (
                    <Typography variant="body2" color="text.secondary">
                      {highlightMatch(itemData.userPrincipalName || "")}
                    </Typography>
                  )}
                  {searchType === "Groups" && (
                    <>
                      {itemData.mail && (
                        <Typography variant="body2" color="text.secondary">
                          {highlightMatch(itemData.mail || "")}
                        </Typography>
                      )}
                      {itemData.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {highlightMatch(itemData.description || "")}
                        </Typography>
                      )}
                    </>
                  )}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    Tenant: {tenantDomain}
                  </Typography>
                </Box>
              }
            />
          </MenuItem>
        );
      })}
    </>
  );
};

const PageResults = ({
  items = [],
  searchValue,
  onResultClick,
  highlightedIndex = -1,
  setHighlightedIndex = () => {},
}) => {
  const highlightMatch = (text = "") => {
    if (!text || !searchValue) return text;
    const escapedSearch = searchValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escapedSearch})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === searchValue.toLowerCase() ? (
        <Box component="span" fontWeight="bold" key={index}>
          {part}
        </Box>
      ) : (
        part
      ),
    );
  };

  return (
    <>
      {items.map((item, index) => {
        const isGlobal = item.scope === "global";
        const itemType = item.type === "tab" ? "Tab" : "Page";

        return (
          <MenuItem
            key={`${item.path}-${index}`}
            data-result-index={index}
            onClick={() => onResultClick(item)}
            onMouseEnter={() => setHighlightedIndex(index)}
            selected={highlightedIndex === index}
            sx={{
              py: 1.5,
              px: 2,
              borderBottom: index < items.length - 1 ? "1px solid" : "none",
              borderColor: "divider",
              alignItems: "flex-start",
              backgroundColor: highlightedIndex === index ? "action.selected" : "transparent",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography variant="body1" fontWeight="medium">
                    {highlightMatch(item.title || "")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {itemType}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {isGlobal ? "Global" : "Tenant"}
                  </Typography>
                </Box>
              }
              secondary={
                <Box>
                  {item.breadcrumbs && item.breadcrumbs.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      {item.breadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={idx}>
                          {highlightMatch(crumb)}
                          {idx < item.breadcrumbs.length - 1 && " > "}
                        </React.Fragment>
                      ))}
                      {" > "}
                      {highlightMatch(item.title || "")}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                    Path: {highlightMatch(item.path || "")}
                  </Typography>
                </Box>
              }
            />
          </MenuItem>
        );
      })}
    </>
  );
};

const BitlockerResults = ({
  items = [],
  onResultClick,
  highlightedIndex = -1,
  setHighlightedIndex = () => {},
}) => {
  return (
    <>
      {items.map((result, index) => (
        <MenuItem
          key={result.keyId || index}
          data-result-index={index}
          onClick={() => onResultClick(result)}
          onMouseEnter={() => setHighlightedIndex(index)}
          selected={highlightedIndex === index}
          sx={{
            py: 1.5,
            px: 2,
            borderBottom: index < items.length - 1 ? "1px solid" : "none",
            borderColor: "divider",
            backgroundColor: highlightedIndex === index ? "action.selected" : "transparent",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <ListItemText
            primary={
              <Typography variant="body1" fontWeight="medium">
                {result.deviceName || "Unknown Device"}
              </Typography>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Key ID: {result.keyId || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Device ID: {result.deviceId || "N/A"}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  Tenant: {result.tenant || "N/A"}
                </Typography>
              </Box>
            }
          />
        </MenuItem>
      ))}
    </>
  );
};
