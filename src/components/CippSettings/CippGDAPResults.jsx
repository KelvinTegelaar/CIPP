import { Alert, Button, List, ListItem, Skeleton, SvgIcon, Typography } from "@mui/material";
import { CippIcons } from "../../utils/icon-registry";
import { CippPropertyList } from "../CippComponents/CippPropertyList";
import { CippOffCanvas } from "../CippComponents/CippOffCanvas";
import { CippDataTable } from "../CippTable/CippDataTable";
import { ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { useEffect, useState } from "react";

export const CippGDAPResults = (props) => {
  const { executeCheck, offcanvasVisible, setOffcanvasVisible, importReport, setCardIcon } = props;
  const [results, setResults] = useState({});

  const repairRoleMappings = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["ExecAccessChecks-GDAP"],
  });

  const handleRepairRoleMappings = () => {
    repairRoleMappings.mutate({
      url: "/api/ExecGDAPRepairRoleMappings",
      data: {},
      queryKey: "RepairGDAPRoleMappings",
    });
  };

  const hasRoleMappingIssues = results?.Results?.RoleMappingResults?.some(
    (item) => item?.Status === "Stale" || item?.Status === "Missing",
  );

  useEffect(() => {
    if (importReport) {
      setResults(importReport);
    } else {
      setResults(executeCheck?.data);
    }
  }, [executeCheck, importReport]);

  useEffect(() => {
    if (
      results?.Results?.GDAPIssues?.length > 0 ||
      results?.Results?.MissingGroups?.length > 0 ||
      hasRoleMappingIssues
    ) {
      setCardIcon(<CippIcons.Cancel />);
    } else {
      setCardIcon(<CippIcons.CheckCircle />);
    }
  }, [results]);

  const GdapIssueValue = ({ results, type, match }) => {
    var issues = [];
    if (type) issues = results?.Results?.GDAPIssues?.filter((issue) => issue.Type === type)?.length;
    if (match)
      issues = results?.Results?.GDAPIssues?.filter((issue) =>
        new RegExp(match).test(issue.Issue),
      )?.length;
    return (
      <>
        <SvgIcon fontSize="sm" style={{ marginRight: 4 }}>
          {type && <>{type === "Warning" ? <CippIcons.Warning /> : <CippIcons.XMarkIcon />}</>}
          {match && <>{issues > 0 ? <CippIcons.Warning /> : <CippIcons.CheckCircle />}</>}
        </SvgIcon>
        {issues}
      </>
    );
  };

  const gdapTests = [
    {
      resultProperty: "GDAPIssues",
      matchProperty: "Issue",
      match: ".+Partner Center API.+",
      count: 0,
      successMessage: "Partner Center API access is granted to the SAM application",
      failureMessage:
        "The SAM application cannot access the Partner Center API. Click Details for more information.",
    },
    {
      resultProperty: "Memberships",
      matchProperty: "displayName",
      match: "AdminAgents",
      count: 1,
      successMessage: "User is a member of the AdminAgents group",
      failureMessage: "User is not a member of the AdminAgents group",
    },
    {
      resultProperty: "Memberships",
      matchProperty: "displayName",
      match: "^M365 GDAP.+",
      count: 15,
      successMessage: "User is a member of the 15 CIPP Recommended GDAP groups",
      failureMessage: "User is not a member of the 15 CIPP Recommended GDAP groups",
    },
    {
      resultProperty: "GDAPIssues",
      matchProperty: "Issue",
      match: ".+Microsoft Led Transition.+$",
      count: 0,
      successMessage: "No Microsoft Led Transition relationships found",
      failureMessage: "Microsoft Led Transition relationships found",
    },
    {
      resultProperty: "GDAPIssues",
      matchProperty: "Issue",
      match: ".+global administrator.+$",
      count: 0,
      successMessage: "No Global Admin relationships found",
      failureMessage: "Global Admin relationships found",
    },
    {
      resultProperty: "RoleMappingResults",
      matchProperty: "Status",
      match: "^(Stale|Missing)$",
      count: 0,
      successMessage: "All GDAP role mappings reference existing security groups",
      failureMessage:
        "One or more GDAP role mappings reference stale or missing security groups. Click Details to repair.",
    },
  ];

  const propertyItems = [
    {
      label: "Warnings",
      value: <GdapIssueValue results={results} type="Warning" />,
    },
    {
      label: "Errors",
      value: <GdapIssueValue results={results} type="Error" />,
    },
    {
      label: "Microsoft Led Transition Relationships",
      value: <GdapIssueValue results={results} match=".+Microsoft Led Transition.+" />,
    },
    {
      label: "Global Admin Relationships",
      value: <GdapIssueValue results={results} match=".+global administrator.+" />,
    },
  ];

  return (
    <>
      {propertyItems.length > 0 && (
        <CippPropertyList
          direction="row"
          isFetching={!importReport && executeCheck?.isFetching}
          propertyItems={propertyItems}
          showDivider={false}
          layout
        />
      )}

      {!importReport && executeCheck?.isFetching ? (
        <List>
          {[70, 85, 60, 75].map((width, index) => (
            <ListItem key={index} sx={{ py: 0 }}>
              <Typography variant="body2" sx={{ width: `${width}%` }}>
                <Skeleton />
              </Typography>
            </ListItem>
          ))}
        </List>
      ) : !importReport && executeCheck?.isError ? (
        <Alert severity="error" sx={{ ml: 3, mr: 1 }}>
          Failed to load GDAP check results. Please try refreshing or contact support if the issue
          persists.
        </Alert>
      ) : (
        <>
          <List>
            {gdapTests?.map((test, index) => {
              var matchedResults = results?.Results?.[test.resultProperty]?.filter((item) =>
                new RegExp(test.match)?.test(item?.[test.matchProperty]),
              );

              var testResult = false;
              if (test.count > 1) {
                testResult = matchedResults?.length >= test.count;
              } else {
                testResult = matchedResults?.length === test.count;
              }

              return (
                <ListItem sx={{ py: 0 }} key={index}>
                  <Typography variant="body2">
                    <SvgIcon fontSize="sm" style={{ marginRight: 4 }}>
                      {testResult ? <CippIcons.CheckCircle /> : <CippIcons.XMarkIcon />}
                    </SvgIcon>
                    {testResult ? test.successMessage : test.failureMessage}
                  </Typography>
                </ListItem>
              );
            })}
          </List>

          <CippOffCanvas
            size="xl"
            title="GDAP Details"
            visible={offcanvasVisible}
            onClose={() => {
              setOffcanvasVisible(false);
            }}
            extendedInfo={[]}
          >
            {results?.Results?.GDAPIssues?.filter((issue) => issue.Category !== "RoleMapping")
              .length > 0 && (
              <>
                <CippDataTable
                  title="GDAP Issues"
                  isFetching={!importReport && executeCheck?.isFetching}
                  refreshFunction={executeCheck}
                  data={results?.Results?.GDAPIssues?.filter(
                    (issue) => issue.Category !== "RoleMapping",
                  )}
                  simpleColumns={["Tenant", "Type", "Issue", "Link"]}
                />
              </>
            )}

            {results?.Results?.MissingGroups?.length > 0 && (
              <>
                <CippDataTable
                  title="Missing Groups"
                  isFetching={!importReport && executeCheck?.isFetching}
                  refreshFunction={executeCheck}
                  data={results?.Results?.MissingGroups}
                  simpleColumns={["Name", "Type"]}
                />
              </>
            )}

            {results?.Results?.RoleMappingResults?.length > 0 && (
              <>
                <CippApiResults apiObject={repairRoleMappings} />
                <CippDataTable
                  title="Role Mapping Group Check"
                  isFetching={!importReport && executeCheck?.isFetching}
                  refreshFunction={executeCheck}
                  cardButton={
                    !importReport &&
                    hasRoleMappingIssues && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={handleRepairRoleMappings}
                        startIcon={
                          <SvgIcon fontSize="sm">
                            <CippIcons.WrenchIcon />
                          </SvgIcon>
                        }
                      >
                        Repair Role Mappings
                      </Button>
                    )
                  }
                  data={results?.Results?.RoleMappingResults}
                  simpleColumns={["RoleName", "GroupName", "GroupId", "Status", "Message"]}
                />
              </>
            )}

            {results?.Results?.Memberships?.filter(
              (membership) => membership?.["@odata.type"] === "#microsoft.graph.group",
            ).length > 0 && (
              <>
                <CippDataTable
                  title="Group Memberships"
                  isFetching={!importReport && executeCheck?.isFetching}
                  refreshFunction={executeCheck}
                  data={results?.Results?.Memberships?.filter(
                    (membership) => membership?.["@odata.type"] === "#microsoft.graph.group",
                  )}
                  simpleColumns={["displayName"]}
                />
              </>
            )}

            {results?.Results?.Memberships?.filter(
              (membership) => membership?.["@odata.type"] === "#microsoft.graph.directoryRole",
            ).length > 0 && (
              <>
                <CippDataTable
                  title="Directory Roles"
                  isFetching={!importReport && executeCheck?.isFetching}
                  refreshFunction={executeCheck}
                  data={results?.Results?.Memberships?.filter(
                    (membership) =>
                      membership?.["@odata.type"] === "#microsoft.graph.directoryRole",
                  )}
                  simpleColumns={["displayName"]}
                />
              </>
            )}
          </CippOffCanvas>
        </>
      )}
    </>
  );
};
