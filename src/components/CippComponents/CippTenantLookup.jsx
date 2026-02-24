import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Skeleton,
  Chip,
  Grid,
  Paper,
  Divider,
  useTheme,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Search,
  Public,
  Language,
  LocationOn,
  Cloud,
} from "@mui/icons-material";
import { useForm, useWatch } from "react-hook-form";
import CippButtonCard from "../CippCards/CippButtonCard";
import { ApiGetCall } from "../../api/ApiCall";
import { CippCopyToClipBoard } from "./CippCopyToClipboard";

// Region icon mapping
const getRegionIcon = (region) => {
  const regionUpper = region?.toUpperCase();
  switch (regionUpper) {
    case "EU":
      return <Language sx={{ fontSize: 20 }} />;
    case "US":
      return <Public sx={{ fontSize: 20 }} />;
    case "ASIA":
      return <Language sx={{ fontSize: 20 }} />;
    case "GCC":
    case "GCC-HIGH":
      return <Cloud sx={{ fontSize: 20 }} />;
    case "DE":
      return <Language sx={{ fontSize: 20 }} />;
    case "CN":
      return <Language sx={{ fontSize: 20 }} />;
    default:
      return <LocationOn sx={{ fontSize: 20 }} />;
  }
};

// Region color mapping
const getRegionColor = (region) => {
  const regionUpper = region?.toUpperCase();
  switch (regionUpper) {
    case "EU":
      return "primary";
    case "US":
      return "success";
    case "ASIA":
      return "warning";
    case "GCC":
    case "GCC-HIGH":
      return "info";
    case "DE":
      return "secondary";
    case "CN":
      return "error";
    default:
      return "default";
  }
};

