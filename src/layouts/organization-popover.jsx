import { useCallback } from "react";
import PropTypes from "prop-types";
import { usePopover } from "../hooks/use-popover";
import { CippAutoComplete } from "../components/CippComponents/CippAutocomplete";

export const OrganizationPopover = (props) => {
  const { onOrganizationSwitch, organizationId, organizations = [] } = props;
  const popover = usePopover();

  const handleOrganizationChange = useCallback(
    (organizationId) => {
      popover.handleClose();
      onOrganizationSwitch?.(organizationId);
    },
    [popover, onOrganizationSwitch]
  );

  // NOTE: Ensure an organization is found, otherwise some components will fail.
  const organization = organizations.find((organization) => organization.id === organizationId);

  return (
    <>
      <CippAutoComplete
        disableClearable={true}
        creatable={false}
        multiple={false}
        sx={{ width: 400 }}
        defaultValue={organization}
        onChange={handleOrganizationChange}
        options={organizations}
      />
    </>
  );
};

OrganizationPopover.propTypes = {
  onOrganizationSwitch: PropTypes.func,
  organizationId: PropTypes.string.isRequired,
  organizations: PropTypes.array,
};
