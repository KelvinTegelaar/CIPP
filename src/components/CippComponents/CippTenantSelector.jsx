import PropTypes from "prop-types";
import { CippAutoComplete } from "../CippComponents/CippAutocomplete";
import { ApiGetCall } from "../../api/ApiCall";
import { IconButton, SvgIcon, Tooltip } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

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
          aria-label="refresh"
          color="inherit"
          size="small"
          onClick={() => {
            tenantList.refetch();
          }}
        >
          <Tooltip title="Refresh tenant list">
            <SvgIcon>
              <BuildingOfficeIcon fontSize="inherit" />
            </SvgIcon>
          </Tooltip>
        </IconButton>
      )}
      <CippAutoComplete
        isFetching={tenantList.isFetching}
        disableClearable={true}
        creatable={false}
        multiple={multiple}
        sx={{ width: 400 }}
        defaultValue={"Select a Tenant"}
        onChange={(e, nv) => setSelectedTenant(nv)}
        options={
          tenantList.isSuccess &&
          tenantList.data.map(({ customerId, displayName, defaultDomainName }) => ({
            value: customerId,
            label: `${displayName} (${defaultDomainName})`,
          }))
        }
      />{" "}
      {refreshButton && (
        <IconButton
          aria-label="refresh"
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
    </>
  );
};

CippTenantSelector.propTypes = {
  allTenants: PropTypes.bool,
  multiple: PropTypes.bool,
};
