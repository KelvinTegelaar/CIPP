import PropTypes from "prop-types";
import { CippAutoComplete } from "../CippComponents/CippAutocomplete";
import { ApiGetCall } from "../../api/ApiCall";
import { IconButton, SvgIcon, Tooltip } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";

export const CippTenantSelector = (props) => {
  const { allTenants = false, multiple = false, refreshButton, tenantButton } = props;
  const tenantList = ApiGetCall({
    url: "api/listTenants",
    data: { allTenants: allTenants },
    queryKey: "TenantSelector",
  });
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
        onChange={(e, nv) => console.log(nv)}
        options={tenantList.data.map(({ customerId, displayName, defaultDomainName }) => ({
          value: customerId,
          label: `${displayName} (${defaultDomainName})`,
        }))}
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
