import PropTypes from "prop-types";
import { CippAutoComplete } from "../CippComponents/CippAutocomplete";
import { ApiGetCall } from "../../api/ApiCall";
import { IconButton, Tooltip, Box, Chip, Typography } from "@mui/material";
import { Refresh, Star, StarBorder } from "@mui/icons-material";
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { CippOffCanvas } from "./CippOffCanvas";
import { useSettings } from "../../hooks/use-settings";
import { useTenantPreferences } from "../../hooks/use-tenant-preferences";
import { getCippError } from "../../utils/get-cipp-error";
import { useQueryClient } from "@tanstack/react-query";
import { getIconByName } from "../../utils/icon-registry";

export const CippTenantSelector = React.forwardRef((props, ref) => {
  const { width, allTenants = false, multiple = false, refreshButton, tenantButton } = props;
  //get the current tenant from SearchParams called 'tenantFilter'
  const router = useRouter();
  const settings = useSettings();
  const queryClient = useQueryClient();
  const { recent, favorites, trackRecent, toggleFavorite, isFavorite } = useTenantPreferences();
  const tenant = router.query.tenantFilter ? router.query.tenantFilter : settings.currentTenant;
  const routerUpdateTimeoutRef = useRef(null);

  // Fetch tenant list
  const tenantList = ApiGetCall({
    url: "/api/listTenants",
    data: { AllTenantSelector: true },
    queryKey: "TenantSelector",
    refetchOnMount: false,
    refetchOnReconnect: false,
    keepPreviousData: true,
  });

  const [currentTenant, setSelectedTenant] = useState(null);
  const [offcanvasVisible, setOffcanvasVisible] = useState(false);

  // Fetch tenant details based on the current tenant
  const tenantDetails = ApiGetCall({
    url: "/api/listTenantDetails",
    data: { tenantFilter: currentTenant?.value },
    queryKey: `TenantDetails-${currentTenant?.value}`,
    waiting: false,
    toast: true,
  });

  const baseTenantOptions = useMemo(() => {
    if (!tenantList.isSuccess || !Array.isArray(tenantList.data) || tenantList.data.length === 0) {
      return [];
    }
    return tenantList.data.map(({ customerId, displayName, defaultDomainName, initialDomainName, SharepointAdminUrl }) => ({
      value: defaultDomainName,
      label: `${displayName} (${defaultDomainName})`,
      addedFields: {
        defaultDomainName: defaultDomainName,
        displayName: displayName,
        customerId: customerId,
        initialDomainName: initialDomainName,
        sharepointAdminUrl: SharepointAdminUrl,
      },
    }));
  }, [tenantList.isSuccess, tenantList.data]);

  const groupedTenantOptions = useMemo(() => {
    if (baseTenantOptions.length === 0) {
      return [];
    }

    const allTenantsOption = baseTenantOptions.find((option) => option.value === "AllTenants");
    const selectableOptions = baseTenantOptions.filter((option) => option.value !== "AllTenants");

    const favoriteValues = new Set(favorites.map((item) => item.value).filter((value) => value !== "AllTenants"));
    const recentValues = recent.map((item) => item.value).filter((value) => value !== "AllTenants" && !favoriteValues.has(value));
    const recentSet = new Set(recentValues);
    const byValue = new Map(selectableOptions.map((option) => [option.value, option]));

    const favoriteOptions = favorites
      .map((item) => byValue.get(item.value))
      .filter(Boolean)
      .map((option) => ({ ...option, group: "Favorites" }));

    const recentOptions = recentValues
      .map((value) => byValue.get(value))
      .filter(Boolean)
      .map((option) => ({ ...option, group: "Recent" }));

    const allOptions = selectableOptions
      .filter((option) => !favoriteValues.has(option.value) && !recentSet.has(option.value))
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((option) => ({ ...option, group: "All tenants" }));

    // Keep AllTenants pinned first in its own unlabelled group so Favorites/Recent don't split "All tenants"
    return [
      ...(allTenantsOption ? [{ ...allTenantsOption, group: "" }] : []),
      ...favoriteOptions,
      ...recentOptions,
      ...allOptions,
    ];
  }, [baseTenantOptions, favorites, recent]);

  const handleToggleFavorite = useCallback(
    (event, option) => {
      event.preventDefault();
      event.stopPropagation();
      toggleFavorite(option);
    },
    [toggleFavorite]
  );

  const handleTenantChange = useCallback(
    (newValue) => {
      if (!newValue) return;
      setSelectedTenant(newValue);
      trackRecent(newValue);
    },
    [trackRecent]
  );

  // Filter portal actions based on user preferences
  const filteredPortalActions = useMemo(() => {
    // Define all available portal actions with current tenant data
    const allPortalActions = [
      {
        key: "M365_Portal",
        label: "M365 Admin Portal",
        link: `https://admin.cloud.microsoft/?delegatedOrg=${currentTenant?.addedFields?.initialDomainName}`,
        icon: "Public",
      },
      {
        key: "Exchange_Portal",
        label: "Exchange Portal",
        link: `https://admin.cloud.microsoft/exchange?delegatedOrg=${currentTenant?.addedFields?.initialDomainName}`,
        icon: "Mail",
      },
      {
        key: "Entra_Portal",
        label: "Entra Portal",
        link: `https://entra.microsoft.com/${currentTenant?.value}`,
        icon: "Groups",
      },
      {
        key: "Teams_Portal",
        label: "Teams Portal",
        link: `https://admin.teams.microsoft.com/?delegatedOrg=${currentTenant?.addedFields?.initialDomainName}`,
        icon: "FilePresent",
      },
      {
        key: "Azure_Portal",
        label: "Azure Portal",
        link: `https://portal.azure.com/${currentTenant?.value}`,
        icon: "Dns",
      },
      {
        key: "Intune_Portal",
        label: "Intune Portal",
        link: `https://intune.microsoft.com/${currentTenant?.value}`,
        icon: "Laptop",
      },
      {
        key: "SharePoint_Admin",
        label: "SharePoint Portal",
        // The only portal whose host cannot be derived from the tenant - it has to be resolved
        // through Graph. Use the URL the backend already resolved when it has one; otherwise fall
        // back to the endpoint that resolves it and redirects.
        link: currentTenant?.addedFields?.sharepointAdminUrl || `/api/ListSharePointAdminUrl?tenantFilter=${currentTenant?.value}`,
        icon: "Share",
        external: true,
      },
      {
        key: "Security_Portal",
        label: "Security Portal",
        link: `https://security.microsoft.com/?tid=${currentTenant?.addedFields?.customerId}`,
        icon: "Shield",
      },
      {
        key: "Compliance_Portal",
        label: "Purview Portal",
        link: `https://purview.microsoft.com/?tid=${currentTenant?.addedFields?.customerId}`,
        icon: "ShieldMoon",
      },
      {
        key: "Power_Platform_Portal",
        label: "Power Platform Portal",
        link: `https://admin.powerplatform.microsoft.com/account/login/${currentTenant?.addedFields?.customerId}`,
        icon: "PrecisionManufacturing",
      },
      {
        key: "Power_BI_Portal",
        label: "Power BI Portal",
        link: `https://app.powerbi.com/admin-portal?ctid=${currentTenant?.addedFields?.customerId}`,
        icon: "BarChart",
      },
    ];

    // Default to all links enabled (final fallback)
    const defaultLinks = {
      M365_Portal: true,
      Exchange_Portal: true,
      Entra_Portal: true,
      Teams_Portal: true,
      Azure_Portal: true,
      Intune_Portal: true,
      SharePoint_Admin: true,
      Security_Portal: true,
      Compliance_Portal: true,
      Power_Platform_Portal: true,
      Power_BI_Portal: true,
    };

    let portalLinks;
    if (settings.UserSpecificSettings?.portalLinks) {
      portalLinks = { ...defaultLinks, ...settings.UserSpecificSettings.portalLinks };
    } else if (settings.portalLinks) {
      portalLinks = { ...defaultLinks, ...settings.portalLinks };
    } else {
      portalLinks = defaultLinks;
    }

    const filteredActions = allPortalActions.filter((action) => {
      const isEnabled = portalLinks[action.key] === true;
      return isEnabled;
    });

    // insert a Manage Tenant link at the start
    filteredActions.unshift({
      key: "Manage_Tenant",
      label: "Manage Tenant",
      link: `/tenant/manage/edit?tenantFilter=${currentTenant?.value}`,
      icon: "Business",
    });

    return filteredActions;
  }, [currentTenant, settings]);

  // This effect handles updates when the tenant is changed via dropdown selection
  useEffect(() => {
    if (!router.isReady) return;
    if (currentTenant?.value) {
      const query = { ...router.query };
      if (query.tenantFilter !== currentTenant.value) {
        // Clear any pending timeout
        if (routerUpdateTimeoutRef.current) {
          clearTimeout(routerUpdateTimeoutRef.current);
        }

        // Only cancel on a real tenant change; cancelling the initial-load URL backfill
        // aborts mount fetches that react-query never retries.
        if (query.tenantFilter && query.tenantFilter !== currentTenant.value) {
          queryClient.cancelQueries();
        }

        // Update router only - let the URL watcher handle settings
        query.tenantFilter = currentTenant.value;
        router.replace(
          {
            pathname: router.pathname,
            query: query,
          },
          undefined,
          { shallow: true }
        );
      }
    }
  }, [currentTenant?.value]);

  // This effect handles when the URL parameter changes (from deep link or user selection)
  // This is the single source of truth for tenant changes
  // Supports external hotlinks using customerId (GUID) or initialDomainName in addition to defaultDomainName
  useEffect(() => {
    if (!router.isReady || !tenantList.isSuccess) return;

    const urlTenant = router.query.tenantFilter;

    // Only process if we have a URL tenant
    if (urlTenant) {
      // Find the tenant in our list - try defaultDomainName first, then customerId and initialDomainName
      const matchingTenant =
        tenantList.data.find(({ defaultDomainName }) => defaultDomainName === urlTenant) ||
        tenantList.data.find(({ customerId }) => customerId === urlTenant) ||
        tenantList.data.find(({ initialDomainName }) => initialDomainName === urlTenant);

      if (matchingTenant) {
        const resolvedDomain = matchingTenant.defaultDomainName;

        // If the URL used a non-default identifier, normalize the URL to use defaultDomainName
        if (urlTenant !== resolvedDomain) {
          const query = { ...router.query, tenantFilter: resolvedDomain };
          router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
          return; // The replace will re-trigger this effect with the normalized value
        }

        // Update local state if different
        if (!currentTenant || resolvedDomain !== currentTenant.value) {
          setSelectedTenant({
            value: resolvedDomain,
            label: `${matchingTenant.displayName} (${resolvedDomain})`,
            addedFields: {
              defaultDomainName: matchingTenant.defaultDomainName,
              displayName: matchingTenant.displayName,
              customerId: matchingTenant.customerId,
              initialDomainName: matchingTenant.initialDomainName,
              sharepointAdminUrl: matchingTenant.SharepointAdminUrl,
            },
          });
        }

        // Update settings if different (null filter in settings-context prevents saving null)
        if (settings.currentTenant !== resolvedDomain) {
          settings.handleUpdate({
            currentTenant: resolvedDomain,
          });
        }
      }
    }
  }, [router.isReady, router.query.tenantFilter, tenantList.isSuccess]);

  // This effect ensures the tenant filter parameter is included in the URL when missing
  useEffect(() => {
    if (!router.isReady || !settings.currentTenant) return;

    // If the tenant parameter is missing from the URL but we have it in settings
    if (!router.query.tenantFilter && settings.currentTenant) {
      const query = { ...router.query, tenantFilter: settings.currentTenant };
      router.replace(
        {
          pathname: router.pathname,
          query: query,
        },
        undefined,
        { shallow: true }
      );
    }
  }, [router.isReady, router.query.tenantFilter, settings.currentTenant]);

  useEffect(() => {
    if (tenant && currentTenant?.value && currentTenant?.value !== "AllTenants") {
      tenantDetails.refetch();
    }
  }, [tenant, offcanvasVisible]);

  // We can simplify this effect since we now have the new effect above to handle URL changes
  useEffect(() => {
    if (tenant && tenantList.isSuccess && !currentTenant) {
      const matchingTenant =
        tenantList.data.find(({ defaultDomainName }) => defaultDomainName === tenant) ||
        tenantList.data.find(({ customerId }) => customerId === tenant) ||
        tenantList.data.find(({ initialDomainName }) => initialDomainName === tenant);
      const resolvedDomain = matchingTenant?.defaultDomainName;
      setSelectedTenant(
        matchingTenant
          ? {
              value: resolvedDomain,
              label: `${matchingTenant.displayName} (${resolvedDomain})`,
              addedFields: {
                defaultDomainName: matchingTenant.defaultDomainName,
                displayName: matchingTenant.displayName,
                customerId: matchingTenant.customerId,
                initialDomainName: matchingTenant.initialDomainName,
                sharepointAdminUrl: matchingTenant.SharepointAdminUrl,
              },
            }
          : {
              value: null,
              label: "Invalid Tenant",
            }
      );
    }
  }, [tenant, tenantList.isSuccess, currentTenant]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (routerUpdateTimeoutRef.current) {
        clearTimeout(routerUpdateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          "& > *": {
            mx: "2px", // 1px margin between the elements
          },
        }}
      >
        {tenantButton && (
          <IconButton
            aria-label="tenantOffCanvas"
            color="inherit"
            size="small"
            onClick={() => {
              setOffcanvasVisible(true);
            }}
            disabled={!currentTenant || currentTenant.value === "AllTenants"}
          >
            <Tooltip title="Show Tenant Information">{getIconByName("Business")}</Tooltip>
          </IconButton>
        )}
        <CippAutoComplete
          ref={ref}
          disabled={tenantList.isFetching || tenantList.isError}
          isFetching={tenantList.isFetching}
          disableClearable={true}
          creatable={false}
          multiple={multiple}
          // Full width below md by default: the hard 400px overflowed any narrow container
          // this selector was dropped into (the old 80%-wide mobile drawer most visibly).
          sx={{ width: width ? width : { xs: "100%", md: "400px" } }}
          placeholder={
            tenantList.isFetching
              ? "Loading Tenants..."
              : tenantList.isError
                ? `Error loading Tenants: ${getCippError(tenantList.error)}`
                : "Select a Tenant"
          }
          value={currentTenant}
          onChange={handleTenantChange}
          options={groupedTenantOptions}
          groupBy={(option) => option.group ?? ""}
          // Keep the selected tenant in the list so it stays in its group / alphabetical position
          filterSelectedOptions={false}
          renderGroup={(params) => (
            <li key={params.key}>
              {params.group ? (
                <Box
                  component="div"
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    typography: "caption",
                    fontWeight: 700,
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  {params.group}
                </Box>
              ) : null}
              <ul style={{ padding: 0, margin: 0 }}>{params.children}</ul>
            </li>
          )}
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props;
            const isAllTenants = option.value === "AllTenants";
            const favourited = !isAllTenants && isFavorite(option.value);
            return (
              <Box component="li" key={key ?? `${option.group}-${option.value}`} {...optionProps}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    width: "100%",
                    minWidth: 0,
                  }}
                >
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{ flex: 1, minWidth: 0, fontWeight: isAllTenants ? 600 : 400 }}
                  >
                    {option.label}
                  </Typography>
                  {selected && (
                    <Chip
                      label="Current"
                      size="small"
                      variant="outlined"
                      sx={{
                        flexShrink: 0,
                        height: 20,
                        color: "text.secondary",
                      }}
                    />
                  )}
                  {!isAllTenants && (
                    <Tooltip title={favourited ? "Remove favorite" : "Add favorite"}>
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label={favourited ? "Remove favorite" : "Add favorite"}
                        onClick={(event) => handleToggleFavorite(event, option)}
                        onMouseDown={(event) => event.preventDefault()}
                        sx={{ color: favourited ? "warning.main" : "action.active", flexShrink: 0 }}
                      >
                        {favourited ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            );
          }}
          getOptionLabel={(option) => option?.label || ""}
          isOptionEqualToValue={
            (option, value) => option.value === value.value // Custom equality test to compare the tenant by value
          }
        />
        {refreshButton && (
          <IconButton
            aria-label="refresh"
            disabled={tenantList.isFetching}
            color="inherit"
            size="small"
            onClick={() => {
              tenantList.refetch();
            }}
          >
            <Tooltip title="Refresh tenant list">
              <Refresh />
            </Tooltip>
          </IconButton>
        )}
      </Box>
      <CippOffCanvas
        isFetching={tenantDetails.isFetching}
        visible={offcanvasVisible}
        onClose={() => setOffcanvasVisible(false)}
        extendedData={tenantDetails.data}
        extendedInfoFields={[
          "displayName",
          "id",
          "street",
          "postalCode",
          "technicalNotificationMails",
          "onPremisesSyncEnabled",
          "onPremisesLastSyncDateTime",
          "onPremisesLastPasswordSyncDateTime",
        ]}
        actions={filteredPortalActions}
      />
    </>
  );
});

CippTenantSelector.displayName = "CippTenantSelector";

CippTenantSelector.propTypes = {
  allTenants: PropTypes.bool,
  multiple: PropTypes.bool,
  refreshButton: PropTypes.bool,
  tenantButton: PropTypes.bool,
};
