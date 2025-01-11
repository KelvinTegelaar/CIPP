import PropTypes from "prop-types";
import { Avatar, Card, CardHeader, Divider, Skeleton, Stack } from "@mui/material";
import { PropertyList } from "/src/components/property-list";
import { PropertyListItem } from "/src/components/property-list-item";
import { getCippFormatting } from "../../utils/get-cipp-formatting";

export const CippUserInfoCard = (props) => {
  const { user, tenant, isFetching = false, ...other } = props;

  return (
    <Card {...other}>
      <CardHeader title="User Details" />
      <Divider />
      <Stack
        alignItems="center"
        direction="row"
        spacing={1}
        sx={{
          px: 3,
          py: 1.5,
        }}
      >
        {isFetching ? (
          <Skeleton variant="circular" width={64} height={64} />
        ) : (
          <Avatar
            sx={{
              height: 64,
              width: 64,
            }}
            variant="circular"
            src={`/api/ListUserPhoto?TenantFilter=${tenant}&UserId=${user?.id}`}
          >
            {user?.displayName?.[0] + user?.surname?.[0] || ""}
          </Avatar>
        )}
      </Stack>
      <PropertyListItem
        divider
        label="Account Enabled"
        value={
          isFetching ? (
            <Skeleton variant="text" width={60} />
          ) : (
            getCippFormatting(user?.accountEnabled, "accountEnabled")
          )
        }
      />
      <PropertyListItem
        divider
        label="Synced from Active Directory"
        value={
          isFetching ? (
            <Skeleton variant="text" width={60} />
          ) : (
            getCippFormatting(user?.onPremisesSyncEnabled, "onPremisesSyncEnabled")
          )
        }
      />
      <PropertyList>
        <PropertyListItem
          divider
          label="Display Name"
          value={
            isFetching ? (
              <Skeleton variant="text" width={120} />
            ) : (
              getCippFormatting(user?.displayName, "displayName")
            )
          }
        />
        <PropertyListItem
          divider
          label="User Principal Name"
          value={
            isFetching ? (
              <Skeleton variant="text" width={180} />
            ) : (
              getCippFormatting(user?.userPrincipalName, "userPrincipalName")
            )
          }
        />
        <PropertyListItem
          divider
          label="Licenses"
          value={
            isFetching ? (
              <Skeleton variant="text" width={180} />
            ) : (
              getCippFormatting(user?.assignedLicenses, "assignedLicenses")
            )
          }
        />
        <PropertyListItem
          divider
          label="Email Address"
          value={
            isFetching ? (
              <Skeleton variant="text" width={180} />
            ) : (
              getCippFormatting(user?.proxyAddresses, "proxyAddresses")
            )
          }
        />
        <PropertyListItem
          label="Job Title"
          value={isFetching ? <Skeleton variant="text" width={100} /> : user?.jobTitle || "N/A"}
        />
        <PropertyListItem
          divider
          label="Department"
          value={isFetching ? <Skeleton variant="text" width={100} /> : user?.department || "N/A"}
        />
        <PropertyListItem
          label="Address"
          value={
            isFetching ? <Skeleton variant="text" width={100} /> : user?.streetAddress || "N/A"
          }
        />
        <PropertyListItem
          label="Postal code"
          value={isFetching ? <Skeleton variant="text" width={100} /> : user?.postalCode || "N/A"}
        />
        <PropertyListItem
          divider
          label="Office Location"
          value={
            isFetching ? <Skeleton variant="text" width={100} /> : user?.officeLocation || "N/A"
          }
        />
        <PropertyListItem
          divider
          label="Mobile Phone"
          value={isFetching ? <Skeleton variant="text" width={120} /> : user?.mobilePhone || "N/A"}
        />
        <PropertyListItem
          divider
          label="Business Phones"
          value={
            isFetching ? (
              <Skeleton variant="text" width={120} />
            ) : (
              user?.businessPhones?.join(", ") || "N/A"
            )
          }
        />
      </PropertyList>
    </Card>
  );
};

CippUserInfoCard.propTypes = {
  user: PropTypes.object,
  isFetching: PropTypes.bool,
};
