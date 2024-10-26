import { Box, Button, Chip, Stack, SvgIcon, Typography } from "@mui/material";
import CippButtonCard from "/src/components/CippCards/CippButtonCard";
import { ApiGetCall } from "/src/api/ApiCall";
import { useState } from "react";
import { CippPermissionResults } from "./CippPermissionResults";
import { CippGDAPResults } from "./CippGDAPResults";
import { Sync } from "@mui/icons-material";
import { CippDataTable } from "../CippTable/CippDataTable";
import { CippTimeAgo } from "../CippComponents/CippTimeAgo";
import { Description } from "@mui/icons-material";

const CippPermissionCheck = (props) => {
  const { type, importReport = false } = props;
  const [skipCache, setSkipCache] = useState(false);
  const [offcanvasVisible, setOffcanvasVisible] = useState(false);
  var showDetails = true;
  if (type === "Tenants") {
    showDetails = false;
  }

  const executeCheck = ApiGetCall({
    url: "/api/ExecAccessChecks",
    data: { Type: type, SkipCache: skipCache },
    waiting: importReport ? false : true,
    queryKey: `ExecAccessChecks-${type}`,
  });

  const handlePermissionCheck = () => {
    setSkipCache(true);
    executeCheck.refetch();
  };

  const CheckButton = () => {
    return (
      <>
        <Stack
          direction="row"
          spacing={3}
          sx={{ mb: 1 }}
          display="flex"
          alignItems={"center"}
          justifyContent={"space-between"}
          width={"100%"}
        >
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              startIcon={
                <SvgIcon fontSize="small">
                  <Sync />
                </SvgIcon>
              }
              onClick={handlePermissionCheck}
              disabled={executeCheck.isPending || executeCheck.isFetching || importReport}
            >
              Refresh {type} Check
            </Button>
            {showDetails && (
              <Button
                onClick={() => {
                  setOffcanvasVisible(true);
                }}
                variant="outlined"
                color="primary"
                size="small"
                disabled={executeCheck.isPending || executeCheck.isFetching}
              >
                <SvgIcon fontSize="small" style={{ marginRight: 4 }}>
                  <Description />
                </SvgIcon>
                Details
              </Button>
            )}
          </Stack>
          <Box component={Typography} variant="caption">
            {executeCheck.isSuccess && (
              <>
                Last run{" "}
                <CippTimeAgo
                  data={
                    importReport?.[type]
                      ? importReport?.[type]?.Metadata?.LastRun
                      : executeCheck.data?.Metadata?.LastRun
                  }
                />
              </>
            )}
          </Box>
        </Stack>
      </>
    );
  };

  return (
    <>
      <CippButtonCard
        title={
          <Stack direction="row" justifyContent={"space-between"}>
            <Box>{type} Check</Box>
            {importReport?.[type] && <Chip size="small" label="Imported" variant="outlined" />}
          </Stack>
        }
        cardSx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          p: 0,
          marginBottom: "auto",
        }}
        CardButton={<CheckButton />}
      >
        {!executeCheck.isSuccess && (
          <Typography variant="body2">Click the button below to start a {type} check.</Typography>
        )}
        {executeCheck.isSuccess && (
          <>
            {type === "Permissions" && (
              <CippPermissionResults
                executeCheck={executeCheck}
                importReport={importReport?.[type]}
                setSkipCache={setSkipCache}
                offcanvasVisible={offcanvasVisible}
                setOffcanvasVisible={setOffcanvasVisible}
              />
            )}
            {type === "GDAP" && (
              <CippGDAPResults
                executeCheck={executeCheck}
                importReport={importReport?.[type]}
                offcanvasVisible={offcanvasVisible}
                setOffcanvasVisible={setOffcanvasVisible}
              />
            )}
            {type === "Tenants" && (
              <>
                {importReport?.[type]?.Results && (
                  <CippDataTable
                    noCard={true}
                    data={importReport[type].Results}
                    actions={[]}
                    simpleColumns={[
                      "TenantName",
                      "LastRun",
                      "GraphStatus",
                      "ExchangeStatus",
                      "MissingRoles",
                      "GDAPRoles",
                    ]}
                    offCanvas={{
                      extendedInfoFields: [
                        "TenantName",
                        "TenantId",
                        "DefaultDomainName",
                        "LastRun",
                        "GraphTest",
                        "ExchangeTest",
                      ],
                    }}
                  />
                )}
                {!importReport && (
                  <CippDataTable
                    noCard={true}
                    api={{
                      url: "/api/ExecAccessChecks",
                      data: { Type: "Tenants" },
                      dataKey: "Results",
                      queryKey: "ExecAccessChecks-Tenants",
                    }}
                    actions={[
                      {
                        label: "Check Tenant",
                        type: "POST",
                        url: "/api/ExecAccessChecks?Type=Tenants",
                        data: { TenantId: "TenantId" },
                        icon: <Sync />,
                        noConfirm: true,
                        relatedQueryKeys: "ExecAccessChecks-Tenants",
                      },
                    ]}
                    simpleColumns={[
                      "TenantName",
                      "LastRun",
                      "GraphStatus",
                      "ExchangeStatus",
                      "MissingRoles",
                      "GDAPRoles",
                    ]}
                    offCanvas={{
                      extendedInfoFields: [
                        "TenantName",
                        "TenantId",
                        "DefaultDomainName",
                        "LastRun",
                        "GraphTest",
                        "ExchangeTest",
                      ],
                    }}
                  />
                )}
              </>
            )}
          </>
        )}
      </CippButtonCard>
    </>
  );
};

export default CippPermissionCheck;
