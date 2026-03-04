import { useCallback, useState, useEffect, useRef } from "react";
import NextLink from "next/link";
import {
  Box,
  ButtonBase,
  Collapse,
  IconButton,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CloseIcon from "@mui/icons-material/Close";
import ChevronRightIcon from "@heroicons/react/24/outline/ChevronRightIcon";
import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import { useSettings } from "../hooks/use-settings";

export const SideNavBookmarks = ({ collapse = false }) => {
  const settings = useSettings();
  const [open, setOpen] = useState(settings.bookmarksOpen ?? false);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      settings.handleUpdate({ bookmarksOpen: next });
      return next;
    });
  }, [settings]);

  const removeBookmark = useCallback(
    (index) => {
      const updatedBookmarks = [...(settings.bookmarks || [])];
      updatedBookmarks.splice(index, 1);
      settings.handleUpdate({ bookmarks: updatedBookmarks });
    },
    [settings]
  );

  const handleDragStart = useCallback((index) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback(
    (e, dropIndex) => {
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
    },
    [dragIndex, settings]
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  const displayBookmarks = settings.bookmarks || [];

  return (
    <li>
      <Stack direction="row" alignItems="center">
        <ButtonBase
          onClick={handleToggle}
          sx={{
            alignItems: "center",
            borderRadius: 1,
            display: "flex",
            fontFamily: (theme) => theme.typography.fontFamily,
            fontSize: 14,
            fontWeight: 500,
            justifyContent: "flex-start",
            px: "6px",
            py: "12px",
            textAlign: "left",
            whiteSpace: "nowrap",
            width: "100%",
          }}
        >
          <Box
            component="span"
            sx={{
              alignItems: "center",
              color: "neutral.400",
              display: "inline-flex",
              flexGrow: 0,
              flexShrink: 0,
              height: 24,
              justifyContent: "center",
              width: 24,
            }}
          >
            <SvgIcon fontSize="small">
              <BookmarkIcon />
            </SvgIcon>
          </Box>
          <Box
            component="span"
            sx={{
              color: "text.primary",
              flexGrow: 1,
              fontSize: 14,
              mx: "12px",
              transition: "opacity 250ms ease-in-out",
              ...(collapse && {
                opacity: 0,
              }),
            }}
          >
            Bookmarks
          </Box>
          <SvgIcon
            sx={{
              color: "neutral.500",
              fontSize: 16,
              transition: "opacity 250ms ease-in-out",
              ...(collapse && {
                opacity: 0,
              }),
            }}
          >
            {open ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </SvgIcon>
        </ButtonBase>
      </Stack>
      <Collapse in={!collapse && open} unmountOnExit>
        <Stack component="ul" spacing={0.5} sx={{ listStyle: "none", m: 0, p: 0 }}>
          {displayBookmarks.length === 0 ? (
            <li>
              <Typography
                variant="body2"
                sx={{
                  px: "24px",
                  py: "8px",
                  color: "text.secondary",
                  fontSize: 13,
                }}
              >
                No bookmarks added yet
              </Typography>
            </li>
          ) : (
            displayBookmarks.map((bookmark, idx) => (
              <li
                key={bookmark.path}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{
                    position: "relative",
                    px: "24px",
                    py: "2px",
                    "&:hover .bookmark-controls": {
                      opacity: 1,
                    },
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
                      cursor: "grab",
                      mr: 0.5,
                    }}
                  >
                    <DragIndicatorIcon sx={{ fontSize: 16 }} />
                  </Box>
                  <ButtonBase
                    component={NextLink}
                    href={bookmark.path}
                    sx={{
                      alignItems: "center",
                      borderRadius: 1,
                      display: "flex",
                      fontFamily: (theme) => theme.typography.fontFamily,
                      fontSize: 13,
                      fontWeight: 500,
                      justifyContent: "flex-start",
                      py: "6px",
                      textAlign: "left",
                      whiteSpace: "nowrap",
                      flexGrow: 1,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        color: "text.secondary",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {bookmark.label}
                    </Box>
                  </ButtonBase>
                  <Stack
                    className="bookmark-controls"
                    direction="row"
                    spacing={0}
                    sx={{
                      position: "absolute",
                      right: 8,
                      opacity: 0,
                      transition: "opacity 150ms ease-in-out",
                      backgroundColor: "background.default",
                      borderRadius: 1,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.preventDefault();
                        removeBookmark(idx);
                      }}
                      sx={{ p: "2px" }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Stack>
                </Stack>
              </li>
            ))
          )}
        </Stack>
      </Collapse>
    </li>
  );
};
