import { Button, SvgIcon, Typography } from "@mui/material";
import CippButtonCard from "/src/components/CippCards/CippButtonCard";
import { ApiGetCall } from "/src/api/ApiCall";
import { useState, useEffect } from "react";
import { CippPermissionResults } from "./CippPermissionResults";
import { SportsScore } from "@mui/icons-material";

const CippPermissionCheck = (props) => {
  const { type } = props;
  const [skipCache, setSkipCache] = useState(false);

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

  const CheckButton = () => {
    return (
      <>
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
