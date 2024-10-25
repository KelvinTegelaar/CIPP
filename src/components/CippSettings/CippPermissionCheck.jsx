import { Box, Button, Chip, Stack, SvgIcon, Typography } from "@mui/material";
import CippButtonCard from "/src/components/CippCards/CippButtonCard";
import { ApiGetCall } from "/src/api/ApiCall";
import { useState, useEffect } from "react";
import { CippPermissionResults } from "./CippPermissionResults";
import { SportsScore } from "@mui/icons-material";
import ReactTimeAgo from "react-time-ago";

const CippPermissionCheck = (props) => {
  const { type } = props;
  const [skipCache, setSkipCache] = useState(false);
  const isText = type === "text";
  const executeCheck = ApiGetCall({
    url: "/api/ExecAccessChecks",
    data: { Type: type, SkipCache: skipCache },
    waiting: type !== "Tenants",
    queryKey: `ExecAccessChecks-${type}`,
  });

  const handlePermissionCheck = () => {
    setSkipCache(true);
    executeCheck.refetch();
    console.log(skipCache);
  };

  const CheckLastRun = ({ data }) => {
    const date = typeof data === "number" ? new Date(data * 1000) : new Date(data);
    if (isNaN(date.getTime())) {
      return isText ? (
        "No Data"
      ) : (
        <Chip variant="outlined" label="No Data" size="small" color="info" />
      );
    }
    return isText ? <ReactTimeAgo date={date} /> : <ReactTimeAgo date={date} />;
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
              <SportsScore />
            </SvgIcon>
            Start {type} Check
          </Button>
          <Box component={Typography} variant="caption">
            {executeCheck.isSuccess && (
              <>
                Last run <CheckLastRun data={executeCheck.data?.Metadata?.LastRun} />
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
          <>{type === "Permissions" && <CippPermissionResults executeCheck={executeCheck} />}</>
        )}
      </CippButtonCard>
    </>
  );
};

export default CippPermissionCheck;
