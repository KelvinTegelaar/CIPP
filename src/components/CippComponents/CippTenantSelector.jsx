import PropTypes from "prop-types";
import { CippAutoComplete } from "../CippComponents/CippAutocomplete";
import { ApiGetCall } from "../../api/ApiCall";
import { IconButton, SvgIcon, Tooltip, Box } from "@mui/material";
import { FilePresent, Laptop, Mail, Refresh, Share, Shield, ShieldMoon } from "@mui/icons-material";
import {
  BuildingOfficeIcon,
  GlobeAltIcon,
  ServerIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { CippOffCanvas } from "./CippOffCanvas";
import { useSettings } from "../../hooks/use-settings";
import { getCippError } from "../../utils/get-cipp-error";

export const CippTenantSelector = (props) => {
  const { width, allTenants = false, multiple = false, refreshButton, tenantButton } = props;
  //get the current tenant from SearchParams called 'tenantFilter'
  const router = useRouter();
  const settings = useSettings();
  const tenant = router.query.tenantFilter ? router.query.tenantFilter : settings.currentTenant;
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

  // This effect handles updates when the tenant is changed via dropdown selection
  useEffect(() => {
    if (!router.isReady) return;
    if (currentTenant?.value) {
      const query = { ...router.query };
      if (query.tenantFilter !== currentTenant.value) {
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
      settings.handleUpdate({
        currentTenant: currentTenant.value,
      });
      //if we have a tenantfilter, we add the tenantfilter to the title of the tab/page so its "Tenant - original title".
    }
  }, [currentTenant?.value]);

  // This effect handles when the URL parameter changes externally
  useEffect(() => {
    if (!router.isReady || !tenantList.isSuccess) return;

    // Get the current tenant from URL or settings
    const urlTenant = router.query.tenantFilter || settings.currentTenant;

    // Only update if there's a URL tenant and it's different from our current state
    if (urlTenant && (!currentTenant || urlTenant !== currentTenant.value)) {
      // Find the tenant in our list
      const matchingTenant = tenantList.data.find(
        ({ defaultDomainName }) => defaultDomainName === urlTenant
      );

      if (matchingTenant) {
        setSelectedTenant({
          value: urlTenant,
          label: `${matchingTenant.displayName} (${urlTenant})`,
          addedFields: {
            defaultDomainName: matchingTenant.defaultDomainName,
            displayName: matchingTenant.displayName,
            customerId: matchingTenant.customerId,
            initialDomainName: matchingTenant.initialDomainName,
          },
        });
      }
    }
  }, [router.isReady, router.query.tenantFilter, tenantList.isSuccess, settings.currentTenant]);

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
  }, [router.isReady, router.query, settings.currentTenant]);

  useEffect(() => {
    if (tenant && currentTenant?.value && currentTenant?.value !== "AllTenants") {
      tenantDetails.refetch();
    }
  }, [tenant, offcanvasVisible]);

  // We can simplify this effect since we now have the new effect above to handle URL changes
  useEffect(() => {
    if (tenant && tenantList.isSuccess && !currentTenant) {
      const matchingTenant = tenantList.data.find(
        ({ defaultDomainName }) => defaultDomainName === tenant
      );
      setSelectedTenant(
        matchingTenant
          ? {
              value: tenant,
              label: `${matchingTenant.displayName} (${tenant})`,
              addedFields: {
                defaultDomainName: matchingTenant.defaultDomainName,
                displayName: matchingTenant.displayName,
                customerId: matchingTenant.customerId,
                initialDomainName: matchingTenant.initialDomainName,
              },
            }
          : {
              value: null,
              label: "Invalid Tenant",
            }
      );
    }
  }, [tenant, tenantList.isSuccess, currentTenant]);

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
            <Tooltip title="Show Tenant Information">
              <SvgIcon>
                <BuildingOfficeIcon fontSize="inherit" />
              </SvgIcon>
            </Tooltip>
          </IconButton>
        )}
        <CippAutoComplete
          disabled={tenantList.isFetching || tenantList.isError}
          isFetching={tenantList.isFetching}
          disableClearable={true}
          creatable={false}
          multiple={multiple}
          sx={{ width: width ? width : "400px" }}
          placeholder={
            tenantList.isFetching
              ? "Loading Tenants..."
              : tenantList.isError
              ? `Error loading Tenants: ${getCippError(tenantList.error)}`
              : "Select a Tenant"
          }
          value={currentTenant}
          onChange={(nv) => setSelectedTenant(nv)}
          options={
            tenantList.isSuccess && tenantList.data && tenantList.data.length > 0
              ? tenantList.data.map(({ customerId, displayName, defaultDomainName }) => ({
                  value: defaultDomainName,
                  label: `${displayName} (${defaultDomainName})`,
                  addedField: {
                    defaultDomainName: "defaultDomainName",
                    displayName: "displayName",
                    customerId: "customerId",
                  },
                }))
              : []
          }
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
              <SvgIcon>
                <Refresh fontSize="inherit" />
              </SvgIcon>
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
        actions={[
          {
            label: "M365 Admin Portal",
            link: `https://admin.cloud.microsoft/?delegatedOrg=${currentTenant?.addedFields?.initialDomainName}`,
            icon: <GlobeAltIcon />,
          },
          {
            label: "Exchange Portal",
            link: `https://admin.cloud.microsoft/exchange?delegatedOrg=${currentTenant?.addedFields?.initialDomainName}`,
            icon: <Mail />,
          },
          {
            label: "Entra Portal",
            link: `https://entra.microsoft.com/${currentTenant?.value}`,
            icon: <UsersIcon />,
          },
          {
            label: "Teams Portal",
            link: `https://admin.teams.microsoft.com/?delegatedOrg=${currentTenant?.addedFields?.initialDomainName}`,
            icon: <FilePresent />,
          },
          {
            label: "Azure Portal",
            link: `https://portal.azure.com/${currentTenant?.value}`,
            icon: <ServerIcon />,
          },
          {
            label: "Intune Portal",
            link: `https://intune.microsoft.com/${currentTenant?.value}`,
            icon: <Laptop />,
          },
          {
            label: "SharePoint Portal",
            link: `/api/ListSharePointAdminUrl?tenantFilter=${currentTenant?.value}`,
            icon: <Share />,
            external: true,
          },
          {
            label: "Security Portal",
            link: `https://security.microsoft.com/?tid=${currentTenant?.addedFields?.customerId}`,
            icon: <Shield />,
          },
          {
            label: "Compliance Portal",
            link: `https://purview.microsoft.com/?tid=${currentTenant?.addedFields?.customerId}`,
            icon: <ShieldMoon />,
          },
        ]}
      />
    </>
  );
};

CippTenantSelector.propTypes = {
  allTenants: PropTypes.bool,
  multiple: PropTypes.bool,
  refreshButton: PropTypes.bool,
  tenantButton: PropTypes.bool,
};