export const CippTenantLookup = () => {
  const formControl = useForm({ mode: "onBlur" });
  const domain = useWatch({ control: formControl.control, name: "domain" });
  
  const getTenant = ApiGetCall({
    url: "/api/ListExternalTenantInfo",
    data: { tenant: domain },
    queryKey: `tenant-${domain}`,
    waiting: false,
  });

  const theme = useTheme();
  const tenantData = getTenant.data;
  const graphData = tenantData?.GraphRequest;
  const openIdData = tenantData?.OpenIdConfig;
  const brandingData = tenantData?.UserTenantBranding?.[0];
  const [illustrationUrl, setIllustrationUrl] = useState(null);
  const [tileLogoUrl, setTileLogoUrl] = useState(null);

  // Fetch illustration as blob and convert to object URL
  useEffect(() => {
    let currentObjectUrl = null;
    
    if (brandingData?.Illustration && typeof brandingData.Illustration === "string" && brandingData.Illustration.trim() !== "") {
      const fetchIllustration = async () => {
        try {
          const response = await fetch(brandingData.Illustration);
          if (response.ok && response.headers.get("content-type")?.startsWith("image/")) {
            const blob = await response.blob();
            if (blob.size > 0) {
              currentObjectUrl = URL.createObjectURL(blob);
              setIllustrationUrl(currentObjectUrl);
            } else {
              setIllustrationUrl(null);
            }
          } else {
            setIllustrationUrl(null);
          }
        } catch (error) {
          console.error("Failed to fetch illustration:", error);
          setIllustrationUrl(null);
        }
      };
      fetchIllustration();
    } else {
      setIllustrationUrl(null);
    }

    // Cleanup: revoke object URL when component unmounts or illustration changes
    return () => {
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, [brandingData?.Illustration]);

  // Cleanup illustration URL on unmount
  useEffect(() => {
    return () => {
      if (illustrationUrl) {
        URL.revokeObjectURL(illustrationUrl);
      }
    };
  }, [illustrationUrl]);

  // Fetch tile logo as blob and convert to object URL (respects theme, falls back to available logo)
  useEffect(() => {
    let currentObjectUrl = null;
    const isDarkMode = theme.palette.mode === "dark";
    
    // Determine which logo to use: prefer theme-appropriate, but fall back to whichever is available
    let logoUrl = null;
    if (isDarkMode) {
      logoUrl = brandingData?.TileDarkLogo || brandingData?.TileLogo;
    } else {
      logoUrl = brandingData?.TileLogo || brandingData?.TileDarkLogo;
    }
    
    if (logoUrl && typeof logoUrl === "string" && logoUrl.trim() !== "") {
      const fetchLogo = async () => {
        try {
          const response = await fetch(logoUrl);
          if (response.ok && response.headers.get("content-type")?.startsWith("image/")) {
            const blob = await response.blob();
            if (blob.size > 0) {
              currentObjectUrl = URL.createObjectURL(blob);
              setTileLogoUrl(currentObjectUrl);
            } else {
              setTileLogoUrl(null);
            }
          } else {
            setTileLogoUrl(null);
          }
        } catch (error) {
          console.error("Failed to fetch tile logo:", error);
          setTileLogoUrl(null);
        }
      };
      fetchLogo();
    } else {
      setTileLogoUrl(null);
    }

    // Cleanup: revoke object URL when component unmounts or logo changes
    return () => {
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, [brandingData?.TileLogo, brandingData?.TileDarkLogo, theme.palette.mode]);

  // Cleanup tile logo URL on unmount
  useEffect(() => {
    return () => {
      if (tileLogoUrl) {
        URL.revokeObjectURL(tileLogoUrl);
      }
    };
  }, [tileLogoUrl]);

  return (
    <CippButtonCard title="Tenant Lookup">
      <Grid container spacing={3}>
        {/* Search Section */}
        <Grid size={{ xs: 12 }}>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              if (domain && !getTenant.isFetching) {
                getTenant.refetch();
              }
            }}
            sx={{ width: "100%", maxWidth: "600px", display: "flex", gap: 1 }}
          >
            <TextField
              fullWidth
              type="text"
              label="Tenant"
              placeholder="Domain name or tenant ID"
              value={domain || ""}
              onChange={(e) => formControl.setValue("domain", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment
                    position="start"
                    sx={{ display: "flex", alignItems: "center", mb: 0, mt: "12px" }}
                  >
                    <Search color="action" sx={{ fontSize: 20 }} />
                  </InputAdornment>
                ),
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
              onClick={() => getTenant.refetch()}
              disabled={!domain || getTenant.isFetching}
              startIcon={<Search />}
              sx={{ flexShrink: 0 }}
            >
              Check
            </Button>
          </Box>
        </Grid>

        {/* Results Section */}
        {getTenant.isFetching ? (
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Fetching Results
            </Typography>
            <Skeleton variant="text" width="100%" height={40} />
            <Skeleton variant="text" width="80%" height={40} />
            <Skeleton variant="text" width="90%" height={40} />
          </Grid>
        ) : tenantData ? (
          <>
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 0 }} />
            </Grid>

            {/* Preview Container with Illustration Background */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  position: "relative",
                  minHeight: 400,
                  borderRadius: 2,
                  overflow: "hidden",
                  backgroundColor: "background.default",
                  backgroundImage: illustrationUrl 
                    ? `url(${illustrationUrl})` 
                    : `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='notfound' x='0' y='0' width='200' height='200' patternUnits='userSpaceOnUse'%3E%3Ctext x='50' y='50' font-family='Arial, sans-serif' font-size='12' font-weight='600' fill='%23999999' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45 50 50)'%3ENotFound%3C/text%3E%3Ctext x='150' y='150' font-family='Arial, sans-serif' font-size='12' font-weight='600' fill='%23999999' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45 150 150)'%3ENotFound%3C/text%3E%3Ctext x='50' y='150' font-family='Arial, sans-serif' font-size='12' font-weight='600' fill='%23999999' text-anchor='middle' dominant-baseline='middle' transform='rotate(45 50 150)'%3ENotFound%3C/text%3E%3Ctext x='150' y='50' font-family='Arial, sans-serif' font-size='12' font-weight='600' fill='%23999999' text-anchor='middle' dominant-baseline='middle' transform='rotate(45 150 50)'%3ENotFound%3C/text%3E%3C/pattern%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23notfound)'/%3E%3C/svg%3E")`,
                  backgroundSize: illustrationUrl ? "cover" : "200px 200px",
                  backgroundPosition: "center",
                  backgroundRepeat: illustrationUrl ? "no-repeat" : "repeat",
                  boxShadow: 2,
                }}
              >
                {/* Overlay Content */}
                <Box
                  sx={{
                    position: "relative",
                    p: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 2,
                    alignItems: { xs: "stretch", md: "stretch" },
                  }}
                >
                  {/* Tenant Details Container */}
                  <Paper
                    elevation={3}
                    sx={{
                      p: 2.5,
                      backgroundColor: "background.paper",
                      borderRadius: 1,
                      opacity: illustrationUrl ? 0.95 : 1,
                      flex: 1,
                      maxWidth: { xs: "100%", sm: "900px" },
                      display: "flex",
                      flexDirection: "column",
                      alignSelf: { xs: "stretch", md: "stretch" },
                    }}
                  >
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                      Tenant Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Tenant Name
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                          <Typography variant="body1">
                            {domain || "Not Available"}
                          </Typography>
                          {domain && <CippCopyToClipBoard text={domain} />}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Default Domain Name
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                          <Typography variant="body1">
                            {graphData?.defaultDomainName || "Not Available"}
                          </Typography>
                          {graphData?.defaultDomainName && <CippCopyToClipBoard text={graphData.defaultDomainName} />}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Tenant ID
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                          <Typography variant="body1" sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}>
                            {graphData?.tenantId || "Not Available"}
                          </Typography>
                          {graphData?.tenantId && <CippCopyToClipBoard text={graphData.tenantId} />}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Tenant Region
                        </Typography>
                        {openIdData?.tenant_region_scope ? (
                          <Chip
                            icon={getRegionIcon(openIdData.tenant_region_scope)}
                            label={openIdData.tenant_region_scope}
                            color={getRegionColor(openIdData.tenant_region_scope)}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        ) : (
                          <Typography variant="body1" sx={{ mb: 1.5 }}>
                            Not Available
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Tile Logo Container */}
                  {(brandingData?.TileLogo || brandingData?.TileDarkLogo) && (
                    <Paper
                      elevation={3}
                      sx={{
                        p: 2.5,
                        backgroundColor: "background.paper",
                        borderRadius: 1,
                        opacity: illustrationUrl ? 0.95 : 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        minWidth: { xs: "100%", md: "200px" },
                        maxWidth: { xs: "100%", md: "200px" },
                        alignSelf: { xs: "stretch", md: "stretch" },
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Tenant Logo
                      </Typography>
                      {tileLogoUrl ? (
                        <Box
                          component="img"
                          src={tileLogoUrl}
                          alt="Tenant Logo"
                          sx={{
                            maxWidth: "100%",
                            maxHeight: 150,
                            objectFit: "contain",
                            borderRadius: 1,
                            mt: 1,
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <Skeleton variant="rectangular" width={150} height={150} sx={{ mt: 1, borderRadius: 1 }} />
                      )}
                    </Paper>
                  )}
                </Box>
              </Box>
            </Grid>
          </>
        ) : null}
      </Grid>
    </CippButtonCard>
  );
};

export default CippTenantLookup;
