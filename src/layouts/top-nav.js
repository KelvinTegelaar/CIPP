import { useCallback, useEffect, useState } from "react";
import NextLink from "next/link";
import PropTypes from "prop-types";
import Bars3Icon from "@heroicons/react/24/outline/Bars3Icon";
import MoonIcon from "@heroicons/react/24/outline/MoonIcon";
import SunIcon from "@heroicons/react/24/outline/SunIcon";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  Box,
  Divider,
  IconButton,
  Stack,
  SvgIcon,
  useMediaQuery,
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { Logo } from "../components/logo";
import { useSettings } from "../hooks/use-settings";
import { paths } from "../paths";
import { AccountPopover } from "./account-popover";
import { CippTenantSelector } from "../components/CippComponents/CippTenantSelector";
import { NotificationsPopover } from "./notifications-popover";
import { useDialog } from "../hooks/use-dialog";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { CippCentralSearch } from "../components/CippComponents/CippCentralSearch";
import { applySort } from "../utils/apply-sort";

const TOP_NAV_HEIGHT = 64;

export const TopNav = (props) => {
  const searchDialog = useDialog();
  const { onNavOpen } = props;
  const settings = useSettings();
  const mdDown = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const handleThemeSwitch = useCallback(() => {
    const themeName = settings.currentTheme?.value === "light" ? "dark" : "light";
    settings.handleUpdate({
      currentTheme: { value: themeName, label: themeName },
      paletteMode: themeName,
    });
  }, [settings]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const handleBookmarkClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleBookmarkClose = () => {
    setAnchorEl(null);
  };

  const handleSortToggle = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);

    // Save the new sort order and re-order bookmarks
    const sortedBookmarks = applySort(settings.bookmarks || [], "label", newSortOrder);
    settings.handleUpdate({
      bookmarks: sortedBookmarks,
      sortOrder: newSortOrder,
    });
  };

  // Move a bookmark up in the list
  const moveBookmarkUp = (index) => {
    if (index <= 0) return;

    const updatedBookmarks = [...(settings.bookmarks || [])];
    const temp = updatedBookmarks[index];
    updatedBookmarks[index] = updatedBookmarks[index - 1];
    updatedBookmarks[index - 1] = temp;

    settings.handleUpdate({ bookmarks: updatedBookmarks });
  };

  // Move a bookmark down in the list
  const moveBookmarkDown = (index) => {
    const bookmarks = settings.bookmarks || [];
    if (index >= bookmarks.length - 1) return;

    const updatedBookmarks = [...bookmarks];
    const temp = updatedBookmarks[index];
    updatedBookmarks[index] = updatedBookmarks[index + 1];
    updatedBookmarks[index + 1] = temp;

    settings.handleUpdate({ bookmarks: updatedBookmarks });
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (settings.sortOrder) {
      setSortOrder(settings.sortOrder);
    }
  }, [settings.sortOrder]);

  const openSearch = () => {
    searchDialog.handleOpen();
  };

  // Use the sorted bookmarks if sorting is applied, otherwise use the bookmarks in their current order
  const displayBookmarks = settings.bookmarks || [];

  const open = Boolean(anchorEl);
  const id = open ? "bookmark-popover" : undefined;

  return (
    <Box
      component="header"
      sx={{
        backgroundColor: "neutral.900",
        color: "common.white",
        position: "fixed",
        width: "100%",
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{
          minHeight: TOP_NAV_HEIGHT,
          px: 3,
        }}
      >
        <Stack
          alignItems="center"
          direction="row"
          spacing={3}
          divider={
            <Divider
              orientation="vertical"
              sx={{
                borderColor: "neutral.500",
                height: 36,
              }}
            />
          }
        >
          <Box
            component={NextLink}
            href={paths.index}
            sx={{
              display: "inline-flex",
              height: 24,
              width: 24,
            }}
          >
            <Logo />
          </Box>
          {!mdDown && <CippTenantSelector refreshButton={true} tenantButton={true} />}
          {mdDown && (
            <IconButton color="inherit" onClick={onNavOpen}>
              <SvgIcon color="action" fontSize="small">
                <Bars3Icon />
              </SvgIcon>
            </IconButton>
          )}
        </Stack>
        <Stack alignItems="center" direction="row" spacing={1.5}>
          {!mdDown && (
            <IconButton color="inherit" onClick={handleThemeSwitch}>
              <SvgIcon color="action" fontSize="small">
                {settings?.currentTheme?.value === "dark" ? <SunIcon /> : <MoonIcon />}
              </SvgIcon>
            </IconButton>
          )}
          <IconButton color="inherit" onClick={() => openSearch()}>
            <SvgIcon color="action" fontSize="small">
              <MagnifyingGlassIcon />
            </SvgIcon>
          </IconButton>
          <IconButton color="inherit" onClick={handleBookmarkClick}>
            <SvgIcon color="action" fontSize="small">
              <BookmarkIcon />
            </SvgIcon>
          </IconButton>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleBookmarkClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <List sx={{ minWidth: "220px" }}>
              <ListItem>
                <IconButton onClick={handleSortToggle}>
                  <SvgIcon fontSize="small">
                    {sortOrder === "asc" ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                  </SvgIcon>
                </IconButton>
                <Typography variant="body2">Sort Alphabetically</Typography>
              </ListItem>
              {displayBookmarks.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary={<Typography variant="body2">No bookmarks added yet</Typography>}
                  />
                </ListItem>
              ) : (
                displayBookmarks.map((bookmark, idx) => (
                  <ListItem
                    key={idx}
                    sx={{
                      color: "inherit",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box
                      component={NextLink}
                      href={bookmark.path}
                      onClick={() => handleBookmarkClose()}
                      sx={{
                        textDecoration: "none",
                        color: "inherit",
                        flexGrow: 1,
                        marginRight: 2,
                      }}
                    >
                      <Typography variant="body2">{bookmark.label}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          moveBookmarkUp(idx);
                        }}
                        disabled={idx === 0}
                      >
                        <KeyboardArrowUpIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          moveBookmarkDown(idx);
                        }}
                        disabled={idx === displayBookmarks.length - 1}
                      >
                        <KeyboardArrowDownIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </ListItem>
                ))
              )}
            </List>
          </Popover>
          <CippCentralSearch open={searchDialog.open} handleClose={searchDialog.handleClose} />
          <NotificationsPopover />
          <AccountPopover
            onThemeSwitch={handleThemeSwitch}
            paletteMode={settings.currentTheme?.value === "light" ? "dark" : "light"}
          />
        </Stack>
      </Stack>
    </Box>
  );
};

TopNav.propTypes = {
  onNavOpen: PropTypes.func,
  openNav: PropTypes.bool,
};
