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

export const CippTenantSelector = (props) => {
  const { width, allTenants = false, multiple = false, refreshButton, tenantButton } = props;
  //get the current tenant from SearchParams called 'tenantFilter'
  const router = useRouter();
  const settings = useSettings();
  const tenant = router.query.tenantFilter ? router.query.tenantFilter : settings.currentTenant;
  // Fetch tenant list
  const tenantList = ApiGetCall({
    url: "/api/listTenants",
    data: { allTenants: allTenants },
    queryKey: "TenantSelector",
  });

  const [currentTenant, setSelectedTenant] = useState(null);
  const [offcanvasVisible, setOffcanvasVisible] = useState(false);

  // Fetch tenant details based on the current tenant
  const tenantDetails = ApiGetCall({
    url: "/api/listTenantDetails",
    data: { tenantFilter: currentTenant?.value },
    queryKey: `TenantDetails-${currentTenant?.value}`,
    waiting: false,
  });

  useEffect(() => {
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
    }
  }, [currentTenant, router]);

  // Refetch tenant details when tenant or offcanvas visibility changes
  useEffect(() => {
    if (tenant && currentTenant?.value) {
      tenantDetails.refetch();
    }
  }, [tenant, offcanvasVisible]);

  useEffect(() => {
    if (tenant && tenantList.isSuccess) {
      const matchingTenant = tenantList.data.find(
        ({ defaultDomainName }) => defaultDomainName === tenant
      );
      setSelectedTenant(
        matchingTenant
          ? {
              value: tenant,
              label: `${matchingTenant.displayName} (${tenant})`,
            }
          : {
              value: null,
              label: "Invalid Tenant",
            }
      );
    }
  }, [tenant, tenantList.isSuccess]);
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          "& > *": {
            mx: "1px", // 1px margin between the elements
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
              ? "Error loading Tenants"
              : "Select a Tenant"
          }
          value={currentTenant}
          onChange={(nv) => setSelectedTenant(nv)}
          options={
            tenantList.isSuccess && tenantList.data && tenantList.data.length > 0
              ? tenantList.data.map(({ customerId, displayName, defaultDomainName }) => ({
                  value: defaultDomainName,
                  label: `${displayName} (${defaultDomainName})`,
                }))
              : []
          }
          getOptionLabel={(option) => option?.label || ""} // Ensure label is correctly extracted
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
            link: `https://admin.microsoft.com/Partner/BeginClientSession.aspx?CTID=${currentTenant?.value}&CSDEST=o365admincenter`,
            icon: <GlobeAltIcon />,
          },
          {
            label: "Exchange Portal",
            link: `https://admin.microsoft.com/Partner/BeginClientSession.aspx?CTID=${currentTenant?.value}&CSDEST=o365admincenter`,
            icon: <Mail />,
          },
          {
            label: "Entra Portal",
            link: `https://admin.microsoft.com/Partner/BeginClientSession.aspx?CTID=${currentTenant?.value}&CSDEST=o365admincenter`,
            icon: <UsersIcon />,
          },
          {
            label: "Teams Portal",
            link: `https://admin.microsoft.com/Partner/BeginClientSession.aspx?CTID=${currentTenant?.value}&CSDEST=o365admincenter`,
            icon: <FilePresent />,
          },
          {
            label: "Azure Portal",
            link: `https://admin.microsoft.com/Partner/BeginClientSession.aspx?CTID=${currentTenant?.value}&CSDEST=o365admincenter`,
            icon: <ServerIcon />,
          },
          {
            label: "Intune Portal",
            link: `https://admin.microsoft.com/Partner/BeginClientSession.aspx?CTID=${currentTenant?.value}&CSDEST=o365admincenter`,
            icon: <Laptop />,
          },
          {
            label: "Sharepoint Portal",
            link: `https://admin.microsoft.com/Partner/BeginClientSession.aspx?CTID=${currentTenant?.value}&CSDEST=o365admincenter`,
            icon: <Share />,
          },
          {
            label: "Security Portal",
            link: `https://admin.microsoft.com/Partner/BeginClientSession.aspx?CTID=${currentTenant?.value}&CSDEST=o365admincenter`,
            icon: <Shield />,
          },
          {
            label: "Compliance Portal",
            link: `https://admin.microsoft.com/Partner/BeginClientSession.aspx?CTID=${currentTenant?.value}&CSDEST=o365admincenter`,
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
