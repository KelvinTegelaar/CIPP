import { Box, Card, CardHeader, CardContent, Typography, Divider, Skeleton } from "@mui/material";
import { CardMembership as CardMembershipIcon } from "@mui/icons-material";
import { CippSankey } from "./CippSankey";
import { useRouter } from "next/router";

export const LicenseCard = ({ data, isLoading }) => {
  const router = useRouter();
  const processData = () => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const topLicenses = data
      .filter((license) => license && parseInt(license?.TotalLicenses || 0) > 0)
      .sort((a, b) => parseInt(b?.TotalLicenses || 0) - parseInt(a?.TotalLicenses || 0))
      .slice(0, 5);

    if (topLicenses.length === 0) {
      return null;
    }

    const nodes = [];
    const links = [];
    const licenseLookup = {};

    topLicenses.forEach((license, index) => {
      if (license) {
        const licenseName =
          license.License || license.skuPartNumber || license.SkuPartNumber || "Unknown License";
        const shortName =
          licenseName.length > 30 ? licenseName.substring(0, 27) + "..." : licenseName;

        const assigned = parseInt(license?.CountUsed || 0) || 0;
        const available = parseInt(license?.CountAvailable || 0) || 0;

        // Use the index to keep node ids unique even when two licenses truncate
        // to the same shortName; the visible label stays the truncated name.
        const nodeId = `${index}-${shortName}`;
        const assignedId = `${nodeId} - Assigned`;
        const availableId = `${nodeId} - Available`;

        nodes.push({
          id: nodeId,
          label: shortName,
          nodeColor: `hsl(${210 + index * 30}, 70%, 50%)`,
        });

        // Map every node id back to the full license name so a click can filter
        // the report on the real License value.
        licenseLookup[nodeId] = licenseName;
        licenseLookup[assignedId] = licenseName;
        licenseLookup[availableId] = licenseName;

        if (assigned > 0) {
          nodes.push({
            id: assignedId,
            label: `${shortName} - Assigned`,
            nodeColor: "hsl(99, 70%, 50%)",
          });

          links.push({
            source: nodeId,
            target: assignedId,
            value: assigned,
          });
        }

        if (available > 0) {
          nodes.push({
            id: availableId,
            label: `${shortName} - Available`,
            nodeColor: "hsl(28, 100%, 53%)",
          });

          links.push({
            source: nodeId,
            target: availableId,
            value: available,
          });
        }
      }
    });

    if (nodes.length === 0 || links.length === 0) {
      return null;
    }

    return { nodes, links, licenseLookup };
  };

  const processedData = processData();

  const navigateToLicense = (nodeId) => {
    const fullName = processedData?.licenseLookup?.[nodeId];
    if (!fullName) {
      return;
    }
    router.push({
      pathname: "/tenant/reports/list-licenses",
      query: { filters: JSON.stringify([{ id: "License", value: fullName }]) },
    });
  };

  const handleNodeClick = (node) => {
    navigateToLicense(node?.id);
  };

  const handleLinkClick = (link) => {
    navigateToLicense(link?.source?.id ?? link?.source);
  };

  const calculateStats = () => {
    if (!data || !Array.isArray(data)) {
      return { total: 0, assigned: 0, available: 0 };
    }

    return {
      total: data.reduce((sum, lic) => sum + (parseInt(lic?.TotalLicenses || 0) || 0), 0),
      assigned: data.reduce((sum, lic) => sum + (parseInt(lic?.CountUsed || 0) || 0), 0),
      available: data.reduce((sum, lic) => sum + (parseInt(lic?.CountAvailable || 0) || 0), 0),
    };
  };

  const stats = calculateStats();

  return (
    <Card sx={{ flex: 1, height: '100%' }}>
      <CardHeader
        title={
          <Box
            onClick={() => router.push("/tenant/reports/list-licenses")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              width: "fit-content",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            <CardMembershipIcon sx={{ fontSize: 24 }} />
            <Typography variant="h6">License Overview</Typography>
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
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No license data available
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
      <Divider />
      <CardContent sx={{ pt: 2 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Skeleton width={80} height={20} sx={{ mb: 1 }} />
              <Skeleton width={60} height={32} />
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ flex: 1 }}>
              <Skeleton width={80} height={20} sx={{ mb: 1 }} />
              <Skeleton width={60} height={32} />
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ flex: 1 }}>
              <Skeleton width={80} height={20} sx={{ mb: 1 }} />
              <Skeleton width={60} height={32} />
            </Box>
          </Box>
        ) : data && Array.isArray(data) && data.length > 0 ? (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Total Licenses
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {stats.total.toLocaleString()}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Assigned
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {stats.assigned.toLocaleString()}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Available
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {stats.available.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No license statistics available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
