import { Box, Button, SvgIcon } from "@mui/material";
import { CippPropertyListCard } from "/src/components/CippCards/CippPropertyListCard";
import { CheckCircle, SystemUpdateAlt, Warning } from "@mui/icons-material";
import { ApiGetCall } from "/src/api/ApiCall";
import { useEffect } from "react";

const CippVersionProperties = () => {
  const version = ApiGetCall({
    url: "/version.json",
    queryKey: "LocalVersion",
  });

  const cippVersion = ApiGetCall({
    url: `/api/GetVersion?LocalVersion=${version?.data?.version}`,
    queryKey: "CippVersion",
    waiting: false,
  });

  useEffect(() => {
    if (version.isFetched && !cippVersion.isFetched) {
      cippVersion.waiting = true;
      cippVersion.refetch();
    }
  }, [version, cippVersion]);

  const CippVersionComponent = (version, availableVersion, outOfDate) => {
    return (
      <Box>
        <SvgIcon fontSize="inherit" style={{ marginRight: 3 }}>
          {outOfDate === true ? <Warning color="warning" /> : <CheckCircle color="success" />}
        </SvgIcon>
        <span style={{ marginRight: 10 }}>v{version}</span>{" "}
        {outOfDate === true ? `(v${availableVersion} is available)` : ""}
      </Box>
    );
  };
  return (
    <CippPropertyListCard
      showDivider={false}
      cardButton={
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            version.refetch();
            cippVersion.refetch();
          }}
        >
          <SvgIcon fontSize="small" style={{ marginRight: 4 }}>
            <SystemUpdateAlt />
          </SvgIcon>
          Check For Updates
        </Button>
      }
      title="Version"
      isFetching={cippVersion.isFetching}
      cardSx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}
      propertyItems={[
        {
          label: "Frontend",
          value: CippVersionComponent(
            version?.data?.version,
            cippVersion?.data?.RemoteCIPPVersion,
            cippVersion?.data?.OutOfDateCIPP
          ),
        },
        {
          label: "Backend",
          value: CippVersionComponent(
            cippVersion?.data?.LocalCIPPAPIVersion,
            cippVersion?.data?.RemoteCIPPAPIVersion,
            cippVersion?.data?.OutOfDateCIPPAPI
          ),
        },
      ]}
    />
  );
};

export default CippVersionProperties;
