import { Box, Button, Stack, SvgIcon, Typography } from "@mui/material";
import CippButtonCard from "/src/components/CippCards/CippButtonCard";
import { ApiGetCall } from "/src/api/ApiCall";
import { useState } from "react";
import { CippPermissionResults } from "./CippPermissionResults";
import { Sync } from "@mui/icons-material";
import { CippDataTable } from "../CippTable/CippDataTable";
import { CippTimeAgo } from "../CippComponents/CippTimeAgo";

const CippPermissionCheck = (props) => {
  const { type } = props;
  const [skipCache, setSkipCache] = useState(false);

  const executeCheck = ApiGetCall({
    url: "/api/ExecAccessChecks",
    data: { Type: type, SkipCache: skipCache },
    waiting: true,
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
          <Button
            variant="contained"
            size="small"
            onClick={handlePermissionCheck}
            disabled={executeCheck.isPending}
          >
            <SvgIcon fontSize="small" style={{ marginRight: 4 }}>
              <Sync />
            </SvgIcon>
            Refresh {type} Check
          </Button>
          <Box component={Typography} variant="caption">
            {executeCheck.isSuccess && (
              <>
                Last run <CippTimeAgo data={executeCheck.data?.Metadata?.LastRun} />
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
        title={`${type} Check`}
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
              <CippPermissionResults executeCheck={executeCheck} setSkipCache={setSkipCache} />
            )}
            {type === "Tenants" && (
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
      </CippButtonCard>
    </>
  );
};

export default CippPermissionCheck;
