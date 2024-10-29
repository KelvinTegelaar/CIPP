import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  Alert,
  Drawer,
  Box,
} from "@mui/material";
import {
  Add,
  Delete,
  Save,
  WarningAmber,
  RotateLeft,
  Download,
  Upload,
  ExclamationTriangle,
} from "@mui/icons-material";
import { WrenchIcon } from "@heroicons/react/24/outline";
import CippFormSection from "/src/components/CippFormSection";
import CippDataTable from "/src/components/CippDataTable";
import CippFormComponent from "/src/components/CippFormComponent";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { ApiGetCall } from "/src/api/ApiCall";

const ApiPermissionRow = ({
  servicePrincipal,
  formControl,
  onAddPermission,
  onRemovePermission,
}) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="autoComplete"
          name="servicePrincipal"
          label="Service Principal"
          formControl={formControl}
          options={servicePrincipal.options} // Assuming options are available for autocomplete
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Tooltip title="Add Permission">
          <IconButton color="primary" onClick={() => onAddPermission(servicePrincipal.appId)}>
            <Add />
          </IconButton>
        </Tooltip>
        <Tooltip title="Remove Permission">
          <IconButton color="error" onClick={() => onRemovePermission(servicePrincipal.appId)}>
            <Delete />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  );
};

const CippAppPermissionBuilder = ({
  onSubmit,
  currentPermissions,
  isSubmitting,
  colSize,
  removePermissionConfirm,
  appDisplayName,
}) => {
  const [manifestVisible, setManifestVisible] = useState(false);
  const [permissionsData, setPermissionsData] = useState(currentPermissions);

  const servicePrincipalsData = ApiGetCall({
    url: "/api/ListServicePrincipals",
    queryKey: "servicePrincipals",
  });

  // Handler to add permission to a service principal in the state
  const handleAddPermission = (appId) => {
    setPermissionsData((prevPermissions) => {
      const updatedPermissions = { ...prevPermissions };
      if (!updatedPermissions[appId]) {
        updatedPermissions[appId] = { delegatedPermissions: [] };
      }
      updatedPermissions[appId].delegatedPermissions.push({
        name: "New Permission",
        description: "Description of new permission",
      });
      return updatedPermissions;
    });
  };

  // Handler to remove permission from a service principal in the state
  const handleRemovePermission = (appId, permissionId) => {
    setPermissionsData((prevPermissions) => {
      const updatedPermissions = { ...prevPermissions };
      if (updatedPermissions[appId]) {
        updatedPermissions[appId].delegatedPermissions = updatedPermissions[
          appId
        ].delegatedPermissions.filter((permission) => permission.id !== permissionId);
      }
      return updatedPermissions;
    });
  };

  return (
    <CippFormSection
      queryKey="AppPermissions"
      postUrl="/api/UpdatePermissions"
      formControl={{ defaultValues: permissionsData }}
      resetForm={true}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={colSize}>
          <Accordion>
            <AccordionSummary expandIcon={<Add />}>
              <Typography>Service Principal Permissions</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {servicePrincipalsData?.data?.map((servicePrincipal) => (
                <ApiPermissionRow
                  key={servicePrincipal.appId}
                  servicePrincipal={servicePrincipal}
                  formControl={{ control: "yourControlHere" }}
                  onAddPermission={handleAddPermission}
                  onRemovePermission={handleRemovePermission}
                />
              ))}
            </AccordionDetails>
          </Accordion>
        </Grid>

        <Grid item xs={12}>
          <Alert severity="warning" icon={<ExclamationTriangle />}>
            <Typography variant="body2">
              <b>New Permissions Available</b> — You have new permissions to add.
            </Typography>
          </Alert>
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<Save />}
            disabled={isSubmitting}
          >
            Save
          </Button>
        </Grid>
      </Grid>

      {/* Drawer for Manifest Import */}
      <Drawer anchor="right" open={manifestVisible} onClose={() => setManifestVisible(false)}>
        <Box sx={{ width: 400, p: 2 }}>
          <Typography variant="h6">Import Manifest</Typography>
          <Typography variant="body2" gutterBottom>
            Import a JSON application manifest to set permissions. This will overwrite any existing
            permissions.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => console.log("Import Manifest")}
            sx={{ mt: 2 }}
          >
            Import
          </Button>
        </Box>
      </Drawer>
    </CippFormSection>
  );
};

CippAppPermissionBuilder.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  currentPermissions: PropTypes.object,
  isSubmitting: PropTypes.bool,
  colSize: PropTypes.number,
  removePermissionConfirm: PropTypes.func,
  appDisplayName: PropTypes.string,
};

export default CippAppPermissionBuilder;
