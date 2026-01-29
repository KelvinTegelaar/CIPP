import { Box, Card, CardHeader, CardContent, Typography, Skeleton } from "@mui/material";
import { Person as UserIcon } from "@mui/icons-material";
import { CippSankey } from "./CippSankey";
import { useRouter } from "next/router";

export const MFACard = ({ data, isLoading }) => {
  const router = useRouter();
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

  const handleNodeClick = (node) => {
    // Build filter based on clicked node
    let filters = [];

    switch (node.id) {
      case "Enabled users":
        filters = [{ id: "AccountEnabled", value: "Yes" }];
        break;
      case "MFA registered":
        filters = [
          { id: "AccountEnabled", value: "Yes" },
          { id: "MFARegistration", value: "Yes" },
        ];
        break;
      case "Not registered":
        filters = [
          { id: "AccountEnabled", value: "Yes" },
          { id: "MFARegistration", value: "No" },
        ];
        break;
      default:
        // For other nodes, don't navigate
        return;
    }

    // Navigate to MFA report with filters
    router.push({
      pathname: "/identity/reports/mfa-report",
      query: { filters: JSON.stringify(filters) },
    });
  };

  const handleLinkClick = (link) => {
    // Build filters based on the link's source and target
    let filters = [];

    if (link.source.id === "Enabled users" && link.target.id === "MFA registered") {
      filters = [
        { id: "AccountEnabled", value: "Yes" },
        { id: "MFARegistration", value: "Yes" },
      ];
    } else if (link.source.id === "Enabled users" && link.target.id === "Not registered") {
      filters = [
        { id: "AccountEnabled", value: "Yes" },
        { id: "MFARegistration", value: "No" },
      ];
    } else if (link.source.id === "MFA registered" && link.target.id === "CA policy") {
      filters = [
        { id: "AccountEnabled", value: "Yes" },
        { id: "MFARegistration", value: "Yes" },
      ];
      // Note: We can't easily filter by CoveredByCA in the table since it needs complex logic
    } else if (link.source.id === "MFA registered" && link.target.id === "Security defaults") {
      filters = [
        { id: "AccountEnabled", value: "Yes" },
        { id: "MFARegistration", value: "Yes" },
        { id: "CoveredBySD", value: "Yes" },
      ];
    } else if (link.source.id === "MFA registered" && link.target.id === "Per-user MFA") {
      filters = [{ id: "AccountEnabled", value: "Yes" }];
      // Note: Per-user MFA can be "enabled" or "enforced"
    } else if (link.source.id === "MFA registered" && link.target.id === "No enforcement") {
      filters = [
        { id: "AccountEnabled", value: "Yes" },
        { id: "MFARegistration", value: "Yes" },
      ];
    } else if (link.source.id === "Not registered" && link.target.id === "CA policy") {
      filters = [
        { id: "AccountEnabled", value: "Yes" },
        { id: "MFARegistration", value: "No" },
      ];
    } else if (link.source.id === "Not registered" && link.target.id === "Security defaults") {
      filters = [
        { id: "AccountEnabled", value: "Yes" },
        { id: "MFARegistration", value: "No" },
        { id: "CoveredBySD", value: "Yes" },
      ];
    } else if (link.source.id === "Not registered" && link.target.id === "Per-user MFA") {
      filters = [
        { id: "AccountEnabled", value: "Yes" },
        { id: "MFARegistration", value: "No" },
      ];
    } else if (link.source.id === "Not registered" && link.target.id === "No enforcement") {
      filters = [
        { id: "AccountEnabled", value: "Yes" },
        { id: "MFARegistration", value: "No" },
      ];
    }

    // Navigate to MFA report with filters
    if (filters.length > 0) {
      router.push({
        pathname: "/identity/reports/mfa-report",
        query: { filters: JSON.stringify(filters) },
      });
    }
  };

  return (
    <Card sx={{ flex: 1, height: "100%" }}>
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
            <CippSankey
              data={{ nodes: processedData.nodes, links: processedData.links }}
              onNodeClick={handleNodeClick}
              onLinkClick={handleLinkClick}
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: "100%",
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
