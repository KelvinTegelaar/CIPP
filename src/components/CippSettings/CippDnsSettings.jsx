import { Button, ButtonGroup, SvgIcon, Typography } from "@mui/material";
import CippButtonCard from "/src/components/CippCards/CippButtonCard";
import { ApiGetCall, ApiPostCall } from "/src/api/ApiCall";
import { Dns } from "@mui/icons-material";

const CippDnsSettings = () => {
  const dnsSetting = ApiGetCall({
    url: "/api/ExecDnsConfig?Action=GetConfig",
    queryKey: "DNSSettings",
  });

  const resolverChange = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: "DNSSettings",
  });

  const handleResolverChange = (resolver) => {
    resolverChange.mutate({
      url: "/api/ExecDnsConfig?Action=SetConfig",
      data: { Resolver: resolver },
      queryKey: "DNSResolverPost",
    });
  };

  const DnsButtons = () => {
    const resolvers = ["Google", "Cloudflare", "Quad9"];
    return resolvers.map((resolver) => (
      <Button
        variant={dnsSetting?.data?.Resolver === resolver ? "contained" : "outlined"}
        color="primary"
        size="small"
        disabled={resolverChange.isPending || dnsSetting.isLoading}
        onClick={() => handleResolverChange(resolver)}
      >
        {resolver}
      </Button>
    ));
  };

  return (
    <CippButtonCard
      title="DNS Resolver"
      cardSx={{ display: "flex", flexDirection: "column", height: "100%" }}
      CardButton={
        <>
          <ButtonGroup disableElevation={true}>
            <Button disabled={true} color="primary">
              <SvgIcon fontSize="small">
                <Dns />
              </SvgIcon>
            </Button>
            <DnsButtons />
          </ButtonGroup>
        </>
      }
    >
      <Typography variant="body2">
        Select your DNS Resolver. The DNS resolver is used for the domain analyser and the
        individual domain check only, not for generic DNS resolution.
      </Typography>
    </CippButtonCard>
  );
};

export default CippDnsSettings;
