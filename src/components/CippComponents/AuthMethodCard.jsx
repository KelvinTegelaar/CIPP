import { Box, Card, CardHeader, CardContent, Typography, Skeleton } from "@mui/material";
import { People as UsersIcon } from "@mui/icons-material";
import { CippSankey } from "./CippSankey";

export const AuthMethodCard = ({ data, isLoading }) => {
  const processData = () => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const enabledUsers = data.filter((user) => user.AccountEnabled === true);
    if (enabledUsers.length === 0) {
      return null;
    }

    const phishableMethods = ["mobilePhone", "email", "microsoftAuthenticatorPush"];
    const phishResistantMethods = ["fido2", "windowsHelloForBusiness", "x509Certificate"];

    let singleFactor = 0;
    let phishableCount = 0;
    let phishResistantCount = 0;
    let perUserMFA = 0;
    let phoneCount = 0;
    let authenticatorCount = 0;
    let passkeyCount = 0;
    let whfbCount = 0;

    enabledUsers.forEach((user) => {
      const methods = user.MFAMethods || [];
      const perUser = user.PerUser === "enforced" || user.PerUser === "enabled";
      const hasRegistered = user.MFARegistration === true;

      if (perUser && !hasRegistered && methods.length === 0) {
        perUserMFA++;
        return;
      }

      if (!hasRegistered || methods.length === 0) {
        singleFactor++;
        return;
      }

      const hasPhishResistant = methods.some((m) => phishResistantMethods.includes(m));
      const hasPhishable = methods.some((m) => phishableMethods.includes(m));

      if (hasPhishResistant) {
        phishResistantCount++;
        if (methods.includes("fido2") || methods.includes("x509Certificate")) {
          passkeyCount++;
        }
        if (methods.includes("windowsHelloForBusiness")) {
          whfbCount++;
        }
      } else if (hasPhishable) {
        phishableCount++;
        if (methods.includes("mobilePhone") || methods.includes("email")) {
          phoneCount++;
        }
        if (
          methods.includes("microsoftAuthenticatorPush") ||
          methods.includes("softwareOneTimePasscode")
        ) {
          authenticatorCount++;
        }
      } else {
        phishableCount++;
        authenticatorCount++;
      }
    });

    const mfaPercentage = (
      ((phishableCount + phishResistantCount + perUserMFA) / enabledUsers.length) *
      100
    ).toFixed(1);
    const phishResistantPercentage = ((phishResistantCount / enabledUsers.length) * 100).toFixed(1);

    const links = [
      { source: "Users", target: "Single factor", value: singleFactor },
      { source: "Users", target: "Multi factor", value: perUserMFA },
      { source: "Users", target: "Phishable", value: phishableCount },
      { source: "Users", target: "Phish resistant", value: phishResistantCount },
    ];

    if (phoneCount > 0) links.push({ source: "Phishable", target: "Phone", value: phoneCount });
    if (authenticatorCount > 0)
      links.push({ source: "Phishable", target: "Authenticator", value: authenticatorCount });

    if (passkeyCount > 0)
      links.push({ source: "Phish resistant", target: "Passkey", value: passkeyCount });
    if (whfbCount > 0) links.push({ source: "Phish resistant", target: "WHfB", value: whfbCount });

    const description = `${mfaPercentage}% of enabled users have MFA configured. ${phishResistantPercentage}% use phish-resistant authentication methods.`;

    return {
      nodes: [
        { id: "Users", nodeColor: "hsl(28, 100%, 53%)" },
        { id: "Single factor", nodeColor: "hsl(0, 100%, 50%)" },
        { id: "Multi factor", nodeColor: "hsl(200, 70%, 50%)" },
        { id: "Phishable", nodeColor: "hsl(39, 100%, 50%)" },
        { id: "Phone", nodeColor: "hsl(39, 100%, 45%)" },
        { id: "Authenticator", nodeColor: "hsl(39, 100%, 55%)" },
        { id: "Phish resistant", nodeColor: "hsl(99, 70%, 50%)" },
        { id: "Passkey", nodeColor: "hsl(140, 70%, 50%)" },
        { id: "WHfB", nodeColor: "hsl(160, 70%, 50%)" },
      ],
      links,
      description,
    };
  };

  const processedData = processData();

  return (
    <Card sx={{ flex: 1 }}>
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <UsersIcon sx={{ fontSize: 24 }} />
            <Typography variant="h6">All users auth methods</Typography>
          </Box>
        }
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ pb: 0 }}>
        <Box sx={{ height: 300 }}>
          {isLoading ? (
            <Skeleton variant="rectangular" width="100%" height={300} />
          ) : processedData ? (
            <CippSankey data={{ nodes: processedData.nodes, links: processedData.links }} />
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No authentication method data available
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
      {!isLoading && processedData?.description && (
        <CardContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {processedData.description}
          </Typography>
        </CardContent>
      )}
    </Card>
  );
};
