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
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { ApiGetCall } from "../../api/ApiCall";
import { useSettings } from "../../hooks/use-settings";
import { useRouter } from "next/router";
import { BulkActionsMenu } from "../bulk-actions-menu";
import { Button } from "@mui/material";

export const CippUniversalSearchV2 = React.forwardRef(
  ({ onConfirm = () => {}, onChange = () => {}, maxResults = 10, value = "" }, ref) => {
    const [searchValue, setSearchValue] = useState(value);
    const [searchType, setSearchType] = useState("Users");
    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef(null);
    const textFieldRef = useRef(null);
    const router = useRouter();
    const settings = useSettings();
    const { currentTenant } = settings;

    const search = ApiGetCall({
      url: `/api/ExecUniversalSearchV2`,
      data: {
        searchTerms: searchValue,
        limit: maxResults,
        type: searchType,
      },
      queryKey: `searchV2-${searchType}-${searchValue}`,
      waiting: false,
    });

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
        search.refetch();
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

    const hasResults = Array.isArray(search?.data) && search.data.length > 0;
    const shouldShowDropdown = showDropdown && searchValue.length > 0;

    const getLabel = () => {
      if (searchType === "Users") {
        return "Search users by UPN or Display Name";
      } else if (searchType === "Groups") {
        return "Search groups by Display Name";
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
              endAdornment: search.isFetching ? (
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
            disabled={searchValue.length === 0 || search.isFetching}
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
              {search.isFetching ? (
                <Box sx={{ p: 2 }}>
                  <Skeleton height={60} sx={{ mb: 1 }} />
                  <Skeleton height={60} />
                </Box>
              ) : hasResults ? (
                <Results
                  items={search.data}
                  searchValue={searchValue}
                  onResultClick={handleResultClick}
                  searchType={searchType}
                />
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
