import { Alert, Button, Link, List, ListItem, Skeleton, SvgIcon, Typography } from "@mui/material";
import { Cancel, CheckCircle } from "@mui/icons-material";
import { CippPropertyList } from "../CippComponents/CippPropertyList";
import { WrenchIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CippOffCanvas } from "../CippComponents/CippOffCanvas";
import { CippPropertyListCard } from "../CippCards/CippPropertyListCard";
import { CippDataTable } from "../CippTable/CippDataTable";
import { ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { useEffect, useState } from "react";

export const CippPermissionResults = (props) => {
  const {
    executeCheck,
    setSkipCache,
    offcanvasVisible,
    setOffcanvasVisible,
    importReport,
    setCardIcon,
  } = props;
  const [results, setResults] = useState({});

  useEffect(() => {
    if (importReport) {
      setResults(importReport);
    } else {
      setResults(executeCheck?.data);
    }
  }, [executeCheck, importReport]);

  useEffect(() => {
    if (
      results?.Results?.MissingPermissions?.length > 0 ||
      results?.Results?.ErrorMessages?.length > 0
    ) {
      setCardIcon(<Cancel />);
    } else {
      setCardIcon(<CheckCircle />);
    }
  }, [results]);

  const accessTokenHeaders = ["Name", "UserPrincipalName", "IPAddress"];

  const addMissingPermissions = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["ExecAccessChecks-Permissions"],
  });

  const startCPVRefresh = ApiPostCall({
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

  const handleStartCPVRefresh = () => {
    startCPVRefresh.mutate({
      url: "/api/ExecCPVRefresh",
      data: {},
      queryKey: "CPVRefresh",
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
          isFetching={!importReport && executeCheck?.isFetching}
          propertyItems={propertyItems}
          layout="double"
          showDivider={false}
        />
      )}
      {!importReport && executeCheck?.isFetching ? (
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1, ml: 3, mr: 1 }} />
      ) : !importReport && executeCheck?.isError ? (
        <Alert severity="error" sx={{ ml: 3, mr: 1 }}>
          Failed to load permission check results. Please try refreshing or contact support if the
          issue persists.
        </Alert>
      ) : (
        <>
          <List>
            {results?.Results?.Messages?.map((message, index) => (
              <ListItem key={index} sx={{ py: 0 }}>
                <Typography variant="body2">
                  <SvgIcon fontSize="sm" style={{ marginRight: 4 }}>
                    <CheckCircle />
                  </SvgIcon>
                  {message}
                </Typography>
              </ListItem>
            ))}
            {results?.Results?.ErrorMessages?.map((error, index) => (
              <ListItem key={index} sx={{ py: 0 }}>
                <Typography variant="body2">
                  <SvgIcon fontSize="sm" style={{ marginRight: 4 }}>
                    <XMarkIcon />
                  </SvgIcon>
                  {error}
                </Typography>
              </ListItem>
            ))}
            {results?.Results?.MissingPermissions?.length > 0 && (
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
            {results?.Results?.Links?.length > 0 && (
              <CippPropertyListCard
                title="Documentation"
                showDivider={false}
                cardSx={{ p: 0, m: 0 }}
                propertyItems={results?.Results?.Links?.map((link) => {
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
            {results?.Results?.MissingPermissions?.length > 0 && (
              <>
                <CippDataTable
                  title="Missing Permissions"
                  isFetching={!importReport && executeCheck?.isFetching}
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
            <CippApiResults apiObject={startCPVRefresh} />
            {results?.Results?.CPVRefreshList?.length > 0 && (
              <CippDataTable
                title="Tenants needing CPV Refresh"
                cardButton={
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleStartCPVRefresh}
                    startIcon={
                      <SvgIcon fontSize="sm">
                        <WrenchIcon />
                      </SvgIcon>
                    }
                  >
                    Refresh CPV
                  </Button>
                }
                isFetching={!importReport && executeCheck?.isFetching}
                refreshFunction={executeCheck}
                data={results?.Results?.CPVRefreshList}
                simpleColumns={["DisplayName", "DefaultDomainName", "LastRefresh"]}
              />
            )}

            {results?.Results?.AccessTokenDetails?.Scope?.length > 0 && (
              <>
                <CippDataTable
                  title="Current Delegated Scopes"
                  isFetching={!importReport && executeCheck?.isFetching}
                  refreshFunction={executeCheck}
                  data={results?.Results?.AccessTokenDetails?.Scope?.map((scope) => {
                    return {
                      Scope: scope,
                    };
                  })}
                  simpleColumns={["Scope"]}
                />
              </>
            )}
            {results?.Results?.ApplicationTokenDetails?.Roles?.length > 0 && (
              <>
                <CippDataTable
                  title="Current Application Roles"
                  isFetching={!importReport && executeCheck?.isFetching}
                  refreshFunction={executeCheck}
                  data={results?.Results?.ApplicationTokenDetails?.Roles?.map((role) => {
                    return {
                      Role: role,
                    };
                  })}
                  simpleColumns={["Role"]}
                />
              </>
            )}
          </CippOffCanvas>
        </>
      )}
    </>
  );
};
