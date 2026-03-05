import { Button, SvgIcon, Typography } from "@mui/material";
import CippButtonCard from "../CippCards/CippButtonCard";
import { ApiPostCall } from "../../api/ApiCall";
import { CippApiDialog } from "../CippComponents/CippApiDialog";
import { useDialog } from "../../hooks/use-dialog";
import { TrashIcon } from "@heroicons/react/24/outline";

const CippCacheSettings = () => {
  const createDialog = useDialog();
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
          onClick={createDialog.handleOpen}
          disabled={resolverChange.isPending}
        >
          <SvgIcon fontSize="small" style={{ marginRight: 4 }}>
            <TrashIcon />
          </SvgIcon>
          Clear Cache
        </Button>
      </>
    );
  };

  return (
    <>
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
      <CippApiDialog
        title="Clear Cache"
        createDialog={createDialog}
        fields={[
          {
            type: "switch",
            name: "tenantsOnly",
            label: "Only Clear the Tenant Cache",
          },
        ]}
        api={{
          url: "/api/ListTenants",
          confirmText:
            "This will clear the cache used by CIPP. This will slow down some aspects of the application, and should only be used when instructed to do so by support. This will delete any cache tables including pending audit logs that have not yet been processed. Are you sure you want to continue?",
          type: "POST",
          data: { ClearCache: true },
          replacementBehaviour: "removeNulls",
        }}
        row={{}}
      />
    </>
  );
};

export default CippCacheSettings;
