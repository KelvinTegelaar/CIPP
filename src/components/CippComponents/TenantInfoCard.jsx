import { Box, Card, CardHeader, CardContent, Typography, Skeleton } from "@mui/material";
import { Business as BuildingIcon } from "@mui/icons-material";
import { CippCopyToClipBoard } from "./CippCopyToClipboard";

export const TenantInfoCard = ({ data, isLoading }) => {
  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BuildingIcon sx={{ fontSize: 20 }} />
            <Typography variant="subtitle1">Tenant</Typography>
          </Box>
        }
        sx={{ pb: 1.5 }}
      />
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Name
            </Typography>
            {isLoading ? (
              <Skeleton width={150} height={24} />
            ) : (
              <Typography variant="body1" fontWeight={500}>
                {data?.displayName || "Not Available"}
              </Typography>
            )}
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Tenant ID
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              {isLoading ? (
                <Skeleton width={200} height={24} />
              ) : data?.id ? (
                <CippCopyToClipBoard text={data.id} type="chip" />
              ) : (
                <Typography variant="body2" fontSize="0.75rem">
                  Not Available
                </Typography>
              )}
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Primary Domain
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              {isLoading ? (
                <Skeleton width={180} height={24} />
              ) : data?.verifiedDomains?.find((d) => d.isDefault)?.name ? (
                <CippCopyToClipBoard
                  text={data.verifiedDomains.find((d) => d.isDefault).name}
                  type="chip"
                />
              ) : (
                <Typography variant="body2" fontSize="0.75rem">
                  Not Available
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
