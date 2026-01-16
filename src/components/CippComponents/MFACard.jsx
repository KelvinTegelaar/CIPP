import { Box, Card, CardHeader, CardContent, Typography, Skeleton } from "@mui/material";
import { Person as UserIcon } from "@mui/icons-material";
import { CippSankey } from "./CippSankey";

export const MFACard = ({ data, isLoading }) => {
  // Process data inside component
  const processData = () => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const enabledUsers = data.filter((user) => user.AccountEnabled === true);
    if (enabledUsers.length === 0) {
      return null;
    }

    let registeredUsers = 0;
    let notRegisteredUsers = 0;
    let registeredCA = 0;
    let registeredSD = 0;
    let registeredPerUser = 0;
    let registeredNone = 0;
    let notRegisteredCA = 0;
    let notRegisteredSD = 0;
    let notRegisteredPerUser = 0;
    let notRegisteredNone = 0;

    enabledUsers.forEach((user) => {
      const hasRegistered = user.MFARegistration === true;
      const coveredByCA = user.CoveredByCA?.startsWith("Enforced") || false;
      const coveredBySD = user.CoveredBySD === true;
      const perUserEnabled = user.PerUser === "enforced" || user.PerUser === "enabled";

      if (hasRegistered || perUserEnabled) {
        registeredUsers++;
        if (perUserEnabled) {
          registeredPerUser++;
        } else if (coveredByCA) {
          registeredCA++;
        } else if (coveredBySD) {
          registeredSD++;
        } else {
          registeredNone++;
        }
      } else {
        notRegisteredUsers++;
        if (coveredByCA) {
          notRegisteredCA++;
        } else if (coveredBySD) {
          notRegisteredSD++;
        } else {
          notRegisteredNone++;
        }
      }
    });

    const registeredPercentage = ((registeredUsers / enabledUsers.length) * 100).toFixed(1);
    const protectedPercentage = (
      ((registeredCA + registeredSD + registeredPerUser) / enabledUsers.length) *
      100
    ).toFixed(1);

    const links = [
      { source: "Enabled users", target: "MFA registered", value: registeredUsers },
      { source: "Enabled users", target: "Not registered", value: notRegisteredUsers },
    ];

    if (registeredCA > 0)
      links.push({ source: "MFA registered", target: "CA policy", value: registeredCA });
    if (registeredSD > 0)
      links.push({ source: "MFA registered", target: "Security defaults", value: registeredSD });
    if (registeredPerUser > 0)
      links.push({ source: "MFA registered", target: "Per-user MFA", value: registeredPerUser });
    if (registeredNone > 0)
      links.push({ source: "MFA registered", target: "No enforcement", value: registeredNone });

    if (notRegisteredCA > 0)
      links.push({ source: "Not registered", target: "CA policy", value: notRegisteredCA });
    if (notRegisteredSD > 0)
      links.push({
        source: "Not registered",
        target: "Security defaults",
        value: notRegisteredSD,
      });
    if (notRegisteredPerUser > 0)
      links.push({ source: "Not registered", target: "Per-user MFA", value: notRegisteredPerUser });
    if (notRegisteredNone > 0)
      links.push({ source: "Not registered", target: "No enforcement", value: notRegisteredNone });

    const description = `${registeredPercentage}% of enabled users have registered MFA methods. ${protectedPercentage}% are protected by policies requiring MFA.`;

    return {
      nodes: [
        { id: "Enabled users", nodeColor: "hsl(28, 100%, 53%)" },
        { id: "MFA registered", nodeColor: "hsl(99, 70%, 50%)" },
        { id: "Not registered", nodeColor: "hsl(39, 100%, 50%)" },
        { id: "CA policy", nodeColor: "hsl(99, 70%, 50%)" },
        { id: "Security defaults", nodeColor: "hsl(140, 70%, 50%)" },
        { id: "Per-user MFA", nodeColor: "hsl(200, 70%, 50%)" },
        { id: "No enforcement", nodeColor: "hsl(0, 100%, 50%)" },
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
            <UserIcon sx={{ fontSize: 24 }} />
            <Typography variant="h6">User authentication</Typography>
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
                No MFA data available
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
