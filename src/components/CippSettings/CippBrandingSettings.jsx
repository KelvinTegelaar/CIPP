import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Typography,
  Box,
  Stack,
  IconButton,
  Skeleton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import { Add, Delete, Palette } from "@mui/icons-material";
import { Grid } from "@mui/system";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { useSettings } from "../../hooks/use-settings";
import { CippApiResults } from "../CippComponents/CippApiResults";
import CippFormComponent from "../CippComponents/CippFormComponent";
import CippInfoTooltip from "../CippComponents/CippInfoTooltip";
import { CippAutoComplete } from "../CippComponents/CippAutocomplete";
import CippBrandingCoverPreview, { REPORT_COVER_PRESETS } from "./CippBrandingCoverPreview";
import CippBrandingReportPreview from "../CippPdf/CippBrandingReportPreview";
import {
  COVER_STOCK_OPTIONS,
  COVER_STOCK_NONE,
  DEFAULT_COVER_STOCK,
  normalizeCoverImageIds,
  normalizeCoverUploads,
  normalizeLogoImageIds,
  normalizeLogoUploads,
} from "../CippPdf/resolveCoverImage";
import { REPORT_COLOUR_ROLES } from "../CippPdf/reportTheme";
import { BRANDING_GALLERY_QUERY_KEY } from "../CippPdf/useBrandingSettings";
import { useForm } from "react-hook-form";

const LOGO_TOOLTIP =
  "PNG or SVG preferred; JPG/WebP OK. Max 5MB. Ideal ~200×100px (or similar aspect). Transparent background recommended. Used on cover and page headers.";

const COVER_TOOLTIP =
  "JPG or PNG. Max 5MB. Ideal ~1240×1754px (A4 portrait at ~150dpi) or similar portrait aspect. Prefer soft/dark imagery — shown full-bleed at ~50% opacity behind cover text. Used only on report cover pages. Pick a stock or uploaded cover, or upload a new one.";

const PRIMARY_COLOUR_TOOLTIP =
  "Your main brand colour. Drives the cover accent, page rules, section headings, table headers and the first chart series. Text placed on it is automatically switched between white and near-black, whichever is readable.";

const SECONDARY_COLOUR_TOOLTIP =
  "Optional accent colour, for subheadings, callout rules and the second chart series. Leave it unset to use the brand colour everywhere — reports then look exactly as they did before an accent existed.";

const ROLE_COLOUR_TOOLTIP =
  "Colour individual parts of a report. Each one follows the brand colour until you set it, so leaving them all empty keeps reports exactly as they are — and changing the brand colour still moves everything that follows it.";

/**
 * The per-role colours, read from wherever the caller has them.
 *
 * The API returns them nested under `roleColours`; the form holds them flat, one field per role,
 * because a colour picker bound to a nested path is more fragile than one bound to a flat name.
 * Reading both means this works whether it is handed saved branding or the live form.
 *
 * An unset role stays an empty string rather than being filled with its derived colour — the theme
 * derives it from the brand at render time, so storing a value here would freeze it and changing
 * the brand colour would stop moving the roles that follow it.
 *
 * Declared at module scope because `useForm`'s defaultValues needs it during the component's first
 * statement, which is before any `const` inside the component body has initialised.
 */
const roleColourValues = (source) =>
  Object.fromEntries(
    REPORT_COLOUR_ROLES.map((role) => [
      role.setting,
      source?.[role.setting] ?? source?.roleColours?.[role.setting] ?? "",
    ])
  );

const FOOTER_TOOLTIP =
  "Text shown at the bottom of every report page. Type % for CIPP's variables, plus %reportname% and %reportdate% which reports add. Report templates can override this or switch it off individually.";

const WATERMARK_TOOLTIP =
  "Diagonal text drawn faintly across every page of a report, cover included — e.g. DRAFT or CONFIDENTIAL. Typing text is enough to show it; the toggle only exists to switch it off without losing the wording.";

const REPORT_DEFAULTS_TOOLTIP =
  "Which preset each report reaches for when nothing else says otherwise. A report template with its own preset still wins over this, and this still wins over the default branding above.";

const PREVIEW_TOOLTIP =
  "Renders the real report against sample data so you can page through it. The sample figures exist only in this preview — a report run for a client with no data still shows that it has none.";

