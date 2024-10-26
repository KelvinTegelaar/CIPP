import { Button, Grid, Link, List, ListItem, Skeleton, SvgIcon, Typography } from "@mui/material";
import { CheckCircle, Description } from "@mui/icons-material";
import { CippPropertyList } from "/src/components/CippComponents/CippPropertyList";
import { WrenchIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CippOffCanvas } from "../CippComponents/CippOffCanvas";
import { useState } from "react";
import { CippPropertyListCard } from "../CippCards/CippPropertyListCard";
import { CippDataTable } from "/src/components/CippTable/CippDataTable";
import { ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";

export const CippPermissionResults = (props) => {
  const { executeCheck, setSkipCache, offcanvasVisible, setOffcanvasVisible } = props;
  const results = executeCheck.data;

  const accessTokenHeaders = ["Name", "UserPrincipalName", "IPAddress"];

  const addMissingPermissions = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["ExecAccessChecks-Permissions"],
  });

  const handleAddMissingPermissions = (data) => {
    setSkipCache(true);
    addMissingPermissions.mutate({
      url: "/api/ExecPermissionRepair",
      data: {},
      queryKey: "RepairPermissions",
    });
  };

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
                    <XMarkIcon />
                  </SvgIcon>
                  {error}
                </Typography>
              </ListItem>
            ))}
            {results?.Results?.MissingPermissions.length > 0 && (
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

          <CippOffCanvas
            size="lg"
            title="Permission Details"
            visible={offcanvasVisible}
            onClose={() => {
              setOffcanvasVisible(false);
            }}
            extendedInfo={[]}
          >
            <Typography variant="h4" sx={{ mx: 3 }}>
              Permission Details
            </Typography>
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
            <CippApiResults apiObject={addMissingPermissions} />
            {results?.Results?.MissingPermissions.length > 0 && (
              <>
                <CippDataTable
                  title="Missing Permissions"
                  isFetching={executeCheck.isFetching}
                  refreshFunction={executeCheck}
                  cardButton={
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={handleAddMissingPermissions}
                      startIcon={
                        <SvgIcon fontSize="sm">
                          <WrenchIcon />
                        </SvgIcon>
                      }
                    >
                      Repair Permissions
                    </Button>
                  }
                  data={results?.Results?.MissingPermissions}
                  simpleColumns={["Application", "Type", "Permission"]}
                />
              </>
            )}

            {results?.Results?.AccessTokenDetails?.Scope.length > 0 && (
              <>
                <CippDataTable
                  title="Current Delegated Scopes"
                  isFetching={executeCheck.isFetching}
                  refreshFunction={executeCheck}
                  data={results?.Results?.AccessTokenDetails?.Scope.map((scope) => {
                    return {
                      Scope: scope,
                    };
                  })}
                  simpleColumns={["Scope"]}
                />
              </>
            )}
          </CippOffCanvas>
        </>
      )}
    </>
  );
};
