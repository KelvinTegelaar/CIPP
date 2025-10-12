import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import packageInfo from "../../public/version.json";
import { ApiGetCall } from "../api/ApiCall";

const RELEASE_COOKIE_KEY = "cipp_release_notice";
const RELEASE_OWNER = "KelvinTegelaar";
const RELEASE_REPO = "CIPP";

const secureFlag = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.protocol === "https:" ? " Secure" : "";
};

const getCookie = (name) => {
  if (typeof document === "undefined") {
    return null;
  }

  const cookiePrefix = `${name}=`;
  const cookies = document.cookie.split("; ");

  for (const cookie of cookies) {
    if (cookie.startsWith(cookiePrefix)) {
      return decodeURIComponent(cookie.slice(cookiePrefix.length));
    }
  }

  return null;
};

const setCookie = (name, value, days = 365) => {
  if (typeof document === "undefined") {
    return;
  }

  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/; SameSite=Lax;${secureFlag()}`;
};

const buildReleaseMetadata = (version) => {
  const [major = "0", minor = "0", patch = "0"] = String(version).split(".");
  const currentTag = `v${major}.${minor}.${patch}`;
  const baseTag = `v${major}.${minor}.0`;
  const tagToUse = patch === "0" ? currentTag : baseTag;

  return {
    currentTag,
    releaseTag: tagToUse,
    releaseUrl: `https://github.com/${RELEASE_OWNER}/${RELEASE_REPO}/releases/tag/${tagToUse}`,
  };
};

const formatReleaseBody = (body) => {
  if (!body) {
    return "";
  }

  return body.replace(/(^|[^\w/])@([a-zA-Z0-9-]+)/g, (match, prefix, username) => {
    return `${prefix}[@${username}](https://github.com/${username})`;
  });
};

export const ReleaseNotesDialog = forwardRef((_props, ref) => {
  const [isEligible, setIsEligible] = useState(false);
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [manualOpenRequested, setManualOpenRequested] = useState(false);
  const hasOpenedRef = useRef(false);

  const releaseMeta = useMemo(() => buildReleaseMetadata(packageInfo.version), []);

  useEffect(() => {
    hasOpenedRef.current = false;
  }, [releaseMeta.releaseTag]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedValue = getCookie(RELEASE_COOKIE_KEY);

    if (storedValue !== releaseMeta.releaseTag) {
      setIsEligible(true);
    }
  }, [releaseMeta.releaseTag]);

  const releaseQuery = ApiGetCall({
    url: "/api/ListGitHubReleaseNotes",
    queryKey: ["list-github-release-notes", releaseMeta.releaseTag],
    data: {
      Owner: RELEASE_OWNER,
      Repository: RELEASE_REPO,
      Version: releaseMeta.releaseTag,
    },
  });

  useImperativeHandle(ref, () => ({
    open: () => {
      setManualOpenRequested(true);
      setOpen(true);
    },
  }));

  const handleDismissUntilNextRelease = () => {
    const tagToStore = releaseQuery.data?.releaseTag ?? releaseMeta.releaseTag;
    setCookie(RELEASE_COOKIE_KEY, tagToStore);
    setOpen(false);
    setIsExpanded(false);
    setManualOpenRequested(false);
    setIsEligible(false);
  };

  const handleRemindLater = () => {
    setOpen(false);
    setIsExpanded(false);
    setManualOpenRequested(false);
  };

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  const releaseName = releaseQuery.data?.name || `CIPP ${releaseMeta.currentTag}`;
  const releaseBody = releaseQuery.data?.body || "";
  const releaseUrl = releaseQuery.data?.url ?? releaseMeta.releaseUrl;
  const formattedReleaseBody = useMemo(() => formatReleaseBody(releaseBody), [releaseBody]);

  useEffect(() => {
    if (!isEligible || hasOpenedRef.current) {
      return;
    }

    if (releaseQuery.data || releaseQuery.error) {
      setOpen(true);
      hasOpenedRef.current = true;
    }
  }, [isEligible, releaseQuery.data, releaseQuery.error]);

  return (
    <Dialog
      fullScreen={isExpanded}
      fullWidth
      maxWidth={isExpanded ? "xl" : "md"}
      onClose={handleRemindLater}
      open={open}
      scroll="paper"
      PaperProps={{
        sx: {
          display: "flex",
          flexDirection: "column",
          ...(isExpanded
            ? {
                m: { xs: 0, sm: 2 },
                height: { xs: "100%", sm: "calc(100% - 32px)" },
              }
            : {}),
        },
      }}
    >
      <DialogTitle sx={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
        {`What's new in CIPP ${releaseMeta.currentTag}`}
        <Button onClick={toggleExpanded} size="small" variant="outlined">
          {isExpanded ? "Shrink" : "Expand"}
        </Button>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 1, flex: 1, display: "flex" }}>
        <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
          <Typography variant="subtitle1">{releaseName}</Typography>
          <Typography color="text.secondary" variant="body2">
            The latest release notes are provided below. You can always read them on GitHub if you
            prefer.
          </Typography>
          {releaseQuery.isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : releaseQuery.error ? (
            <Typography color="error" variant="body2">
              We couldn't load the release notes right now. You can view them on GitHub instead.
              {releaseQuery.error?.message ? ` (${releaseQuery.error.message})` : ""}
            </Typography>
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                maxHeight: isExpanded ? "calc(100vh - 260px)" : 400,
                overflowY: "auto",
              }}
            >
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => (
                    <Link {...props} rel="noopener" target="_blank" underline="hover" />
                  ),
                  img: ({ node, ...props }) => (
                    <Box
                      alt={props.alt}
                      component="img"
                      loading="lazy"
                      sx={{ borderRadius: 1, display: "block", height: "auto", maxWidth: "100%" }}
                      {...props}
                    />
                  ),
                }}
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
              >
                {formattedReleaseBody}
              </ReactMarkdown>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          alignItems: "center",
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          justifyContent: "space-between",
          px: 3,
          py: 2,
        }}
      >
        <Link href={releaseUrl} rel="noopener" target="_blank" underline="hover">
          View release notes on GitHub
        </Link>
        <Stack direction="row" spacing={1}>
          <Button onClick={handleRemindLater} variant="outlined">
            Remind me next time
          </Button>
          <Button onClick={handleDismissUntilNextRelease} variant="contained">
            Don't show until next release
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
});

ReleaseNotesDialog.displayName = "ReleaseNotesDialog";
