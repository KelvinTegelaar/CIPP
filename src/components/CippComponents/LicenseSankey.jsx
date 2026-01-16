import { CippSankey } from "./CippSankey";

export const LicenseSankey = ({ data }) => {
  // Null safety checks
  if (!data || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  // Get top 5 licenses by total count with null safety
  const topLicenses = data
    .filter((license) => license && parseInt(license?.TotalLicenses || 0) > 0)
    .sort((a, b) => parseInt(b?.TotalLicenses || 0) - parseInt(a?.TotalLicenses || 0))
    .slice(0, 5);

  if (topLicenses.length === 0) {
    return null;
  }

  // Create Sankey flow: Top 5 Licenses -> Assigned/Available for each
  const nodes = [];
  const links = [];

  topLicenses.forEach((license, index) => {
    if (license) {
      const licenseName =
        license.License || license.skuPartNumber || license.SkuPartNumber || "Unknown License";
      const shortName =
        licenseName.length > 30 ? licenseName.substring(0, 27) + "..." : licenseName;

      const assigned = parseInt(license?.CountUsed || 0) || 0;
      const available = parseInt(license?.CountAvailable || 0) || 0;

      // Add license node
      nodes.push({
        id: shortName,
        nodeColor: `hsl(${210 + index * 30}, 70%, 50%)`,
      });

      // Add Assigned and Available nodes for this license
      const assignedId = `${shortName} - Assigned`;
      const availableId = `${shortName} - Available`;

      if (assigned > 0) {
        nodes.push({
          id: assignedId,
          nodeColor: "hsl(99, 70%, 50%)",
        });

        links.push({
          source: shortName,
          target: assignedId,
          value: assigned,
        });
      }

      if (available > 0) {
        nodes.push({
          id: availableId,
          nodeColor: "hsl(28, 100%, 53%)",
        });

        links.push({
          source: shortName,
          target: availableId,
          value: available,
        });
      }
    }
  });

  // Only render if we have valid data
  if (nodes.length === 0 || links.length === 0) {
    return null;
  }

  return <CippSankey data={{ nodes, links }} />;
};
