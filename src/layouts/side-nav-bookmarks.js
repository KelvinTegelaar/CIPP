import { useCallback, useMemo, useState, useEffect, useRef } from "react";
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
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import ChevronRightIcon from "@heroicons/react/24/outline/ChevronRightIcon";
import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import { useSettings } from "../hooks/use-settings";

export const SideNavBookmarks = ({ collapse = false }) => {
  const settings = useSettings();
  const [open, setOpen] = useState(settings.bookmarksOpen ?? false);
  const reorderMode = settings.bookmarkReorderMode || "arrows";
  const locked = settings.bookmarkLocked ?? false;
  const [sortOrder, setSortOrder] = useState(settings.bookmarkSortOrder || "custom");
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [animatingPair, setAnimatingPair] = useState(null);
  const [flashSort, setFlashSort] = useState(false);
  const [flashLock, setFlashLock] = useState(false);
  const itemRefs = useRef({});
  const touchDragRef = useRef({ startIdx: null, overIdx: null });

  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      settings.handleUpdate({ bookmarksOpen: next });
      return next;
    });
  }, [settings]);

  const moveBookmarkUp = useCallback(
    (index) => {
      if (index <= 0) return;
      const updatedBookmarks = [...(settings.bookmarks || [])];
      const temp = updatedBookmarks[index];
      updatedBookmarks[index] = updatedBookmarks[index - 1];
      updatedBookmarks[index - 1] = temp;
      settings.handleUpdate({ bookmarks: updatedBookmarks });
    },
    [settings]
  );

  const moveBookmarkDown = useCallback(
    (index) => {
      const bookmarks = settings.bookmarks || [];
      if (index >= bookmarks.length - 1) return;
      const updatedBookmarks = [...bookmarks];
      const temp = updatedBookmarks[index];
      updatedBookmarks[index] = updatedBookmarks[index + 1];
      updatedBookmarks[index + 1] = temp;
      settings.handleUpdate({ bookmarks: updatedBookmarks });
    },
    [settings]
  );

  const removeBookmark = useCallback(
    (path) => {
      const updatedBookmarks = [...(settings.bookmarks || [])];
      const origIdx = updatedBookmarks.findIndex((b) => b.path === path);
      if (origIdx !== -1) {
        updatedBookmarks.splice(origIdx, 1);
        settings.handleUpdate({ bookmarks: updatedBookmarks });
      }
    },
    [settings]
  );

  const animatedMoveUp = useCallback(
    (index) => {
      if (index <= 0 || animatingPair) return;
      const el1 = itemRefs.current[index];
      const el2 = itemRefs.current[index - 1];
      if (!el1 || !el2) { moveBookmarkUp(index); return; }
      const distance = el1.getBoundingClientRect().top - el2.getBoundingClientRect().top;
      setAnimatingPair({ idx1: index, idx2: index - 1, offset1: -distance, offset2: distance });
      setTimeout(() => {
        moveBookmarkUp(index);
        setAnimatingPair(null);
      }, 250);
    },
    [animatingPair, moveBookmarkUp]
  );

  const animatedMoveDown = useCallback(
    (index) => {
      const bookmarks = settings.bookmarks || [];
      if (index >= bookmarks.length - 1 || animatingPair) return;
      const el1 = itemRefs.current[index];
      const el2 = itemRefs.current[index + 1];
      if (!el1 || !el2) { moveBookmarkDown(index); return; }
      const distance = el2.getBoundingClientRect().top - el1.getBoundingClientRect().top;
      setAnimatingPair({ idx1: index, idx2: index + 1, offset1: distance, offset2: -distance });
      setTimeout(() => {
        moveBookmarkDown(index);
        setAnimatingPair(null);
      }, 250);
    },
    [animatingPair, settings.bookmarks, moveBookmarkDown]
  );

  const triggerSortFlash = useCallback(() => {
    setFlashSort(true);
    setTimeout(() => setFlashSort(false), 600);
  }, []);

  const triggerLockFlash = useCallback(() => {
    setFlashLock(true);
    setTimeout(() => setFlashLock(false), 600);
  }, []);

  const handleToggleLock = useCallback(() => {
    settings.handleUpdate({ bookmarkLocked: !locked });
  }, [settings, locked]);

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

  const handleSortCycle = useCallback(() => {
    const next = sortOrder === "custom" ? "asc" : sortOrder === "asc" ? "desc" : "custom";
    setSortOrder(next);
    settings.handleUpdate({ bookmarkSortOrder: next });
  }, [sortOrder, settings]);

  const displayBookmarks = useMemo(() => {
    const bookmarks = settings.bookmarks || [];
    if (sortOrder === "custom") return bookmarks;
    return [...bookmarks].sort((a, b) => {
      const cmp = (a.label || "").localeCompare(b.label || "");
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [settings.bookmarks, sortOrder]);

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
        </ButtonBase>
        {!collapse && (
          <>
            <IconButton
              size="small"
              onClick={handleToggleLock}
              sx={{
                color: locked ? "warning.main" : "neutral.500",
                p: "2px",
                transition: "opacity 250ms ease-in-out",
                ...(flashLock && {
                  animation: "lockFlash 600ms ease-in-out",
                  "@keyframes lockFlash": {
                    "0%": { transform: "scale(1)" },
                    "25%": { transform: "scale(1.5)", color: "#ff9800" },
                    "50%": { transform: "scale(1)" },
                    "75%": { transform: "scale(1.3)", color: "#ff9800" },
                    "100%": { transform: "scale(1)" },
                  },
                }),
              }}
              title={locked ? "Unlock bookmarks" : "Lock bookmarks"}
            >
              {locked ? <LockIcon sx={{ fontSize: 16 }} /> : <LockOpenIcon sx={{ fontSize: 16 }} />}
            </IconButton>
            <IconButton
              size="small"
              onClick={handleSortCycle}
              sx={{
                color: sortOrder === "custom" ? "neutral.500" : "primary.main",
                p: "2px",
                transition: "opacity 250ms ease-in-out",
                ...(flashSort && {
                  animation: "sortFlash 600ms ease-in-out",
                  "@keyframes sortFlash": {
                    "0%": { transform: "scale(1)" },
                    "25%": { transform: "scale(1.5)", color: "#ff9800" },
                    "50%": { transform: "scale(1)" },
                    "75%": { transform: "scale(1.3)", color: "#ff9800" },
                    "100%": { transform: "scale(1)" },
                  },
                }),
              }}
              title={sortOrder === "custom" ? "Custom order" : sortOrder === "asc" ? "A > Z" : "Z > A"}
            >
              {sortOrder === "custom" && <SwapVertIcon sx={{ fontSize: 16 }} />}
              {sortOrder === "asc" && <ArrowUpwardIcon sx={{ fontSize: 16 }} />}
              {sortOrder === "desc" && <ArrowDownwardIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </>
        )}
        <Box
          component="span"
          onClick={handleToggle}
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            color: "neutral.500",
            pr: "6px",
            transition: "opacity 250ms ease-in-out",
            ...(collapse && {
              opacity: 0,
            }),
          }}
        >
          <SvgIcon sx={{ fontSize: 16 }}>
            {open ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </SvgIcon>
        </Box>
      </Stack>
      <Collapse in={!collapse && open} unmountOnExit>
        <Stack component="ul" spacing={0.5} sx={{ listStyle: "none", m: 0, p: 0 }}>
          {displayBookmarks.length === 0 ? (
            <li>
              <Typography
                variant="body2"
                sx={{
                  pl: "42px",
                  pr: "8px",
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
                ref={(el) => { itemRefs.current[idx] = el; }}
                data-bookmark-index={idx}
                draggable={reorderMode === "drag" && sortOrder === "custom" && !locked}
                {...(reorderMode === "drag" ? {
                  onDragStart: (e) => {
                    if (locked) { e.preventDefault(); triggerLockFlash(); return; }
                    if (sortOrder !== "custom") { e.preventDefault(); triggerSortFlash(); return; }
                    handleDragStart(idx);
                  },
                  onDragEnd: handleDragEnd,
                  ...(sortOrder === "custom" && !locked ? {
                    onDragOver: (e) => handleDragOver(e, idx),
                    onDrop: (e) => handleDrop(e, idx),
                  } : {}),
                } : {})}
                style={{
                  ...(animatingPair && (animatingPair.idx1 === idx || animatingPair.idx2 === idx) ? {
                    transform: `translateY(${animatingPair.idx1 === idx ? animatingPair.offset1 : animatingPair.offset2}px)`,
                    transition: 'transform 250ms ease-in-out',
                    position: 'relative',
                    zIndex: animatingPair.idx1 === idx ? 1 : 0,
                  } : {}),
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{
                    position: "relative",
                    pl: "42px",
                    pr: "8px",
                    py: "2px",
                    "&:hover .bookmark-controls": {
                      opacity: 1,
                    },
                    ...(sortOrder === "custom" && reorderMode === "drag" && dragIndex === idx && {
                      opacity: 0.4,
                    }),
                    ...(sortOrder === "custom" && reorderMode === "drag" && dragOverIndex === idx && dragIndex !== idx && {
                      borderTop: "2px solid",
                      borderColor: "primary.main",
                    }),
                  }}
                >
                  {reorderMode === "drag" && !locked && (
                    <Box
                      onTouchStart={() => {
                        if (sortOrder !== "custom") { triggerSortFlash(); return; }
                        touchDragRef.current.startIdx = idx;
                        setDragIndex(idx);
                      }}
                      onTouchMove={(e) => {
                        if (touchDragRef.current.startIdx === null) return;
                        const touch = e.touches[0];
                        const draggedLi = itemRefs.current[touchDragRef.current.startIdx];
                        if (draggedLi) draggedLi.style.pointerEvents = "none";
                        const el = document.elementFromPoint(touch.clientX, touch.clientY);
                        if (draggedLi) draggedLi.style.pointerEvents = "";
                        const li = el?.closest("[data-bookmark-index]");
                        if (li) {
                          const overIdx = parseInt(li.dataset.bookmarkIndex, 10);
                          if (!isNaN(overIdx) && overIdx >= 0 && overIdx < (settings.bookmarks || []).length) {
                            touchDragRef.current.overIdx = overIdx;
                            setDragOverIndex(overIdx);
                          }
                        }
                      }}
                      onTouchEnd={() => {
                        const { startIdx, overIdx } = touchDragRef.current;
                        if (startIdx !== null && overIdx !== null && startIdx !== overIdx) {
                          const items = [...(settings.bookmarks || [])];
                          const [reordered] = items.splice(startIdx, 1);
                          items.splice(overIdx, 0, reordered);
                          settings.handleUpdate({ bookmarks: items });
                        }
                        touchDragRef.current = { startIdx: null, overIdx: null };
                        setDragIndex(null);
                        setDragOverIndex(null);
                      }}
                      sx={{
                        touchAction: "none",
                        display: "flex",
                        alignItems: "center",
                        color: "neutral.500",
                        cursor: sortOrder === "custom" ? "grab" : "default",
                        mr: 0.5,
                      }}
                    >
                      <DragIndicatorIcon sx={{ fontSize: 16 }} />
                    </Box>
                  )}
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
                      "@media (hover: none)": {
                        opacity: 1,
                      },
                    }}
                  >
                    {reorderMode === "arrows" && (
                      <>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            if (locked) { triggerLockFlash(); return; }
                            sortOrder === "custom" ? animatedMoveUp(idx) : triggerSortFlash();
                          }}
                          disabled={sortOrder === "custom" && idx === 0}
                          sx={{ p: "2px", opacity: sortOrder !== "custom" || locked ? 0.4 : 1 }}
                        >
                          <KeyboardArrowUpIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            if (locked) { triggerLockFlash(); return; }
                            sortOrder === "custom" ? animatedMoveDown(idx) : triggerSortFlash();
                          }}
                          disabled={sortOrder === "custom" && idx === displayBookmarks.length - 1}
                          sx={{ p: "2px", opacity: sortOrder !== "custom" || locked ? 0.4 : 1 }}
                        >
                          <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </>
                    )}
                    {!(reorderMode === "drag" && locked) && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          if (locked) { triggerLockFlash(); return; }
                          removeBookmark(bookmark.path);
                        }}
                        sx={{ p: "2px", ...(locked && { opacity: 0.4 }) }}
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
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
