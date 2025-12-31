import { CippSankey } from "./CippSankey";

export const LicenseSankey = ({ data }) => {
  // Null safety checks
  if (!data || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  // Calculate aggregated license data with null safety
  let totalLicenses = 0;
  let totalAssigned = 0;
  let totalAvailable = 0;

  data.forEach((license) => {
    if (license) {
      totalLicenses += parseInt(license?.TotalLicenses || 0) || 0;
      totalAssigned += parseInt(license?.CountUsed || 0) || 0;
      totalAvailable += parseInt(license?.CountAvailable || 0) || 0;
    }
  });

  // If no valid data, return null
  if (totalLicenses === 0 && totalAssigned === 0 && totalAvailable === 0) {
    return null;
  }

  // Create Sankey flow: Total -> Assigned/Available -> Top 5 licenses
  const nodes = [
    { id: "Total Licenses", nodeColor: "hsl(210, 100%, 56%)" },
    { id: "Assigned", nodeColor: "hsl(99, 70%, 50%)" },
    { id: "Available", nodeColor: "hsl(28, 100%, 53%)" },
  ];

  const links = [
    {
      source: "Total Licenses",
      target: "Assigned",
      value: totalAssigned > 0 ? totalAssigned : 0,
    },
    {
      source: "Total Licenses",
      target: "Available",
      value: totalAvailable > 0 ? totalAvailable : 0,
    },
  ];

  // Add top 5 most used licenses with null safety
  const topLicenses = data
    .filter((license) => license && parseInt(license?.CountUsed || 0) > 0)
    .sort((a, b) => parseInt(b?.CountUsed || 0) - parseInt(a?.CountUsed || 0))
    .slice(0, 5);

  topLicenses.forEach((license, index) => {
    if (license) {
      const licenseName =
        license.License || license.skuPartNumber || license.SkuPartNumber || "Unknown License";
      const shortName =
        licenseName.length > 30 ? licenseName.substring(0, 27) + "..." : licenseName;

      nodes.push({
        id: shortName,
        nodeColor: `hsl(${120 + index * 30}, 70%, 50%)`,
      });

      links.push({
        source: "Assigned",
        target: shortName,
        value: parseInt(license?.CountUsed || 0) || 0,
      });
    }
  });

  // Only render if we have valid data
  if (nodes.length === 3 && links.length === 2) {
    // No licenses to show besides the base nodes
    return null;
  }

  return <CippSankey data={{ nodes, links }} />;
};
