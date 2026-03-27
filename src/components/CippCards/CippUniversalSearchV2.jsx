import React, { useState, useRef, useEffect } from "react";
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

export const CippUniversalSearchV2 = React.forwardRef(
  ({ onConfirm = () => {}, onChange = () => {}, maxResults = 10, value = "" }, ref) => {
    const [searchValue, setSearchValue] = useState(value);
    const [searchType, setSearchType] = useState("Users");
    const [bitlockerLookupType, setBitlockerLookupType] = useState("keyId");
    const [showDropdown, setShowDropdown] = useState(false);
    const [bitlockerDrawerVisible, setBitlockerDrawerVisible] = useState(false);
    const [bitlockerDrawerDefaults, setBitlockerDrawerDefaults] = useState({
      searchTerm: "",
      searchType: "keyId",
    });
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef(null);
    const textFieldRef = useRef(null);
    const router = useRouter();

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

    const activeSearch = searchType === "BitLocker" ? bitlockerSearch : universalSearch;

    const handleChange = (event) => {
      const newValue = event.target.value;
      setSearchValue(newValue);
      onChange(newValue);

      if (newValue.length === 0) {
        setShowDropdown(false);
      }
    };

    const updateDropdownPosition = () => {
      if (textFieldRef.current) {
        const rect = textFieldRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Enter" && searchValue.length > 0) {
        handleSearch();
      }
    };

    const handleSearch = () => {
      if (searchValue.length > 0) {
        updateDropdownPosition();
        activeSearch.refetch();
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
      }
      setShowDropdown(false);
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
      setShowDropdown(false);
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

    const bitlockerResults = Array.isArray(bitlockerSearch?.data?.Results)
      ? bitlockerSearch.data.Results
      : [];
    const universalResults = Array.isArray(universalSearch?.data) ? universalSearch.data : [];
    const hasResults =
      searchType === "BitLocker" ? bitlockerResults.length > 0 : universalResults.length > 0;
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
      }
      return "Search";
    };

    return (
      <>
        <Box ref={containerRef} sx={{ width: "100%", display: "flex", gap: 1 }}>
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
            label={getLabel()}
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
              endAdornment: activeSearch.isFetching ? (
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
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={searchValue.length === 0 || activeSearch.isFetching}
            startIcon={<SearchIcon />}
            sx={{ flexShrink: 0 }}
          >
            Search
          </Button>
        </Box>

        {shouldShowDropdown && (
          <Portal>
            <Paper
              data-dropdown-portal
              elevation={8}
              sx={{
                position: "absolute",
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                maxHeight: 400,
                overflow: "auto",
                zIndex: 9999,
                boxShadow: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              {activeSearch.isFetching ? (
                <Box sx={{ p: 2 }}>
                  <Skeleton height={60} sx={{ mb: 1 }} />
                  <Skeleton height={60} />
                </Box>
              ) : hasResults ? (
                searchType === "BitLocker" ? (
                  <BitlockerResults
                    items={bitlockerResults}
                    onResultClick={handleBitlockerResultClick}
                  />
                ) : (
                  <Results
                    items={universalResults}
                    searchValue={searchValue}
                    onResultClick={handleResultClick}
                    searchType={searchType}
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

const Results = ({ items = [], searchValue, onResultClick, searchType = "Users" }) => {
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
            onClick={() => onResultClick(match)}
            sx={{
              py: 1.5,
              px: 2,
              borderBottom: index < items.length - 1 ? "1px solid" : "none",
              borderColor: "divider",
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

const BitlockerResults = ({ items = [], onResultClick }) => {
  return (
    <>
      {items.map((result, index) => (
        <MenuItem
          key={result.keyId || index}
          onClick={() => onResultClick(result)}
          sx={{
            py: 1.5,
            px: 2,
            borderBottom: index < items.length - 1 ? "1px solid" : "none",
            borderColor: "divider",
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