// Kept in step with the same ceiling in Add-CIPPImage. Storage is not the constraint — oversized
// entities are split across part rows — but branding images are returned inline as data URLs by
// ListBrandingSettings, and base64 adds about a third on top.
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const readImageFile = (file, onSuccess) => {
  if (!file) return;
  if (file.size > MAX_IMAGE_BYTES) {
    alert("File size must be less than 5MB");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => onSuccess(e.target.result);
  reader.readAsDataURL(file);
};

const GalleryTile = ({
  src,
  label,
  selected,
  onSelect,
  onDelete,
  empty = false,
  emptyLabel = "No cover image",
  add = false,
  disabled = false,
  aspectRatio = "3 / 4",
  objectFit = "cover",
}) => (
  <Box
    sx={{
      position: "relative",
      width: "100%",
      minWidth: 0,
      aspectRatio,
      borderRadius: 1,
      overflow: "hidden",
      border: "2px solid",
      borderColor: selected ? "primary.main" : "divider",
      bgcolor: empty || add ? "action.hover" : "action.hover",
      opacity: disabled ? 0.5 : 1,
      "&:hover": {
        borderColor: disabled ? "divider" : selected ? "primary.main" : "text.secondary",
      },
    }}
  >
    <Box
      component="button"
      type="button"
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      aria-label={add ? label : `Select ${label}`}
      aria-pressed={add ? undefined : selected}
      sx={{
        p: 0,
        m: 0,
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        bgcolor: "transparent",
        outline: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {add ? (
        <Add sx={{ fontSize: 32, color: "text.secondary" }} />
      ) : empty ? (
        <Typography
          variant="caption"
          sx={{
            px: 1,
            textAlign: "center",
            color: "text.secondary",
            fontWeight: "bold",
            lineHeight: 1.2,
          }}
        >
          {emptyLabel}
        </Typography>
      ) : (
        <Box
          component="img"
          src={src}
          alt={label}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit,
            objectPosition: "center",
            display: "block",
            pointerEvents: "none",
          }}
        />
      )}
    </Box>
    {onDelete && (
      <IconButton
        size="small"
        aria-label={`Delete ${label}`}
        disabled={disabled}
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onDelete();
        }}
        sx={{
          position: "absolute",
          right: 4,
          bottom: 4,
          zIndex: 1,
          p: 0.5,
          bgcolor: "rgba(0, 0, 0, 0.55)",
          color: "common.white",
          "&:hover": { bgcolor: "rgba(0, 0, 0, 0.75)" },
          "&.Mui-disabled": { bgcolor: "rgba(0, 0, 0, 0.35)", color: "rgba(255,255,255,0.5)" },
        }}
      >
        <Delete sx={{ fontSize: 16 }} />
      </IconButton>
    )}
  </Box>
);

