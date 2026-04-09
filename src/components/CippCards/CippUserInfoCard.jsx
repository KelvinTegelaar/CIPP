import PropTypes from "prop-types";
import {
  Avatar,
  Card,
  CardHeader,
  Divider,
  Skeleton,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { AccountCircle, PhotoCamera, Delete } from "@mui/icons-material";
import { PropertyList } from "../property-list";
import { PropertyListItem } from "../property-list-item";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import { Stack, Grid, Box } from "@mui/system";
import { useState, useRef, useCallback } from "react";
import { ApiPostCall } from "../../api/ApiCall";
import { useLicenseBackfill } from "../../hooks/use-license-backfill";

export const CippUserInfoCard = (props) => {
  const { user, tenant, isFetching = false, ...other } = props;
  const [photoTimestamp, setPhotoTimestamp] = useState(Date.now());
  const [uploadError, setUploadError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const fileInputRef = useRef(null);
  
  // Hook to trigger re-render when license backfill completes
  const { updateTrigger } = useLicenseBackfill();

  // API mutations
  const setPhotoMutation = ApiPostCall({ urlFromData: true });
  const removePhotoMutation = ApiPostCall({ urlFromData: true });

  // Helper function to check if a section has any data
  const hasWorkInfo =
    user?.jobTitle || user?.department || user?.manager?.displayName || user?.companyName;
  const hasAddressInfo =
    user?.streetAddress || user?.postalCode || user?.city || user?.country || user?.officeLocation;
  const hasContactInfo =
    user?.mobilePhone || (user?.businessPhones && user?.businessPhones.length > 0);

  // Handle image URL with timestamp for cache busting
  const imageUrl =
    user?.id && tenant
      ? `/api/ListUserPhoto?TenantFilter=${tenant}&UserId=${user.id}&t=${photoTimestamp}`
      : undefined;

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    setUploadError(null);
    setSuccessMessage(null);

    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please select a valid image file (JPEG or PNG)");
      return;
    }

    // Validate file size (4MB max)
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError(
        `File size exceeds 4MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      );
      return;
    }

    // Convert to base64 and upload
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await setPhotoMutation.mutateAsync({
          url: "/api/ExecSetUserPhoto",
          data: {
            userId: user.id,
            tenantFilter: tenant,
            action: "set",
            photoData: reader.result,
          },
        });
        setPhotoTimestamp(Date.now());
        setSuccessMessage("Profile picture updated successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        setUploadError(error.message || "Failed to upload photo");
      }
    };
    reader.onerror = () => {
      setUploadError("Failed to read file");
    };
    reader.readAsDataURL(file);

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    setUploadError(null);
    setSuccessMessage(null);

    try {
      await removePhotoMutation.mutateAsync({
        url: "/api/ExecSetUserPhoto",
        data: {
          userId: user.id,
          tenantFilter: tenant,
          action: "remove",
        },
      });
      setPhotoTimestamp(Date.now());
      setSuccessMessage("Profile picture removed successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setUploadError(error.message || "Failed to remove photo");
    }
  };

  const isLoading = setPhotoMutation.isPending || removePhotoMutation.isPending;

  return (
    <Card {...other}>
      <CardHeader title="User Details" />
      <Divider />
      <PropertyList>
        <PropertyListItem
          divider
          value={
            isFetching ? (
              <Skeleton variant="text" width={200} />
            ) : (
              <Grid container spacing={3} alignItems="center">
                {/* Avatar section */}
                <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                  <Stack alignItems="center" spacing={1}>
                    <Box position="relative">
                      <Avatar
                        sx={{
                          height: 64,
                          width: 64,
                        }}
                        variant="circular"
                        src={imageUrl}
                      >
                        <AccountCircle sx={{ fontSize: 40 }} />
                      </Avatar>
                      {isLoading && (
                        <CircularProgress
                          size={68}
                          sx={{
                            position: "absolute",
                            top: -2,
                            left: -2,
                            zIndex: 1,
                          }}
                        />
                      )}
                    </Box>
                    {/* Photo management buttons */}
                    <Stack direction="row" spacing={0.5}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleFileSelect}
                      />
                      <Tooltip title="Change Photo">
                        <IconButton
                          size="small"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isLoading}
                          sx={{
                            backgroundColor: "action.hover",
                            "&:hover": { backgroundColor: "action.selected" },
                          }}
                        >
                          <PhotoCamera fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove Photo">
                        <IconButton
                          size="small"
                          onClick={handleRemovePhoto}
                          disabled={isLoading}
                          sx={{
                            backgroundColor: "action.hover",
                            "&:hover": {
                              backgroundColor: "error.light",
                              color: "error.contrastText",
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    {/* Status messages */}
                    {successMessage && (
                      <Typography variant="caption" color="success.main" textAlign="center">
                        {successMessage}
                      </Typography>
                    )}
                    {uploadError && (
                      <Typography variant="caption" color="error" textAlign="center">
                        {uploadError}
                      </Typography>
                    )}
                  </Stack>
                </Grid>

                {/* Status information section */}
                <Grid size={{ xs: 12, sm: 8, md: 9 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="inherit" color="text.primary" gutterBottom>
                        Account Enabled:
                      </Typography>
                      <Typography variant="inherit">
                        {getCippFormatting(user?.accountEnabled, "accountEnabled")}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="inherit" color="text.primary" gutterBottom>
                        Synced from AD:
                      </Typography>
                      <Typography variant="inherit">
                        {getCippFormatting(user?.onPremisesSyncEnabled, "onPremisesSyncEnabled")}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )
          }
        />

        {/* Basic Identity Information */}
        <PropertyListItem
          divider
          value={
            isFetching ? (
              <Skeleton variant="text" width={200} />
            ) : (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 7.5 }}>
                  <Typography variant="inherit" color="text.primary" gutterBottom>
                    Display Name:
                  </Typography>
                  <Typography variant="inherit">
                    {getCippFormatting(user?.displayName, "displayName") || "N/A"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="inherit" color="text.primary" gutterBottom>
                    Email Address:
                  </Typography>
                  <Typography variant="inherit">
                    {getCippFormatting(user?.proxyAddresses, "proxyAddresses") || "N/A"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="inherit" color="text.primary" gutterBottom>
                    User Principal Name:
                  </Typography>
                  <Typography variant="inherit">
                    {getCippFormatting(user?.userPrincipalName, "userPrincipalName") || "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            )
          }
        />

        {/* Licenses */}
        <PropertyListItem
          divider
          label="Licenses"
          key={`licenses-${updateTrigger}`}
          value={
            isFetching ? (
              <Skeleton variant="text" width={180} />
            ) : !user?.assignedLicenses || user?.assignedLicenses.length === 0 ? (
              <Alert severity="info" sx={{ py: 0, px: 1 }}>
                No licenses assigned to this user
              </Alert>
            ) : (
              getCippFormatting(user?.assignedLicenses, "assignedLicenses")
            )
          }
        />

        {/* Work Information Section */}
        <PropertyListItem
          divider
          label="Work Information"
          value={
            isFetching ? (
              <Skeleton variant="text" width={200} />
            ) : !hasWorkInfo ? (
              <Typography variant="inherit" color="text.secondary" sx={{ fontStyle: "italic" }}>
                No work information available
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {user?.jobTitle && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="inherit" color="text.primary" gutterBottom>
                      Job Title:
                    </Typography>
                    <Typography variant="inherit">{user.jobTitle}</Typography>
                  </Grid>
                )}
                {user?.companyName && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="inherit" color="text.primary" gutterBottom>
                      Company Name:
                    </Typography>
                    <Typography variant="inherit">{user.companyName}</Typography>
                  </Grid>
                )}
                {user?.department && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="inherit" color="text.primary" gutterBottom>
                      Department:
                    </Typography>
                    <Typography variant="inherit">{user.department}</Typography>
                  </Grid>
                )}
                {user?.manager?.displayName && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="inherit" color="text.primary" gutterBottom>
                      Manager:
                    </Typography>
                    <Typography variant="inherit">{user.manager.displayName}</Typography>
                  </Grid>
                )}
              </Grid>
            )
          }
        />

        {/* Contact Information Section */}
        <PropertyListItem
          divider
          label="Contact Information"
          value={
            isFetching ? (
              <Skeleton variant="text" width={200} />
            ) : !hasContactInfo ? (
              <Typography variant="inherit" color="text.secondary" sx={{ fontStyle: "italic" }}>
                No contact information available
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {user?.mobilePhone && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="inherit" color="text.primary" gutterBottom>
                      Mobile Phone:
                    </Typography>
                    <Typography variant="inherit">{user.mobilePhone}</Typography>
                  </Grid>
                )}
                {user?.businessPhones && user.businessPhones.length > 0 && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="inherit" color="text.primary" gutterBottom>
                      Business Phones:
                    </Typography>
                    <Typography variant="inherit">{user.businessPhones.join(", ")}</Typography>
                  </Grid>
                )}
              </Grid>
            )
          }
        />

        {/* Address Information Section */}
        <PropertyListItem
          label="Address Information"
          value={
            isFetching ? (
              <Skeleton variant="text" width={200} />
            ) : !hasAddressInfo ? (
              <Typography variant="inherit" color="text.secondary" sx={{ fontStyle: "italic" }}>
                No address information available
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {user?.streetAddress && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="inherit" color="text.primary" gutterBottom>
                      Street Address:
                    </Typography>
                    <Typography variant="inherit">{user.streetAddress}</Typography>
                  </Grid>
                )}
                {user?.city && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="inherit" color="text.primary" gutterBottom>
                      City:
                    </Typography>
                    <Typography variant="inherit">{user.city}</Typography>
                  </Grid>
                )}
                {user?.postalCode && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="inherit" color="text.primary" gutterBottom>
                      Postal Code:
                    </Typography>
                    <Typography variant="inherit">{user.postalCode}</Typography>
                  </Grid>
                )}
                {user?.country && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="inherit" color="text.primary" gutterBottom>
                      Country:
                    </Typography>
                    <Typography variant="inherit">{user.country}</Typography>
                  </Grid>
                )}
                {user?.officeLocation && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="inherit" color="text.primary" gutterBottom>
                      Office Location:
                    </Typography>
                    <Typography variant="inherit">{user.officeLocation}</Typography>
                  </Grid>
                )}
              </Grid>
            )
          }
        />
      </PropertyList>
    </Card>
  );
};

CippUserInfoCard.propTypes = {
  user: PropTypes.object,
  tenant: PropTypes.string,
  isFetching: PropTypes.bool,
};
