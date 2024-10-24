import { Link, List, ListItem, Skeleton, SvgIcon, Typography } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { CippPropertyList } from "/src/components/CippComponents/CippPropertyList";
import { XMarkIcon } from "@heroicons/react/24/outline";

export const CippPermissionResults = (props) => {
  const { executeCheck } = props;
  const results = executeCheck.data;

  const accessTokenHeaders = ["Name", "UserPrincipalName", "IPAddress"];

  var propertyItems = [];
  accessTokenHeaders.forEach((header) => {
    propertyItems.push({
      label: header,
      value: results?.Results?.AccessTokenDetails?.[header],
    });
  });
  propertyItems.push({
    label: "App Registration",
    value: (
      <Link
        href={`https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/Overview/appId/${results?.Results?.AccessTokenDetails?.AppId}`}
        target="_blank"
      >
        {results?.Results?.AccessTokenDetails?.AppName}
      </Link>
    ),
  });

  return (
    <>
      {propertyItems.length > 0 && (
        <CippPropertyList
          isFetching={executeCheck.isFetching}
          propertyItems={propertyItems}
          layout="double"
          showDivider={false}
        />
      )}

      {executeCheck.isFetching ? (
        <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 1, ml: 3, mr: 1 }} />
      ) : (
        <List>
          {results?.Results?.Messages.map((message, index) => (
            <ListItem key={index} sx={{ py: 0 }}>
              <Typography variant="body2">
                <SvgIcon fontSize="sm" style={{ marginRight: 4 }}>
                  <CheckCircle />
                </SvgIcon>
                {message}
              </Typography>
            </ListItem>
          ))}
          {results?.Results?.ErrorMessages.map((error, index) => (
            <ListItem key={index} sx={{ py: 0 }}>
              <Typography variant="body2">
                <SvgIcon fontSize="sm" style={{ marginRight: 4 }}>
                  <CheckCircle />
                </SvgIcon>
                {error}
              </Typography>
            </ListItem>
          ))}
          {results?.Results?.MissingPermissions && (
            <ListItem sx={{ py: 0 }}>
              <Typography variant="body2">
                <SvgIcon fontSize="sm" style={{ marginRight: 4 }}>
                  <XMarkIcon />
                </SvgIcon>
                Your app registration is missing permissions.
              </Typography>
            </ListItem>
          )}
        </List>
      )}
    </>
  );
};
