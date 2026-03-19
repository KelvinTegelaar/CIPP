import { useCallback, useState } from "react";
import NextLink from "next/link";
import PropTypes from "prop-types";
import ChevronRightIcon from "@heroicons/react/24/outline/ChevronRightIcon";
import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import ArrowTopRightOnSquareIcon from "@heroicons/react/24/outline/ArrowTopRightOnSquareIcon";
import { Box, ButtonBase, Collapse, SvgIcon, Stack } from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import LanguageIcon from "@mui/icons-material/Language";
import { useUserBookmarks } from "../hooks/use-user-bookmarks";
import { useSettings } from "../hooks/use-settings";

export const SideNavItem = (props) => {
  const {
    active = false,
    children,
    collapse = false,
    depth = 0,
    external = false,
    icon,
    openImmediately = false,
    path,
    scope,
    title,
  } = props;

  const isGlobal = scope === "global";

  const [open, setOpen] = useState(openImmediately);
  const [hovered, setHovered] = useState(false);
  const { bookmarks, setBookmarks } = useUserBookmarks();
  const settings = useSettings();
  const compactNav = settings.compactNav ?? false;
  const isBookmarked = bookmarks.some((bookmark) => bookmark.path === path);

  const handleToggle = useCallback(() => {
    setOpen((prevOpen) => !prevOpen);
  }, []);

  const handleBookmarkToggle = useCallback(
    (event) => {
      event.stopPropagation();
      setBookmarks(
        isBookmarked
          ? bookmarks.filter((bookmark) => bookmark.path !== path)
          : bookmarks.length >= 50
            ? bookmarks
            : [...bookmarks, { label: title, path }]
      );
    },
    [isBookmarked, bookmarks, setBookmarks, path, title]
  );

  // Dynamic spacing and font sizing based on depth
  const indent = depth > 0 ? depth * 1.5 : 1; // adjust multiplication factor as needed
  const fontSize = depth === 0 ? 14 : 13; // top-level 14, nested 13
  const navItemPy = compactNav ? "6px" : "12px";

  if (children) {
    return (
      <li>
        <Stack
          direction="row"
          alignItems="center"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <ButtonBase
            onClick={handleToggle}
            sx={{
              alignItems: "center",
              borderRadius: 1,
              display: "flex",
              fontFamily: (theme) => theme.typography.fontFamily,
              fontSize: fontSize,
              fontWeight: 500,
              justifyContent: "flex-start",
              px: `${indent * 6}px`,
              py: navItemPy,
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
              {icon}
            </Box>
            <Box
              component="span"
              sx={{
                color: depth === 0 ? "text.primary" : "text.secondary",
                flexGrow: 1,
                fontSize: fontSize,
                mx: "12px",
                transition: "opacity 250ms ease-in-out",
                ...(active && {
                  color: "primary.main",
                }),
                ...(collapse && {
                  opacity: 0,
                }),
              }}
            >
              {title}
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
          {children}
        </Collapse>
      </li>
    );
  }

  // Leaf
  const linkProps = path
    ? external
      ? {
          component: "a",
          href: path,
          target: "_blank",
        }
      : {
          component: NextLink,
          href: path,
        }
    : {};

  return (
    <li>
      <Stack
        direction="row"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          px: `${indent * 6}px`,
        }}
      >
        <ButtonBase
          sx={{
            alignItems: "center",
            borderRadius: 1,
            display: "flex",
            fontFamily: (theme) => theme.typography.fontFamily,
            fontSize: fontSize,
            fontWeight: 500,
            justifyContent: "flex-start",
            textAlign: "left",
            whiteSpace: "nowrap",
            width: "calc(100% - 20px)", // Adjust the width to leave space for the bookmark icon
            py: navItemPy,
          }}
          {...linkProps}
          onClick={(e) => e.currentTarget.blur()}
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
            {icon}
          </Box>
          <Box
            component="span"
            sx={{
              color: depth === 0 ? "text.primary" : "text.secondary",
              flexGrow: 1,
              mx: "12px",
              transition: "opacity 250ms ease-in-out",
              whiteSpace: "nowrap",
              ...(hovered && {
                maxWidth: "calc(100% - 45px)", // Adjust the width to leave space for the bookmark icon
                overflow: "hidden",
                textOverflow: "ellipsis",
              }),
              ...(active && {
                color: "primary.main",
              }),
              ...(collapse && {
                opacity: 0,
              }),
            }}
          >
            {title}
          </Box>
          {isGlobal && (
            <Box
              component="span"
              title="Global - not tied to selected tenant"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                flexShrink: 0,
                ml: 0.5,
                transition: "opacity 250ms ease-in-out",
                ...(collapse && { opacity: 0 }),
              }}
            >
              <SvgIcon sx={{ color: "neutral.400", fontSize: 14 }}>
                <LanguageIcon />
              </SvgIcon>
            </Box>
          )}
          {external && (
            <SvgIcon
              sx={{
                color: "neutral.500",
                fontSize: 18,
                transition: "opacity 250ms ease-in-out",
                ...(collapse && {
                  opacity: 0,
                }),
              }}
            >
              <ArrowTopRightOnSquareIcon />
            </SvgIcon>
          )}
        </ButtonBase>
        <SvgIcon
          onClick={handleBookmarkToggle}
          sx={{
            color: "neutral.500",
            fontSize: 16,
            transition: "opacity 250ms ease-in-out",
            cursor: "pointer",
            mr: 1,
            display: hovered ? "block" : "none",
          }}
        >
          {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        </SvgIcon>
      </Stack>
    </li>
  );
};

SideNavItem.propTypes = {
  active: PropTypes.bool,
  children: PropTypes.any,
  collapse: PropTypes.bool,
  depth: PropTypes.number,
  external: PropTypes.bool,
  icon: PropTypes.any,
  openImmediately: PropTypes.bool,
  path: PropTypes.string,
  scope: PropTypes.string,
  title: PropTypes.string.isRequired,
};
