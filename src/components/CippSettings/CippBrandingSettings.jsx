import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Typography, Box, Stack, IconButton, Skeleton } from "@mui/material";
import { Add, Delete, Palette } from "@mui/icons-material";
import { Grid } from "@mui/system";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { useSettings } from "../../hooks/use-settings";
import { CippApiResults } from "../CippComponents/CippApiResults";
import CippFormComponent from "../CippComponents/CippFormComponent";
import CippInfoTooltip from "../CippComponents/CippInfoTooltip";
import CippBrandingCoverPreview, {
  REPORT_COVER_PRESETS,
} from "./CippBrandingCoverPreview";
import {
  COVER_STOCK_OPTIONS,
  COVER_STOCK_NONE,
  DEFAULT_COVER_STOCK,
  normalizeCoverImageIds,
  normalizeCoverUploads,
  normalizeLogoImageIds,
  normalizeLogoUploads,
} from "../CippPdf/resolveCoverImage";
import { useForm } from "react-hook-form";

const LOGO_TOOLTIP =
  "PNG or SVG preferred; JPG/WebP OK. Max 2MB. Ideal ~200×100px (or similar aspect). Transparent background recommended. Used on cover and page headers.";

const COVER_TOOLTIP =
  "JPG or PNG. Max 2MB. Ideal ~1240×1754px (A4 portrait at ~150dpi) or similar portrait aspect. Prefer soft/dark imagery — shown full-bleed at ~50% opacity behind cover text. Used only on report cover pages. Pick a stock or uploaded cover, or upload a new one.";

const readImageFile = (file, onSuccess) => {
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    alert("File size must be less than 2MB");
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
  const branding = settings?.customBranding || {};
  const userSettings = ApiGetCall({
    url: "/api/ListUserSettings",
    queryKey: "userSettings",
  });

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
      previewReportType: reportTypeOptions[0],
    },
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
    if (!userSettings.isSuccess || uploadPending) return;

    const next = settings?.customBranding;
    if (!next) return;

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

    if (next.colour) {
      formControl.reset({
        colour: next.colour,
        previewReportType: formControl.getValues("previewReportType") || reportTypeOptions[0],
      });
    }
    if (coversHydrated || logosHydrated) {
      setCoversReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when server branding payload changes
  }, [
    uploadPending,
    userSettings.isSuccess,
    userSettings.dataUpdatedAt,
    settings?.customBranding?.logoImageId,
    settings?.customBranding?.coverImageId,
    settings?.customBranding?.coverStock,
    settings?.customBranding?.colour,
    settings?.customBranding?.logo,
    Array.isArray(settings?.customBranding?.logoImageIds)
      ? settings.customBranding.logoImageIds.join(",")
      : settings?.customBranding?.logoImageIds,
    Array.isArray(settings?.customBranding?.logoUploads)
      ? settings.customBranding.logoUploads.length
      : settings?.customBranding?.logoUploads
        ? 1
        : 0,
    Array.isArray(settings?.customBranding?.coverImageIds)
      ? settings.customBranding.coverImageIds.join(",")
      : settings?.customBranding?.coverImageIds,
    Array.isArray(settings?.customBranding?.coverUploads)
      ? settings.customBranding.coverUploads.length
      : settings?.customBranding?.coverUploads
        ? 1
        : 0,
  ]);

  const brandColour = formControl.watch("colour") || "#F77F00";
  const previewReportTypeValue = formControl.watch("previewReportType");
  const previewReportType =
    previewReportTypeValue?.value || previewReportTypeValue || reportTypeOptions[0]?.value;
  const coverGalleryRef = useRef(null);
  const logoGalleryRef = useRef(null);

  const coversLoading = !coversReady;
  const saveBrandingSettings = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: ["BrandingSettings", "userSettings"],
  });

  const imageAction = ApiPostCall({
    relatedQueryKeys: ["BrandingSettings", "userSettings"],
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
      colour: formData.colour,
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
        const response = await imageAction.mutateAsync({
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
        settings.handleUpdate({
          customBranding: buildLocalBranding({
            logoImageId: id,
            logoImageIds: nextIds,
            logoUploads: nextUploads,
          }),
        });
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
      await imageAction.mutateAsync({
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
      settings.handleUpdate({
        customBranding: buildLocalBranding({
          logoImageId: nextLogoId,
          logoImageIds: nextIds,
          logoUploads: nextUploads,
        }),
      });
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
        const response = await imageAction.mutateAsync({
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
        settings.handleUpdate({
          customBranding: buildLocalBranding({
            coverImageId: id,
            coverImageIds: nextIds,
            coverUploads: nextUploads,
          }),
        });
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
      await imageAction.mutateAsync({
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
      settings.handleUpdate({
        customBranding: buildLocalBranding({
          coverImageId: nextCoverId,
          coverImageIds: nextIds,
          coverUploads: nextUploads,
          coverStock: nextStock,
        }),
      });
    } catch (error) {
      console.error("Failed to delete cover", error);
      alert(error?.response?.data?.Results || error.message || "Failed to delete cover");
    } finally {
      setUploadPending(false);
    }
  };

  const handleSave = () => {
    const brandingData = buildLocalBranding();

    settings.handleUpdate({
      customBranding: brandingData,
    });

    saveBrandingSettings.mutate({
      url: "/api/ExecBrandingSettings",
      data: {
        Action: "Set",
        colour: brandingData.colour,
        logoImageId: brandingData.logoImageId,
        logoImageIds: brandingData.logoImageIds,
        coverImageId: brandingData.coverImageId,
        coverImageIds: brandingData.coverImageIds,
        coverStock: brandingData.coverStock,
      },
      queryKey: "BrandingSettingsPost",
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
      colour: "#F77F00",
      previewReportType: formControl.getValues("previewReportType") || reportTypeOptions[0],
    });

    settings.handleUpdate({
      customBranding: {
        colour: "#F77F00",
        logoImageId: null,
        logoImageIds: [],
        coverImageId: null,
        coverImageIds: [],
        coverStock: DEFAULT_COVER_STOCK,
        logo: null,
        logoUploads: [],
        coverImage: null,
        coverUploads: [],
      },
    });

    saveBrandingSettings.mutate({
      url: "/api/ExecBrandingSettings",
      data: {
        Action: "Reset",
      },
      queryKey: "BrandingSettingsReset",
    });
  };

  const busy = saveBrandingSettings.isPending || imageAction.isPending || uploadPending;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 0.5 }}>
          Branding
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Customize your organization&apos;s branding for reports and documents. Changes apply to
          all generated reports.
        </Typography>
      </Box>

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

            <CippApiResults apiObject={saveBrandingSettings} />
            <CippApiResults apiObject={imageAction} />
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
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1.5 }}>
                  Cover Preview
                </Typography>
                <CippBrandingCoverPreview
                  colour={brandColour}
                  logo={logoPreview}
                  coverImage={coverPreview}
                  coverImageId={coverPreview ? coverImageId : null}
                  coverStock={coverStock}
                  reportType={previewReportType}
                />
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
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                    Brand Color
                  </Typography>
                  <CippFormComponent
                    type="colorPicker"
                    name="colour"
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

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSave}
                  disabled={busy}
                  startIcon={<Palette />}
                >
                  Save Branding
                </Button>
                <Button variant="outlined" size="small" onClick={handleReset} disabled={busy}>
                  Reset
                </Button>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CippBrandingSettings;
