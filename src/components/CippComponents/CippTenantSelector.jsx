import PropTypes from "prop-types";
import { CippAutoComplete } from "../CippComponents/CippAutocomplete";
import { ApiGetCall } from "../../api/ApiCall";
import { IconButton, SvgIcon, Tooltip } from "@mui/material";
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

export const CippTenantSelector = (props) => {
  const { allTenants = false, multiple = false, refreshButton, tenantButton } = props;
  const tenantList = ApiGetCall({
    url: "/api/listTenants",
    data: { allTenants: allTenants },
    queryKey: "TenantSelector",
  });

  const router = useRouter();
  const { tenant } = router.query; // Destructure to get the slug
  const [currentTenant, setSelectedTenant] = useState({ value: tenant });
  const [offcanvasVisble, setOffcanvasVisible] = useState(false);

  const tenantDetails = ApiGetCall({
    url: "/api/listTenantDetails",
    data: { tenantFilter: currentTenant.value },
    queryKey: `TenantDetails-${currentTenant.value}`,
    waiting: false,
  });

  useEffect(() => {
    if (tenant) {
      tenantDetails.refetch();
    }
  }, [offcanvasVisble]);

  useEffect(() => {
    if (tenant) {
      if (currentTenant.value && tenant !== currentTenant.value) {
        const newSlug = currentTenant.value;
        const newPath = router.asPath.replace(`${tenant}`, `${newSlug}`);
        router.replace(newPath, undefined, { shallow: true }); // Update the URL with shallow routing
      }
    }
  }, [tenant, router, currentTenant]);

  return (
    <>
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
        sx={{ width: 400 }}
        defaultValue={tenantList.isError ? "Failed to retrieve tenants" : "Select a Tenant"}
        onChange={(e, nv) => setSelectedTenant(nv)}
        options={
          tenantList.isSuccess &&
          tenantList.data.map(({ customerId, displayName, defaultDomainName }) => ({
            value: customerId,
            label: `${displayName} (${defaultDomainName})`,
          }))
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
      <CippOffCanvas
        isFetching={tenantDetails.isFetching}
        visible={offcanvasVisble}
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
            link: `https://admin.microsoft.com/Partner/BeginClientSession.aspx?CTID=${currentTenant.value}&CSDEST=o365admincenter`,
            icon: <GlobeAltIcon />,
          },
          {
            label: "Exchange Portal",
            link: `https://admin.microsoft.com/Partner/BeginClientSession.aspx?CTID=${currentTenant.value}&CSDEST=o365admincenter`,
            icon: <Mail />,
          },
          {
            label: "Entra Portal",
            link: `https://admin.microsoft.com/Partner/BeginClientSession.aspx?CTID=${currentTenant.value}&CSDEST=o365admincenter`,
            icon: <UsersIcon />,
          },
          {
            label: "Teams Portal",
            link: `https://admin.microsoft.com/Partner/BeginClientSession.aspx?CTID=${currentTenant.value}&CSDEST=o365admincenter`,
            icon: <FilePresent />,
          },
          {
            label: "Azure Portal",
            link: `https://admin.microsoft.com/Partner/BeginClientSession.aspx?CTID=${currentTenant.value}&CSDEST=o365admincenter`,
            icon: <ServerIcon />,
          },
          {
            label: "Intune Portal",
            link: `https://admin.microsoft.com/Partner/BeginClientSession.aspx?CTID=${currentTenant.value}&CSDEST=o365admincenter`,
            icon: <Laptop />,
          },
          {
            label: "Sharepoint Portal",
            link: `https://admin.microsoft.com/Partner/BeginClientSession.aspx?CTID=${currentTenant.value}&CSDEST=o365admincenter`,
            icon: <Share />,
          },
          {
            label: "Security Portal",
            link: `https://admin.microsoft.com/Partner/BeginClientSession.aspx?CTID=${currentTenant.value}&CSDEST=o365admincenter`,
            icon: <Shield />,
          },
          {
            label: "Compliance Portal",
            link: `https://admin.microsoft.com/Partner/BeginClientSession.aspx?CTID=${currentTenant.value}&CSDEST=o365admincenter`,
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
};
