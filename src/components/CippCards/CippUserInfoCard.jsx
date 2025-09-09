import PropTypes from "prop-types";
import { Avatar, Card, CardHeader, Divider, Skeleton, Typography, Alert } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { PropertyList } from "/src/components/property-list";
import { PropertyListItem } from "/src/components/property-list-item";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import { Stack, Grid } from "@mui/system";

export const CippUserInfoCard = (props) => {
  const { user, tenant, isFetching = false, ...other } = props;

  // Helper function to check if a section has any data
  const hasWorkInfo = user?.jobTitle || user?.department || user?.manager?.displayName || user?.companyName;
  const hasAddressInfo =
    user?.streetAddress || user?.postalCode || user?.city || user?.country || user?.officeLocation;
  const hasContactInfo =
    user?.mobilePhone || (user?.businessPhones && user?.businessPhones.length > 0);

  // Handle image URL - only set if user and tenant exist, otherwise let Avatar fall back to children
  const imageUrl =
    user?.id && tenant ? `/api/ListUserPhoto?TenantFilter=${tenant}&UserId=${user.id}` : undefined;

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
                  <Stack alignItems="center">
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
