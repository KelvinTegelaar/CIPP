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

export const CippGDAPResults = (props) => {
  const { executeCheck, setSkipCache, offcanvasVisible, setOffcanvasVisible } = props;
  const results = executeCheck.data;

  const propertyItems = [
    {
      label: "Warnings",
      value: results?.Results?.GDAPIssues.find((issue) => issue.Type === "Warning")?.length,
    },
    {
      label: "Errors",
      value: results?.Results?.GDAPIssues.find((issue) => issue.Type === "Error")?.length,
    },
  ];

  return (
    <>
      {propertyItems.length > 0 && (
        <CippPropertyList
          isFetching={executeCheck.isFetching}
          propertyItems={propertyItems}
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
            alignItems={"bottom"}
            justifyContent={"space-between"}
          >
            <Grid item xs={12} md={8}>
              <List>
                <ListItem sx={{ py: 0 }}>
                  <Typography variant="body2">
                    <SvgIcon fontSize="sm" style={{ marginRight: 4 }}>
                      <CheckCircle />
                    </SvgIcon>
                    Test
                  </Typography>
                </ListItem>
              </List>
            </Grid>
            <Grid item></Grid>
          </Grid>
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
              GDAP Details
            </Typography>

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
