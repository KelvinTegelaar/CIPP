import { Alert, List, ListItem, Skeleton, SvgIcon, Typography } from "@mui/material";
import { Cancel, CheckCircle, Warning } from "@mui/icons-material";
import { CippPropertyList } from "../CippComponents/CippPropertyList";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { CippOffCanvas } from "../CippComponents/CippOffCanvas";
import { CippDataTable } from "../CippTable/CippDataTable";
import { useEffect, useState } from "react";

export const CippGDAPResults = (props) => {
  const { executeCheck, offcanvasVisible, setOffcanvasVisible, importReport, setCardIcon } = props;
  const [results, setResults] = useState({});

  useEffect(() => {
    if (importReport) {
      setResults(importReport);
    } else {
      setResults(executeCheck?.data);
    }
  }, [executeCheck, importReport]);

  useEffect(() => {
    if (results?.Results?.GDAPIssues?.length > 0 || results?.Results?.MissingGroups?.length > 0) {
      setCardIcon(<Cancel />);
    } else {
      setCardIcon(<CheckCircle />);
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
          {type && <>{type === "Warning" ? <Warning /> : <XMarkIcon />}</>}
          {match && <>{issues > 0 ? <Warning /> : <CheckCircle />}</>}
        </SvgIcon>
        {issues}
      </>
    );
  };

  const gdapTests = [
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
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1, ml: 3, mr: 1 }} />
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
                      {testResult ? <CheckCircle /> : <XMarkIcon />}
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
            {results?.Results?.GDAPIssues?.length > 0 && (
              <>
                <CippDataTable
                  title="GDAP Issues"
                  isFetching={!importReport && executeCheck?.isFetching}
                  refreshFunction={executeCheck}
                  data={results?.Results?.GDAPIssues}
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
