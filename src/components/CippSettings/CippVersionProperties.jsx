import { Box, Button, Skeleton, SvgIcon } from "@mui/material";
import { CippPropertyListCard } from "/src/components/CippCards/CippPropertyListCard";
import { CheckCircle, Sync, Warning } from "@mui/icons-material";
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
    if (version.isSuccess) {
      cippVersion.refetch();
    }
  }, [version]);

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
          onClick={() => cippVersion.refetch()}
        >
          <SvgIcon fontSize="small" style={{ marginRight: 4 }}>
            <Sync />
          </SvgIcon>
          Check Version
        </Button>
      }
      title="Version"
      cardSx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}
      propertyItems={
        cippVersion.isSuccess
          ? [
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
            ]
          : [
              {
                label: "Frontend",
                value: (
                  <Box width="100%">
                    <Skeleton width="100%" />
                  </Box>
                ),
              },
              {
                label: "Backend",
                value: (
                  <Box width="100%">
                    <Skeleton width="100%" />
                  </Box>
                ),
              },
            ]
      }
    />
  );
};

export default CippVersionProperties;
