import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import CippButtonCard from "/src/components/CippCards/CippButtonCard";
import { ApiGetCall } from "/src/api/ApiCall";
import { useEffect, useState } from "react";
import { CippPermissionResults } from "./CippPermissionResults";
import { CippGDAPResults } from "./CippGDAPResults";
import { Close, Sync } from "@mui/icons-material";
import { CippTenantResults } from "./CippTenantResults";
import { CippTimeAgo } from "../CippComponents/CippTimeAgo";
import { Description } from "@mui/icons-material";

const CippPermissionCheck = (props) => {
  const { type, importReport = false, variant } = props;
  const [skipCache, setSkipCache] = useState(false);
  const [cardIcon, setCardIcon] = useState(null);
  const [offcanvasVisible, setOffcanvasVisible] = useState(false);
  const [showAlertMessage, setShowAlertMessage] = useState(true);
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
    if (skipCache) {
      executeCheck.refetch();
    }
  };

  useEffect(() => {
    if (skipCache) {
      executeCheck.refetch();
    }
  }, [skipCache]);

  const CheckButton = () => {
    return (
      <>
        <Stack
          direction="row"
          spacing={3}
          display="flex"
          alignItems="center"
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
              Refresh
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
        variant={variant}
        title={
          <Stack
            direction="row"
            alignContent="center"
            justifyContent={"space-between"}
            sx={{ mb: 0 }}
          >
            <Box>{type} Check</Box>
            <Stack direction="row" spacing={2}>
              {importReport?.[type] && <Chip size="small" label="Imported" variant="outlined" />}
              {cardIcon && <SvgIcon>{cardIcon}</SvgIcon>}
            </Stack>
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
        {(executeCheck.isSuccess || executeCheck.isLoading) && (
          <>
            {executeCheck.data?.Metadata?.AlertMessage && (
              <Collapse in={showAlertMessage} unmountOnExit>
                <Alert
                  severity={executeCheck?.data?.Metadata?.AlertSeverity ?? "info"}
                  sx={{ mb: 2 }}
                  action={
                    <IconButton
                      aria-label="close"
                      color="inherit"
                      size="small"
                      onClick={() => setShowAlertMessage(false)}
                    >
                      <Close fontSize="inherit" />
                    </IconButton>
                  }
                >
                  {executeCheck.data.Metadata.AlertMessage}
                </Alert>
              </Collapse>
            )}
            {type === "Permissions" && (
              <CippPermissionResults
                executeCheck={executeCheck}
                importReport={importReport?.[type]}
                setSkipCache={setSkipCache}
                offcanvasVisible={offcanvasVisible}
                setOffcanvasVisible={setOffcanvasVisible}
                setCardIcon={setCardIcon}
              />
            )}
            {type === "GDAP" && (
              <CippGDAPResults
                executeCheck={executeCheck}
                importReport={importReport?.[type]}
                offcanvasVisible={offcanvasVisible}
                setOffcanvasVisible={setOffcanvasVisible}
                setCardIcon={setCardIcon}
              />
            )}
            {type === "Tenants" && <CippTenantResults importReport={importReport?.[type]} />}
          </>
        )}
      </CippButtonCard>
    </>
  );
};

export default CippPermissionCheck;
