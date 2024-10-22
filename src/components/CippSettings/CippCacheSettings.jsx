import { Button, ButtonGroup, SvgIcon, Typography } from "@mui/material";
import CippButtonCard from "/src/components/CippCards/CippButtonCard";
import { ApiGetCall, ApiPostCall } from "/src/api/ApiCall";

const CippCacheSettings = () => {
  const resolverChange = ApiPostCall({
    datafromUrl: true,
  });

  const handleCacheClear = (type) => {
    var data = {
      ClearCache: true,
    };
    if (type === "Tenant") {
      data.TenantsOnly = true;
    }

    resolverChange.mutate({
      url: "/api/ListTenants",
      data: data,
    });
  };

  const CacheButtons = () => {
    return (
      <>
        <Button
          variant="contained"
          size="small"
          onClick={() => handleCacheClear("All")}
          disabled={resolverChange.isPending}
        >
          All Caches
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => handleCacheClear("Tenant")}
          disabled={resolverChange.isPending}
        >
          Tenant Cache
        </Button>
      </>
    );
  };

  return (
    <CippButtonCard
      title="Cache"
      cardSx={{ display: "flex", flexDirection: "column", height: "100%" }}
      CardButton={<CacheButtons />}
    >
      <Typography variant="body2">
        Use this button to clear the caches used by CIPP. This will slow down some aspects of the
        application, and should only be used when instructed to do so by support.
      </Typography>
    </CippButtonCard>
  );
};

export default CippCacheSettings;
