import { Button, Grid, Link, List, ListItem, Skeleton, SvgIcon, Typography } from "@mui/material";
import { CheckCircle, Description } from "@mui/icons-material";
import { CippPropertyList } from "/src/components/CippComponents/CippPropertyList";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { CippOffCanvas } from "../CippComponents/CippOffCanvas";
import { useState } from "react";
import { CippPropertyListCard } from "../CippCards/CippPropertyListCard";

export const CippPermissionResults = (props) => {
  const { executeCheck } = props;
  const results = executeCheck.data;
  const [offcanvasVisible, setOffcanvasVisible] = useState(false);

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
        <>
          <Grid
            container
            spacing={2}
            sx={{ mt: 2 }}
            display="flex"
            alignItems={"center"}
            alignContent={"center"}
          >
            <Grid item xs={12} md={8}>
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
                      There are new permissions to apply.
                    </Typography>
                  </ListItem>
                )}
              </List>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                onClick={() => {
                  setOffcanvasVisible(true);
                }}
                variant="contained"
                color="primary"
                size="small"
              >
                <SvgIcon fontSize="small" style={{ marginRight: 4 }}>
                  <Description />
                </SvgIcon>
                Details
              </Button>
            </Grid>
          </Grid>
          <CippOffCanvas
            
            title="Permission Details"
            visible={offcanvasVisible}
            onClose={() => {
              setOffcanvasVisible(false);
            }}
          >
            {results?.Results?.Links.length > 0 && (
              <CippPropertyListCard
                title="Documentation"
                showDivider={false}
                cardSx={{ p: 0, m: 0 }}
                propertyItems={results?.Results?.Links.map((link) => {
                  return {
                    value: (
                      <Link href={link.Href} target="_blank">
                        {link.Href}
                      </Link>
                    ),
                    label: link.Text,
                  };
                })}
              />
            )}

            {results?.Results?.MissingPermissions.length > 0 && (
              <>
                <CippPropertyListCard
                  title="Missing Permissions"
                  copyItems={true}
                  propertyItems={results?.Results?.MissingPermissions.map((permission) => {
                    return {
                      value: permission,
                      label: "Microsoft Graph",
                    };
                  })}
                  showDivider={false}
                  cardSx={{ p: 0, m: 0 }}
                />
              </>
            )}
          </CippOffCanvas>
        </>
      )}
    </>
  );
};
