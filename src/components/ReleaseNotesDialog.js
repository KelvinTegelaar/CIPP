import {
  Component,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
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
import remarkParse from "remark-parse";
import rehypeRaw from "rehype-raw";
import { unified } from "unified";
import packageInfo from "../../public/version.json";
import { ApiGetCall } from "../api/ApiCall";
import { GitHub } from "@mui/icons-material";
import { CippAutoComplete } from "./CippComponents/CippAutocomplete";

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

class MarkdownErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("Failed to render release notes", error);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.state.error);
    }

    return this.props.children;
  }
}

export const ReleaseNotesDialog = forwardRef((_props, ref) => {
  const releaseMeta = useMemo(() => buildReleaseMetadata(packageInfo.version), []);
  const [isEligible, setIsEligible] = useState(false);
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [manualOpenRequested, setManualOpenRequested] = useState(false);
  const [selectedReleaseTag, setSelectedReleaseTag] = useState(releaseMeta.releaseTag);
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    hasOpenedRef.current = false;
  }, [releaseMeta.releaseTag]);

  useEffect(() => {
    setSelectedReleaseTag(releaseMeta.releaseTag);
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

  const shouldFetchReleaseList = isEligible || manualOpenRequested || open;

  const releaseListQuery = ApiGetCall({
    url: "/api/ListGitHubReleaseNotes",
    queryKey: "list-github-release-options",
    data: {
      Owner: RELEASE_OWNER,
      Repository: RELEASE_REPO,
    },
    waiting: shouldFetchReleaseList,
    staleTime: 300000,
  });

  const isReleaseListLoading = releaseListQuery.isLoading || releaseListQuery.isFetching;

  const releaseCatalog = useMemo(() => {
    return Array.isArray(releaseListQuery.data) ? releaseListQuery.data : [];
  }, [releaseListQuery.data]);

  useEffect(() => {
    if (!releaseCatalog.length) {
      return;
    }

    if (!selectedReleaseTag) {
      setSelectedReleaseTag(releaseCatalog[0].releaseTag);
      return;
    }

    const hasSelected = releaseCatalog.some((release) => release.releaseTag === selectedReleaseTag);

    if (!hasSelected) {
      const fallbackRelease =
        releaseCatalog.find((release) => release.releaseTag === releaseMeta.releaseTag) ||
        releaseCatalog[0];
      if (fallbackRelease) {
        setSelectedReleaseTag(fallbackRelease.releaseTag);
      }
    }
  }, [releaseCatalog, selectedReleaseTag, releaseMeta.releaseTag]);

  const releaseOptions = useMemo(() => {
    const mapped = releaseCatalog.map((release) => {
      const tag = release.releaseTag ?? release.tagName;
      const label = release.name ? `${release.name} (${tag})` : tag;
      return {
        label,
        value: tag,
        addedFields: {
          htmlUrl: release.htmlUrl,
          publishedAt: release.publishedAt,
        },
      };
    });

    if (selectedReleaseTag && !mapped.some((option) => option.value === selectedReleaseTag)) {
      mapped.push({
        label: selectedReleaseTag,
        value: selectedReleaseTag,
        addedFields: {
          htmlUrl: releaseMeta.releaseUrl,
          publishedAt: null,
        },
      });
    }

    return mapped;
  }, [releaseCatalog, selectedReleaseTag, releaseMeta.releaseUrl]);

  const selectedReleaseValue = useMemo(() => {
    if (!selectedReleaseTag) {
      return null;
    }

    return (
      releaseOptions.find((option) => option.value === selectedReleaseTag) || {
        label: selectedReleaseTag,
        value: selectedReleaseTag,
      }
    );
  }, [releaseOptions, selectedReleaseTag]);

  const handleReleaseChange = useCallback(
    (newValue) => {
      const nextValue = Array.isArray(newValue) ? newValue[0] : newValue;
      if (nextValue?.value && nextValue.value !== selectedReleaseTag) {
        setSelectedReleaseTag(nextValue.value);
      }
    },
    [selectedReleaseTag]
  );

  useImperativeHandle(ref, () => ({
    open: () => {
      setManualOpenRequested(true);
      setOpen(true);
    },
  }));

  const selectedReleaseData = useMemo(() => {
    if (!selectedReleaseTag) {
      return null;
    }

    return (
      releaseCatalog.find((release) => release.releaseTag === selectedReleaseTag) ||
      releaseCatalog.find((release) => release.releaseTag === releaseMeta.releaseTag) ||
      null
    );
  }, [releaseCatalog, selectedReleaseTag, releaseMeta.releaseTag]);

  const handleDismissUntilNextRelease = () => {
    const newestRelease = releaseCatalog[0];
    const tagToStore =
      newestRelease?.releaseTag ?? newestRelease?.tagName ?? releaseMeta.releaseTag;
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

  const requestedVersionLabel =
    selectedReleaseData?.releaseTag ?? selectedReleaseTag ?? releaseMeta.currentTag;
  const releaseName =
    selectedReleaseData?.name || selectedReleaseValue?.label || `CIPP ${releaseMeta.currentTag}`;
  const releaseHeading = releaseName || requestedVersionLabel;
  const releaseBody = typeof selectedReleaseData?.body === "string" ? selectedReleaseData.body : "";
  const releaseUrl =
    selectedReleaseData?.htmlUrl ??
    selectedReleaseValue?.addedFields?.htmlUrl ??
    releaseMeta.releaseUrl;
  const formattedReleaseBody = useMemo(() => formatReleaseBody(releaseBody), [releaseBody]);
  const gfmSupport = useMemo(() => {
    if (!formattedReleaseBody) {
      return { plugins: [remarkGfm], error: null };
    }

    try {
      unified().use(remarkParse).use(remarkGfm).parse(formattedReleaseBody);
      return { plugins: [remarkGfm], error: null };
    } catch (err) {
      return { plugins: [], error: err };
    }
  }, [formattedReleaseBody]);

  useEffect(() => {
    if (!isEligible || hasOpenedRef.current) {
      return;
    }

    if (releaseCatalog.length || releaseListQuery.error) {
      setOpen(true);
      hasOpenedRef.current = true;
    }
  }, [isEligible, releaseCatalog.length, releaseListQuery.error]);

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
        <Stack
          alignItems={{ xs: "flex-start", sm: "center" }}
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ width: "100%" }}
        >
          <Typography sx={{ flexGrow: 1 }} variant="h6">
            {`Release notes for ${releaseHeading}`}
          </Typography>
          <CippAutoComplete
            creatable={false}
            disableClearable
            isFetching={isReleaseListLoading}
            label="Release"
            multiple={false}
            onChange={handleReleaseChange}
            options={releaseOptions}
            placeholder="Select a release"
            size="small"
            sx={{ minWidth: { xs: "100%", sm: 260 }, maxWidth: { xs: "100%", sm: 320 } }}
            value={selectedReleaseValue}
          />
          <Button onClick={toggleExpanded} size="small" variant="outlined">
            {isExpanded ? "Shrink" : "Expand"}
          </Button>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 1, flex: 1, display: "flex" }}>
        <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
          {releaseListQuery.error ? (
            <Typography color="error" variant="body2">
              We couldn't load additional releases right now. The latest release notes are shown
              below.
              {releaseListQuery.error?.message ? ` (${releaseListQuery.error.message})` : ""}
            </Typography>
          ) : null}
          {gfmSupport.error ? (
            <Typography color="warning.main" variant="body2">
              Displaying these release notes without GitHub-flavoured markdown enhancements due to a
              parsing issue. Formatting may look different.
            </Typography>
          ) : null}
          {isReleaseListLoading && !selectedReleaseData ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : releaseListQuery.error ? (
            <Typography color="error" variant="body2">
              We couldn't load the release notes right now. You can view them on GitHub instead.
              {releaseListQuery.error?.message ? ` (${releaseListQuery.error.message})` : ""}
            </Typography>
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                maxHeight: isExpanded ? "calc(100vh - 260px)" : 600,
                overflowY: "auto",
              }}
            >
              <MarkdownErrorBoundary
                fallback={(error) => (
                  <Stack spacing={1.5}>
                    <Typography color="error" variant="body2">
                      We couldn't format these release notes
                      {error?.message ? ` (${error.message})` : ""}. A plain-text version is shown
                      below.
                    </Typography>
                    <Box
                      component="pre"
                      sx={{ whiteSpace: "pre-wrap", fontFamily: "inherit", m: 0 }}
                    >
                      {releaseBody}
                    </Box>
                  </Stack>
                )}
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
                  remarkPlugins={gfmSupport.plugins}
                >
                  {formattedReleaseBody}
                </ReactMarkdown>
              </MarkdownErrorBoundary>
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
        <Button
          href={releaseUrl}
          rel="noopener"
          target="_blank"
          variant="text"
          startIcon={<GitHub />}
        >
          View release notes on GitHub
        </Button>
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
