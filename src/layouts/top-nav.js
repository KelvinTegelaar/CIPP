import { useCallback, useEffect, useState } from "react";
import NextLink from "next/link";
import PropTypes from "prop-types";
import Bars3Icon from "@heroicons/react/24/outline/Bars3Icon";
import MoonIcon from "@heroicons/react/24/outline/MoonIcon";
import SunIcon from "@heroicons/react/24/outline/SunIcon";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CloseIcon from "@mui/icons-material/Close";
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

const TOP_NAV_HEIGHT = 64;

export const TopNav = (props) => {
  const searchDialog = useDialog();
  const { onNavOpen } = props;
  const settings = useSettings();
  const mdDown = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const bookmarkMode = settings.bookmarkMode?.value || "both";
  const handleThemeSwitch = useCallback(() => {
    const themeName = settings.currentTheme?.value === "light" ? "dark" : "light";
    settings.handleUpdate({
      currentTheme: { value: themeName, label: themeName },
      paletteMode: themeName,
    });
  }, [settings]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleBookmarkClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleBookmarkClose = () => {
    setAnchorEl(null);
  };

  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const items = [...(settings.bookmarks || [])];
    const [reordered] = items.splice(dragIndex, 1);
    items.splice(dropIndex, 0, reordered);
    settings.handleUpdate({ bookmarks: items });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const removeBookmark = (index) => {
    const updatedBookmarks = [...(settings.bookmarks || [])];
    updatedBookmarks.splice(index, 1);
    settings.handleUpdate({ bookmarks: updatedBookmarks });
  };

  const displayBookmarks = settings.bookmarks || [];
  const popoverOpen = Boolean(anchorEl);
  const popoverId = popoverOpen ? "bookmark-popover" : undefined;

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

  const openSearch = () => {
    searchDialog.handleOpen();
  };

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
          {(bookmarkMode === "popover" || bookmarkMode === "both") && (
            <>
              <IconButton color="inherit" onClick={handleBookmarkClick}>
                <SvgIcon color="action" fontSize="small">
                  <BookmarkIcon />
                </SvgIcon>
              </IconButton>
              <Popover
                id={popoverId}
                open={popoverOpen}
                anchorEl={anchorEl}
                onClose={handleBookmarkClose}
                disableScrollLock
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
                  {displayBookmarks.length === 0 ? (
                    <ListItem>
                      <ListItemText
                        primary={<Typography variant="body2">No bookmarks added yet</Typography>}
                      />
                    </ListItem>
                  ) : (
                    displayBookmarks.map((bookmark, idx) => (
                      <ListItem
                        key={bookmark.path}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={(e) => handleDrop(e, idx)}
                        onDragEnd={handleDragEnd}
                        sx={{
                          color: "inherit",
                          display: "flex",
                          justifyContent: "space-between",
                          cursor: "grab",
                          ...(dragIndex === idx && {
                            opacity: 0.4,
                          }),
                          ...(dragOverIndex === idx && dragIndex !== idx && {
                            borderTop: "2px solid",
                            borderColor: "primary.main",
                          }),
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            color: "neutral.500",
                            mr: 1,
                          }}
                        >
                          <DragIndicatorIcon fontSize="small" />
                        </Box>
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
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            removeBookmark(idx);
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </ListItem>
                    ))
                  )}
                </List>
              </Popover>
            </>
          )}
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