const CippBrandingSettings = () => {
  const settings = useSettings();
  // Read through ApiGetCall rather than useBrandingSettings so the sync effect below can key on
  // when the fetch landed. Same cache entry either way.
  const brandingQuery = ApiGetCall({
    url: "/api/ListBrandingSettings",
    data: { includeGallery: true },
    queryKey: BRANDING_GALLERY_QUERY_KEY,
  });
  const branding = brandingQuery.data && !Array.isArray(brandingQuery.data) ? brandingQuery.data : {};

  const [logoImageId, setLogoImageId] = useState(branding.logoImageId || null);
  const [logoImageIds, setLogoImageIds] = useState(() => normalizeLogoImageIds(branding));
  const [logoUploads, setLogoUploads] = useState(() => normalizeLogoUploads(branding));
  const [coverStock, setCoverStock] = useState(branding.coverStock || DEFAULT_COVER_STOCK);
  const [coverImageId, setCoverImageId] = useState(branding.coverImageId || null);
  const [coverImageIds, setCoverImageIds] = useState(() => normalizeCoverImageIds(branding));
  const [coverUploads, setCoverUploads] = useState(() => normalizeCoverUploads(branding));
  const [uploadPending, setUploadPending] = useState(false);
  const [coversReady, setCoversReady] = useState(false);
  // Last selection chosen in this UI — prevents stale ListUserSettings from restoring an old pick.
  const pinnedCoverSelectionRef = useRef(null);
  const pinnedLogoSelectionRef = useRef(null);

  /* ── Presets ──────────────────────────────────────────────
   * The editor below has one scope at a time: the default branding, or a named preset. A preset is
   * a complete branding set rather than a patch, so what the editor shows is exactly what a report
   * pointed at it will render — new presets are seeded from whatever is on screen, which is what
   * keeps completeness from being tedious.
   */
  const [activePresetId, setActivePresetId] = useState(null);
  // One dialog serves create, duplicate and rename — all three ask for a name and differ only in
  // what happens to the values on screen.
  const [nameDialog, setNameDialog] = useState(null);
  const presetNameForm = useForm({ mode: "onChange", defaultValues: { presetName: "" } });
  const presetName = presetNameForm.watch("presetName") || "";
  const [livePreview, setLivePreview] = useState(false);
  const [reportDefaults, setReportDefaults] = useState({});

  const presetsApi = ApiGetCall({
    url: "/api/ListBrandingPresets",
    data: { includeImages: true },
    queryKey: "BrandingPresets",
  });

  const presets = useMemo(
    () => (Array.isArray(presetsApi.data) ? presetsApi.data : []),
    [presetsApi.data]
  );

  const activePreset = useMemo(
    () => presets.find((preset) => preset.id === activePresetId) || null,
    [presets, activePresetId]
  );

  // Options for the per-report default pickers. The empty value means "no preset", which resolves
  // to the default branding above.
  const presetOptions = useMemo(
    () => [
      { label: "Use default branding", value: "" },
      ...presets.map((preset) => ({ label: preset.name, value: preset.id })),
    ],
    [presets]
  );

  const reportTypeOptions = useMemo(
    () =>
      REPORT_COVER_PRESETS.map((preset) => ({
        value: preset.id,
        label: preset.label,
      })),
    []
  );

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      colour: branding.colour || "#F77F00",
      secondaryColour: branding.secondaryColour || "",
      footerText: branding.footerText || "",
      coverFooterText: branding.coverFooterText || "",
      showFooter: branding.showFooter !== false,
      showPageNumbers: branding.showPageNumbers !== false,
      watermarkText: branding.watermarkText || "",
      watermarkEnabled: branding.watermarkEnabled !== false,
      ...roleColourValues(branding),
      previewReportType: reportTypeOptions[0],
    },
  });

  // Everything the sync effect and Reset need to put back on the form, in one place — the two
  // paths drifting apart is how a field ends up saving but not reloading.
  const reportChromeValues = (source) => ({
    colour: source.colour || "#F77F00",
    secondaryColour: source.secondaryColour || "",
    footerText: source.footerText || "",
    coverFooterText: source.coverFooterText || "",
    showFooter: source.showFooter !== false,
    showPageNumbers: source.showPageNumbers !== false,
    watermarkText: source.watermarkText || "",
    watermarkEnabled: source.watermarkEnabled !== false,
    // Flat for the preview (createReportTheme accepts either) and nested for saving.
    ...roleColourValues(source),
    roleColours: roleColourValues(source),
  });

  const pinCoverSelection = (nextCoverImageId, nextCoverStock) => {
    pinnedCoverSelectionRef.current = {
      coverImageId: nextCoverImageId || null,
      coverStock: nextCoverStock || COVER_STOCK_NONE,
    };
  };

  const pinLogoSelection = (nextLogoImageId) => {
    pinnedLogoSelectionRef.current = {
      logoImageId: nextLogoImageId || null,
    };
  };

  // Sync gallery from ListUserSettings; selection is id-based (pinned in-session).
  useEffect(() => {
    if (!brandingQuery.isSuccess || uploadPending) return;
    // While a preset is being edited the form holds that preset's values, not the default ones —
    // syncing here would silently overwrite them with the default branding mid-edit.
    if (activePresetId) return;

    const next = brandingQuery.data;
    if (!next || Array.isArray(next)) return;

    const nextCoverIds = normalizeCoverImageIds(next);
    const nextCoverUploadsAligned = normalizeCoverUploads(next);
    const nextCoverUploads = nextCoverUploadsAligned.filter(
      (item) => typeof item === "string" && item.startsWith("data:image/")
    );
    const nextLogoIds = normalizeLogoImageIds(next);
    const nextLogoUploadsAligned = normalizeLogoUploads(next);
    const nextLogoUploads = nextLogoUploadsAligned.filter(
      (item) => typeof item === "string" && item.startsWith("data:image/")
    );

    // Avoid clobbering a just-uploaded gallery with an incomplete hydrate (ids without data).
    const coversHydrated = !(nextCoverIds.length > 0 && nextCoverUploads.length === 0);
    const logosHydrated = !(nextLogoIds.length > 0 && nextLogoUploads.length === 0 && !next.logo);

    if (logosHydrated) {
      setLogoImageIds(nextLogoIds);
      setLogoUploads(nextLogoUploadsAligned);

      let nextLogoId = pinnedLogoSelectionRef.current
        ? pinnedLogoSelectionRef.current.logoImageId
        : next.logoImageId || null;
      if (nextLogoId && !nextLogoIds.includes(nextLogoId)) {
        nextLogoId = null;
        pinnedLogoSelectionRef.current = { logoImageId: null };
      }
      setLogoImageId(nextLogoId);
    }

    if (coversHydrated) {
      setCoverImageIds(nextCoverIds);
      setCoverUploads(nextCoverUploadsAligned);

      let nextCoverId = pinnedCoverSelectionRef.current
        ? pinnedCoverSelectionRef.current.coverImageId
        : next.coverImageId || null;
      let nextStock = pinnedCoverSelectionRef.current
        ? pinnedCoverSelectionRef.current.coverStock
        : next.coverStock || DEFAULT_COVER_STOCK;

      if (nextCoverId && !nextCoverIds.includes(nextCoverId)) {
        nextCoverId = null;
        nextStock = COVER_STOCK_NONE;
        pinnedCoverSelectionRef.current = { coverImageId: null, coverStock: COVER_STOCK_NONE };
      }

      setCoverImageId(nextCoverId);
      setCoverStock(nextStock);
    }

    // Per-report preset assignments belong to the default branding, not to whichever scope is being
    // edited, so they sync regardless.
    if (next.reportDefaults && typeof next.reportDefaults === "object") {
      setReportDefaults(next.reportDefaults);
    }

    if (next.colour) {
      formControl.reset({
        ...reportChromeValues(next),
        previewReportType: formControl.getValues("previewReportType") || reportTypeOptions[0],
      });
    }
    if (coversHydrated || logosHydrated) {
      setCoversReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when server branding payload changes
  }, [activePresetId, uploadPending, brandingQuery.isSuccess, brandingQuery.dataUpdatedAt]);

  const brandColour = formControl.watch("colour") || "#F77F00";
  const previewReportTypeValue = formControl.watch("previewReportType");
  const previewReportType =
    previewReportTypeValue?.value || previewReportTypeValue || reportTypeOptions[0]?.value;
  const coverGalleryRef = useRef(null);
  const logoGalleryRef = useRef(null);

  const coversLoading = !coversReady;
  /**
   * Every write this page makes — settings, presets, image uploads and deletes.
   *
   * One mutation rather than two. They posted to the same endpoint with the same invalidation, but
   * each rendered its own results panel, so the page showed two stacked alert areas and an operator
   * had to work out which of them their last action had landed in. With one, the most recent result
   * is the one on screen.
   */
  const brandingApi = ApiPostCall({
    relatedQueryKeys: ["BrandingSettings*", "BrandingPresets"],
  });

  const logoPreview = useMemo(() => {
    if (!logoImageId) return null;
    const index = logoImageIds.indexOf(logoImageId);
    if (index >= 0 && logoUploads[index]) {
      return logoUploads[index];
    }
    if (branding.logo) return branding.logo;
    return null;
  }, [logoImageId, logoImageIds, logoUploads, branding.logo]);

  const coverPreview = useMemo(() => {
    if (!coverImageId) return null;
    const index = coverImageIds.indexOf(coverImageId);
    if (index >= 0 && coverUploads[index]) {
      return coverUploads[index];
    }
    if (branding.coverImage) return branding.coverImage;
    return null;
  }, [coverImageId, coverImageIds, coverUploads, branding.coverImage]);

  const noneOption = useMemo(() => {
    const option = COVER_STOCK_OPTIONS.find((item) => item.path === COVER_STOCK_NONE);
    if (!option) return null;
    return {
      key: option.key,
      src: option.path,
      label: option.label,
      type: "stock",
      empty: true,
    };
  }, []);

  const logoUploadOptions = useMemo(
    () =>
      logoImageIds
        .map((id, index) => ({
          key: id,
          id,
          src: logoUploads[index],
          label: `Logo ${index + 1}`,
          type: "upload",
          empty: false,
        }))
        .filter((option) => typeof option.src === "string" && option.src.startsWith("data:image/")),
    [logoImageIds, logoUploads]
  );

  const coverUploadOptions = useMemo(
    () =>
      coverImageIds
        .map((id, index) => ({
          key: id,
          id,
          src: coverUploads[index],
          label: `Uploaded ${index + 1}`,
          type: "upload",
          empty: false,
        }))
        .filter((option) => typeof option.src === "string" && option.src.startsWith("data:image/")),
    [coverImageIds, coverUploads]
  );

  const stockOptions = useMemo(
    () =>
      COVER_STOCK_OPTIONS.filter((option) => option.path !== COVER_STOCK_NONE).map((option) => ({
        key: option.key,
        src: option.path,
        label: option.label,
        type: "stock",
        empty: false,
      })),
    []
  );

  const buildLocalBranding = (overrides = {}) => {
    const formData = formControl.getValues();
    const nextCoverIds = overrides.coverImageIds ?? coverImageIds;
    const nextCoverUploads = overrides.coverUploads ?? coverUploads;
    const nextCoverId =
      overrides.coverImageId !== undefined ? overrides.coverImageId : coverImageId;
    const nextLogoIds = overrides.logoImageIds ?? logoImageIds;
    const nextLogoUploads = overrides.logoUploads ?? logoUploads;
    const nextLogoId = overrides.logoImageId !== undefined ? overrides.logoImageId : logoImageId;
    const nextStock = overrides.coverStock ?? coverStock;
    const coverIndex = nextCoverId ? nextCoverIds.indexOf(nextCoverId) : -1;
    const logoIndex = nextLogoId ? nextLogoIds.indexOf(nextLogoId) : -1;

    return {
      ...reportChromeValues(formData),
      logoImageId: nextLogoId || null,
      logoImageIds: nextLogoIds,
      coverImageId: nextCoverId || null,
      coverImageIds: nextCoverIds,
      coverStock: nextStock,
      logo: logoIndex >= 0 ? nextLogoUploads[logoIndex] || null : null,
      logoUploads: nextLogoUploads,
      coverImage: coverIndex >= 0 ? nextCoverUploads[coverIndex] || null : null,
      coverUploads: nextCoverUploads,
    };
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    readImageFile(file, async (base64String) => {
      setUploadPending(true);
      try {
        const response = await brandingApi.mutateAsync({
          url: "/api/ExecBrandingSettings",
          data: {
            Action: "UploadImage",
            kind: "logo",
            data: base64String,
          },
          queryKey: "BrandingLogoUpload",
        });
        const uploaded = response?.data?.Results;
        const id = uploaded?.id;
        if (!id) {
          throw new Error("Upload did not return an image id");
        }
        const nextIds = [id, ...logoImageIds.filter((existing) => existing !== id)];
        const nextUploads = [
          base64String,
          ...logoUploads.filter((_, index) => logoImageIds[index] !== id),
        ];
        setLogoImageIds(nextIds);
        setLogoUploads(nextUploads);
        setLogoImageId(id);
        pinLogoSelection(id);
        if (logoGalleryRef.current) {
          logoGalleryRef.current.scrollLeft = 0;
        }
      } catch (error) {
        console.error("Failed to upload logo", error);
        alert(error?.response?.data?.Results || error.message || "Failed to upload logo");
      } finally {
        setUploadPending(false);
      }
    });
  };

  const handleLogoSelect = (option) => {
    if (option.type === "none") {
      setLogoImageId(null);
      pinLogoSelection(null);
      return;
    }
    setLogoImageId(option.id);
    pinLogoSelection(option.id);
  };

  const handleLogoDelete = async (id) => {
    if (!id) return;
    setUploadPending(true);
    try {
      await brandingApi.mutateAsync({
        url: "/api/ExecBrandingSettings",
        data: {
          Action: "DeleteImage",
          kind: "logo",
          id,
        },
        queryKey: "BrandingLogoDelete",
      });
      const nextIds = logoImageIds.filter((existing) => existing !== id);
      const nextUploads = logoUploads.filter((_, index) => logoImageIds[index] !== id);
      setLogoImageIds(nextIds);
      setLogoUploads(nextUploads);
      const deletedSelected = logoImageId === id;
      const nextLogoId = deletedSelected ? null : logoImageId;
      if (deletedSelected) {
        setLogoImageId(null);
        pinLogoSelection(null);
      } else {
        pinLogoSelection(logoImageId);
      }
    } catch (error) {
      console.error("Failed to delete logo", error);
      alert(error?.response?.data?.Results || error.message || "Failed to delete logo");
    } finally {
      setUploadPending(false);
    }
  };

  const handleCoverUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    readImageFile(file, async (base64String) => {
      setUploadPending(true);
      try {
        const response = await brandingApi.mutateAsync({
          url: "/api/ExecBrandingSettings",
          data: {
            Action: "UploadImage",
            kind: "cover",
            data: base64String,
          },
          queryKey: "BrandingCoverUpload",
        });
        const uploaded = response?.data?.Results;
        const id = uploaded?.id;
        if (!id) {
          throw new Error("Upload did not return an image id");
        }
        const nextIds = [id, ...coverImageIds.filter((existing) => existing !== id)];
        const nextUploads = [
          base64String,
          ...coverUploads.filter((_, index) => coverImageIds[index] !== id),
        ];
        setCoverImageIds(nextIds);
        setCoverUploads(nextUploads);
        setCoverImageId(id);
        pinCoverSelection(id, coverStock);
        if (coverGalleryRef.current) {
          coverGalleryRef.current.scrollTop = 0;
        }
      } catch (error) {
        console.error("Failed to upload cover", error);
        alert(error?.response?.data?.Results || error.message || "Failed to upload cover");
      } finally {
        setUploadPending(false);
      }
    });
  };

  const handleCoverSelect = (option) => {
    if (option.type === "stock") {
      setCoverStock(option.src);
      setCoverImageId(null);
      pinCoverSelection(null, option.src);
      return;
    }
    setCoverImageId(option.id);
    pinCoverSelection(option.id, coverStock);
  };

  const handleCoverDelete = async (id) => {
    if (!id) return;
    setUploadPending(true);
    try {
      await brandingApi.mutateAsync({
        url: "/api/ExecBrandingSettings",
        data: {
          Action: "DeleteImage",
          kind: "cover",
          id,
        },
        queryKey: "BrandingCoverDelete",
      });
      const nextIds = coverImageIds.filter((existing) => existing !== id);
      const nextUploads = coverUploads.filter((_, index) => coverImageIds[index] !== id);
      setCoverImageIds(nextIds);
      setCoverUploads(nextUploads);
      const deletedSelected = coverImageId === id;
      const nextCoverId = deletedSelected ? null : coverImageId;
      const nextStock = deletedSelected ? COVER_STOCK_NONE : coverStock;
      if (deletedSelected) {
        setCoverImageId(null);
        setCoverStock(COVER_STOCK_NONE);
        pinCoverSelection(null, COVER_STOCK_NONE);
      } else {
        pinCoverSelection(coverImageId, coverStock);
      }
    } catch (error) {
      console.error("Failed to delete cover", error);
      alert(error?.response?.data?.Results || error.message || "Failed to delete cover");
    } finally {
      setUploadPending(false);
    }
  };

  /**
   * Point the editor at the default branding or at a preset.
   *
   * The image galleries are shared between scopes — a preset selects from the same logo and cover
   * library — so only the selection changes here, never the gallery contents.
   */
  const handleSelectScope = (presetId) => {
    const preset = presetId ? presets.find((item) => item.id === presetId) : null;
    const source = presetId ? preset : branding;
    if (presetId && !preset) return;

    setActivePresetId(presetId || null);
    formControl.reset({
      ...reportChromeValues(source || {}),
      previewReportType: formControl.getValues("previewReportType") || reportTypeOptions[0],
    });
    setLogoImageId(source?.logoImageId || null);
    setCoverImageId(source?.coverImageId || null);
    setCoverStock(source?.coverStock || (presetId ? COVER_STOCK_NONE : DEFAULT_COVER_STOCK));
    pinLogoSelection(source?.logoImageId || null);
    pinCoverSelection(source?.coverImageId || null, source?.coverStock || COVER_STOCK_NONE);
  };

  const savePreset = (name, id) => {
    const brandingData = buildLocalBranding();
    brandingApi.mutate(
      {
        url: "/api/ExecBrandingSettings",
        data: {
          Action: "SavePreset",
          id: id || undefined,
          name,
          colour: brandingData.colour,
          secondaryColour: brandingData.secondaryColour,
          logoImageId: brandingData.logoImageId,
          coverImageId: brandingData.coverImageId,
          coverStock: brandingData.coverStock,
          footerText: brandingData.footerText,
          coverFooterText: brandingData.coverFooterText,
          showFooter: brandingData.showFooter,
          showPageNumbers: brandingData.showPageNumbers,
          watermarkText: brandingData.watermarkText,
          watermarkEnabled: brandingData.watermarkEnabled,
        },
        queryKey: "BrandingPresetSave",
      },
      {
        onSuccess: (response) => {
          const savedId = response?.data?.Results?.id || response?.data?.id;
          if (savedId) setActivePresetId(savedId);
          presetsApi.refetch();
        },
      }
    );
  };

  /**
   * Create, duplicate and rename all end here.
   *
   * Create and duplicate differ only in what the editor is showing when they run — duplicate saves
   * the loaded preset's values under a new name, create saves whatever is on screen — so both save
   * with no id and get a new one. Rename keeps the id, which makes it an update rather than a copy,
   * and so leaves every template pointing at that preset still pointing at it.
   */
  const handleConfirmName = () => {
    const name = presetName.trim();
    if (!name) return;
    const mode = nameDialog;
    setNameDialog(null);
    presetNameForm.reset({ presetName: "" });
    savePreset(name, mode === "rename" ? activePresetId : null);
  };

  const openNameDialog = (mode) => {
    setNameDialog(mode);
    presetNameForm.reset({
      presetName:
        mode === "rename"
          ? activePreset?.name || ""
          : mode === "duplicate"
            ? `${activePreset?.name || "Preset"} copy`
            : "",
    });
  };

  const handleDeletePreset = () => {
    if (!activePreset) return;
    brandingApi.mutate(
      {
        url: "/api/ExecBrandingSettings",
        data: { Action: "DeletePreset", id: activePreset.id },
        queryKey: "BrandingPresetDelete",
      },
      {
        onSuccess: () => {
          setActivePresetId(null);
          presetsApi.refetch();
          handleSelectScope(null);
        },
      }
    );
  };

  const handleSave = () => {
    // A preset is stored on its own row; only the default scope is the app-wide branding, so only
    // that path updates the in-memory settings every report reads by default.
    if (activePresetId) {
      savePreset(activePreset?.name || "Untitled preset", activePresetId);
      return;
    }

    const brandingData = buildLocalBranding();


    brandingApi.mutate({
      url: "/api/ExecBrandingSettings",
      data: {
        Action: "Set",
        colour: brandingData.colour,
        secondaryColour: brandingData.secondaryColour,
        logoImageId: brandingData.logoImageId,
        logoImageIds: brandingData.logoImageIds,
        coverImageId: brandingData.coverImageId,
        coverImageIds: brandingData.coverImageIds,
        coverStock: brandingData.coverStock,
        footerText: brandingData.footerText,
        coverFooterText: brandingData.coverFooterText,
        showFooter: brandingData.showFooter,
        showPageNumbers: brandingData.showPageNumbers,
        watermarkText: brandingData.watermarkText,
        watermarkEnabled: brandingData.watermarkEnabled,
        roleColours: brandingData.roleColours,
        reportDefaults,
      },
      queryKey: "BrandingSettingsPost",
    });
  };

  /**
   * Assign a preset as the default for one report type.
   *
   * Saved immediately rather than on the Save button: the assignment belongs to the default branding
   * and has nothing to do with whichever scope the editor happens to be showing, so deferring it to
   * a button that might be saving a preset would be the wrong pairing.
   */
  const handleReportDefaultChange = (reportId, presetId) => {
    const next = { ...reportDefaults };
    if (presetId) {
      next[reportId] = presetId;
    } else {
      delete next[reportId];
    }
    setReportDefaults(next);
    brandingApi.mutate({
      url: "/api/ExecBrandingSettings",
      data: { Action: "Set", reportDefaults: next },
      queryKey: "BrandingReportDefaults",
    });
  };

  const handleReset = () => {
    setLogoImageId(null);
    setLogoImageIds([]);
    setLogoUploads([]);
    setCoverImageId(null);
    setCoverImageIds([]);
    setCoverUploads([]);
    setCoverStock(DEFAULT_COVER_STOCK);
    pinLogoSelection(null);
    pinCoverSelection(null, DEFAULT_COVER_STOCK);
    formControl.reset({
      ...reportChromeValues({}),
      previewReportType: formControl.getValues("previewReportType") || reportTypeOptions[0],
    });


    brandingApi.mutate({
      url: "/api/ExecBrandingSettings",
      data: {
        Action: "Reset",
      },
      queryKey: "BrandingSettingsReset",
    });
  };

  const busy = brandingApi.isPending || uploadPending;

  // What the full-report preview renders against: the unsaved editor state, not what is stored, so
  // a colour or footer can be judged before committing it.
  const previewBranding = useMemo(
    () => ({
      ...reportChromeValues(formControl.watch()),
      logo: logoPreview,
      coverImage: coverPreview,
      coverImageId: coverPreview ? coverImageId : null,
      coverStock,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- watch() is re-read on every render
    [formControl.watch(), logoPreview, coverPreview, coverImageId, coverStock]
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 0.5 }}>
          Branding
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Customize your organization&apos;s branding for reports and documents. The default applies
          to every report; presets can be assigned to individual report templates instead.
        </Typography>
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
          Editing
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          <Chip
            label="Default"
            color={activePresetId ? "default" : "primary"}
            variant={activePresetId ? "outlined" : "filled"}
            onClick={() => handleSelectScope(null)}
            disabled={busy}
          />
          {presets.map((preset) => (
            <Chip
              key={preset.id}
              label={preset.name}
              color={activePresetId === preset.id ? "primary" : "default"}
              variant={activePresetId === preset.id ? "filled" : "outlined"}
              onClick={() => handleSelectScope(preset.id)}
              disabled={busy}
            />
          ))}
          <Button
            size="small"
            startIcon={<Add />}
            onClick={() => openNameDialog("create")}
            disabled={busy}
          >
            New preset
          </Button>
          {activePreset && (
            <>
              <Button size="small" onClick={() => openNameDialog("rename")} disabled={busy}>
                Rename
              </Button>
              <Button size="small" onClick={() => openNameDialog("duplicate")} disabled={busy}>
                Duplicate
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<Delete />}
                onClick={handleDeletePreset}
                disabled={busy}
              >
                Delete
              </Button>
            </>
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {activePreset
            ? `Changes below apply to the "${activePreset.name}" preset only.`
            : "Changes below apply to every report that has no preset assigned."}
        </Typography>
      </Box>

      <Box>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            Default Preset Per Report
          </Typography>
          <CippInfoTooltip title={REPORT_DEFAULTS_TOOLTIP} />
        </Stack>
        <Grid container spacing={2}>
          {REPORT_COVER_PRESETS.map((report) => (
            <Grid key={report.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <CippAutoComplete
                size="small"
                label={report.label}
                multiple={false}
                creatable={false}
                disableClearable={true}
                disabled={busy}
                options={presetOptions}
                value={
                  presetOptions.find((option) => option.value === reportDefaults[report.id]) ??
                  presetOptions[0]
                }
                onChange={(option) => handleReportDefaultChange(report.id, option?.value ?? "")}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog open={!!nameDialog} onClose={() => setNameDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {nameDialog === "rename"
            ? "Rename preset"
            : nameDialog === "duplicate"
              ? "Duplicate preset"
              : "New branding preset"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {nameDialog === "rename"
              ? "Templates already pointing at this preset keep pointing at it."
              : "The preset starts as a copy of what is currently on screen, so you only have to change what differs."}
          </Typography>
          <Box onKeyDown={(event) => event.key === "Enter" && handleConfirmName()}>
            <CippFormComponent
              type="textField"
              name="presetName"
              label="Preset name"
              placeholder="Client facing"
              formControl={presetNameForm}
              validators={{
                required: "A name is required",
                maxLength: { value: 128, message: "Name must be 128 characters or fewer" },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNameDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmName} disabled={!presetName.trim()}>
            {nameDialog === "rename" ? "Rename" : nameDialog === "duplicate" ? "Duplicate" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Logo
                </Typography>
                <CippInfoTooltip title={LOGO_TOOLTIP} />
              </Stack>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="logo-upload"
                type="file"
                onChange={handleLogoUpload}
                disabled={busy || coversLoading}
              />
              <Box sx={{ width: "100%", containerType: "inline-size" }}>
                <Box
                  ref={logoGalleryRef}
                  sx={{
                    width: "100%",
                    overflowX: "auto",
                    overflowY: "hidden",
                    pb: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridAutoFlow: "column",
                      gridAutoColumns: "calc((100% - 16px) / 3)",
                      gridAutoRows: "min-content",
                      gap: 1,
                      width: "max-content",
                      minWidth: "100%",
                      alignItems: "stretch",
                    }}
                  >
                    {coversLoading
                      ? Array.from({ length: 3 }).map((_, index) => (
                          <Skeleton
                            key={`logo-skeleton-${index}`}
                            variant="rounded"
                            sx={{ width: "100%", aspectRatio: "2 / 1", transform: "none" }}
                          />
                        ))
                      : [
                          {
                            key: "add",
                            type: "add",
                            label: "Upload logo",
                          },
                          {
                            key: "none",
                            type: "none",
                            label: "No logo",
                            empty: true,
                          },
                          ...logoUploadOptions,
                        ].map((option) => {
                          if (option.type === "add") {
                            return (
                              <GalleryTile
                                key={option.key}
                                label={option.label}
                                add
                                disabled={busy}
                                aspectRatio="2 / 1"
                                onSelect={() => document.getElementById("logo-upload")?.click()}
                              />
                            );
                          }
                          const selected =
                            option.type === "none"
                              ? !logoImageId
                              : logoImageId === option.id;
                          return (
                            <GalleryTile
                              key={option.key}
                              src={option.src}
                              label={option.label}
                              selected={selected}
                              empty={option.empty}
                              emptyLabel="No logo"
                              disabled={busy}
                              aspectRatio="2 / 1"
                              objectFit="contain"
                              onSelect={() => handleLogoSelect(option)}
                              onDelete={
                                option.type === "upload"
                                  ? () => handleLogoDelete(option.id)
                                  : undefined
                              }
                            />
                          );
                        })}
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box>
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Cover Image
                </Typography>
                <CippInfoTooltip title={COVER_TOOLTIP} />
              </Stack>

              <input
                accept="image/*"
                style={{ display: "none" }}
                id="cover-upload"
                type="file"
                onChange={handleCoverUpload}
                disabled={busy || coversLoading}
              />
              <Box sx={{ width: "100%", containerType: "inline-size", mb: 1 }}>
                <Box
                  ref={coverGalleryRef}
                  sx={{
                    width: "100%",
                    maxHeight: "calc(3 * ((100cqw - 16px) / 3) * 4 / 3 + 16px)",
                    overflowY: "auto",
                    overflowX: "hidden",
                    pr: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: 1,
                      alignContent: "start",
                    }}
                  >
                    {coversLoading
                      ? Array.from({ length: 9 }).map((_, index) => (
                          <Skeleton
                            key={`cover-skeleton-${index}`}
                            variant="rounded"
                            sx={{ width: "100%", aspectRatio: "3 / 4", transform: "none" }}
                          />
                        ))
                      : [
                          {
                            key: "add",
                            type: "add",
                            label: "Upload cover",
                          },
                          ...(noneOption ? [noneOption] : []),
                          ...coverUploadOptions,
                          ...stockOptions,
                        ].map((option) => {
                          if (option.type === "add") {
                            return (
                              <GalleryTile
                                key={option.key}
                                label={option.label}
                                add
                                disabled={busy}
                                onSelect={() => document.getElementById("cover-upload")?.click()}
                              />
                            );
                          }
                          const selected =
                            option.type === "upload"
                              ? coverImageId === option.id
                              : !coverImageId && coverStock === option.src;
                          return (
                            <GalleryTile
                              key={option.key}
                              src={option.src}
                              label={option.label}
                              selected={selected}
                              empty={option.empty}
                              disabled={busy}
                              onSelect={() => handleCoverSelect(option)}
                              onDelete={
                                option.type === "upload"
                                  ? () => handleCoverDelete(option.id)
                                  : undefined
                              }
                            />
                          );
                        })}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* One results panel for the whole page — settings, presets and images all report
                here, so the last thing you did is the thing you read. */}
            <CippApiResults apiObject={brandingApi} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              position: { md: "sticky" },
              top: { md: 16 },
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1.5 }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      {livePreview ? "Full Report Preview" : "Cover Preview"}
                    </Typography>
                    <CippInfoTooltip title={PREVIEW_TOOLTIP} />
                  </Stack>
                  <Button size="small" onClick={() => setLivePreview((open) => !open)}>
                    {livePreview ? "Show cover only" : "Preview full report"}
                  </Button>
                </Stack>
                {livePreview ? (
                  /* The real report document rendered against sample data. Heavier than the DOM
                     mock — a full PDF layout — so it is opt-in rather than always on. */
                  <Box
                    sx={{
                      width: "100%",
                      height: "min(70vh, 820px)",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      overflow: "hidden",
                    }}
                  >
                    <CippBrandingReportPreview
                      reportType={previewReportType}
                      brandingSettings={previewBranding}
                    />
                  </Box>
                ) : (
                  <CippBrandingCoverPreview
                    colour={brandColour}
                    secondaryColour={formControl.watch("secondaryColour")}
                    coverFooterText={formControl.watch("coverFooterText")}
                    watermarkText={formControl.watch("watermarkText")}
                    watermarkEnabled={formControl.watch("watermarkEnabled")}
                    logo={logoPreview}
                    coverImage={coverPreview}
                    coverImageId={coverPreview ? coverImageId : null}
                    coverStock={coverStock}
                    reportType={previewReportType}
                  />
                )}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                }}
              >
                <Box sx={{ flex: "0 0 auto" }}>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Brand Color
                    </Typography>
                    <CippInfoTooltip title={PRIMARY_COLOUR_TOOLTIP} />
                  </Stack>
                  <CippFormComponent
                    type="colorPicker"
                    name="colour"
                    formControl={formControl}
                    sx={{ width: "120px" }}
                  />
                </Box>

                <Box sx={{ flex: "0 0 auto" }}>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Accent Color
                    </Typography>
                    <CippInfoTooltip title={SECONDARY_COLOUR_TOOLTIP} />
                  </Stack>
                  <CippFormComponent
                    type="colorPicker"
                    name="secondaryColour"
                    formControl={formControl}
                    sx={{ width: "120px" }}
                  />
                </Box>

                <Box sx={{ flex: "1 1 200px", minWidth: 180 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                    Report Type Preview
                  </Typography>
                  <CippFormComponent
                    type="autoComplete"
                    name="previewReportType"
                    formControl={formControl}
                    multiple={false}
                    creatable={false}
                    disableClearable={true}
                    options={reportTypeOptions}
                  />
                </Box>
              </Box>

              <Box>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    Report Colors
                  </Typography>
                  <CippInfoTooltip title={ROLE_COLOUR_TOOLTIP} />
                </Stack>
                {/* Rendered from the role list rather than written out one by one, so a role added
                    to the theme appears here without touching this file. Each is left empty until
                    set: empty means "follow the brand color", which is what keeps an install that
                    has only picked a brand color looking exactly as it did. */}
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {REPORT_COLOUR_ROLES.map((role) => (
                    <Box key={role.setting} sx={{ flex: "0 0 auto" }}>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                          {role.label}
                        </Typography>
                        <CippInfoTooltip title={role.description} />
                      </Stack>
                      <CippFormComponent
                        type="colorPicker"
                        name={role.setting}
                        formControl={formControl}
                        sx={{ width: "120px" }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    Page Footer
                  </Typography>
                  <CippInfoTooltip title={FOOTER_TOOLTIP} />
                </Stack>
                <Stack spacing={1}>
                  {/* The variables field is the one CIPP uses everywhere else, so typing % offers
                      the same replacement variables here as it does in a template. */}
                  <CippFormComponent
                    type="textFieldWithVariables"
                    name="footerText"
                    formControl={formControl}
                    placeholder="%tenantname% — prepared by Contoso IT — %reportdate%"
                    helperText="Type % for variables. Reports add %reportname% and %reportdate%."
                    includeSystemVariables={true}
                    validators={{
                      maxLength: {
                        value: 200,
                        message: "Footer text must be 200 characters or fewer",
                      },
                    }}
                  />
                  <CippFormComponent
                    type="textFieldWithVariables"
                    name="coverFooterText"
                    label="Cover Note"
                    placeholder="Blank = each report's own wording"
                    helperText="Replaces the confidentiality note on cover pages"
                    includeSystemVariables={true}
                    formControl={formControl}
                    validators={{
                      maxLength: {
                        value: 200,
                        message: "Cover note must be 200 characters or fewer",
                      },
                    }}
                  />
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <CippFormComponent
                      type="switch"
                      name="showFooter"
                      label="Show footer text"
                      formControl={formControl}
                    />
                    <CippFormComponent
                      type="switch"
                      name="showPageNumbers"
                      label="Show page numbers"
                      formControl={formControl}
                    />
                  </Stack>
                </Stack>
              </Box>

              <Box>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    Watermark
                  </Typography>
                  <CippInfoTooltip title={WATERMARK_TOOLTIP} />
                </Stack>
                <Stack spacing={1}>
                  <CippFormComponent
                    type="textField"
                    name="watermarkText"
                    formControl={formControl}
                    placeholder="DRAFT"
                    validators={{
                      maxLength: {
                        value: 40,
                        message: "Watermark text must be 40 characters or fewer",
                      },
                    }}
                  />
                  <CippFormComponent
                    type="switch"
                    name="watermarkEnabled"
                    label="Show watermark"
                    formControl={formControl}
                  />
                </Stack>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSave}
                  disabled={busy}
                  startIcon={<Palette />}
                >
                  {activePreset ? `Save "${activePreset.name}"` : "Save Branding"}
                </Button>
                {/* Reset clears the default branding and the shared image library, so it is not
                    offered while a preset is selected — deleting the preset is the local action. */}
                {!activePreset && (
                  <Button variant="outlined" size="small" onClick={handleReset} disabled={busy}>
                    Reset
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CippBrandingSettings;
