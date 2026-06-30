import { useEffect, useRef, useState } from "react";
import {
  Button,
  Box,
  Typography,
  Skeleton,
  Grid,
  Paper,
  Divider,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { VpnKey, Computer, CheckCircle, Cancel, Info, Key } from "@mui/icons-material";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { CippCopyToClipBoard } from "./CippCopyToClipboard";

const getVolumeTypeLabel = (volumeType) => {
  const types = {
    0: "Operating System Volume",
    1: "Fixed Data Volume",
    2: "Removable Data Volume",
    3: "Unknown",
  };
  return types[volumeType] || `Type ${volumeType}`;
};

export const CippBitlockerKeySearch = ({
  initialSearchTerm = "",
  initialSearchType = "keyId",
  autoSearch = false,
}) => {
  const searchTerm = initialSearchTerm;
  const searchType = initialSearchType || "keyId";
  const hasAutoSearched = useRef(false);

  // State to store retrieved recovery keys by keyId
  const [recoveryKeys, setRecoveryKeys] = useState({});
  const [loadingKeys, setLoadingKeys] = useState({});

  const retrieveKeyMutation = ApiPostCall({});

  const handleRetrieveKey = async (keyId, deviceId, tenant) => {
    setLoadingKeys((prev) => ({ ...prev, [keyId]: true }));

    try {
      const response = await retrieveKeyMutation.mutateAsync({
        url: "/api/ExecGetRecoveryKey",
        data: {
          GUID: deviceId,
          RecoveryKeyType: "BitLocker",
          tenantFilter: tenant,
        },
      });

      // Extract the key from the response
      if (response?.data?.Results?.copyField) {
        setRecoveryKeys((prev) => ({ ...prev, [keyId]: response.data.Results.copyField }));
      }
    } catch (error) {
      console.error("Failed to retrieve key:", error);
    } finally {
      setLoadingKeys((prev) => ({ ...prev, [keyId]: false }));
    }
  };

  const getBitlockerKeys = ApiGetCall({
    url: "/api/ExecBitlockerSearch",
    data: { [searchType]: searchTerm },
    queryKey: `bitlocker-${searchType}-${searchTerm}`,
    waiting: false,
  });
  const { data, isSuccess, isFetching, refetch } = getBitlockerKeys;
  const isLoading = isFetching;

  useEffect(() => {
    hasAutoSearched.current = false;
  }, [initialSearchTerm, initialSearchType]);

  useEffect(() => {
    if (autoSearch && searchTerm && !hasAutoSearched.current) {
      refetch();
      hasAutoSearched.current = true;
    }
  }, [autoSearch, refetch, searchTerm]);

  const results = data?.Results || [];

  const content = (
    <Grid container spacing={3}>
      {isLoading && (
        <Grid size={{ xs: 12 }}>
          <Skeleton/>
        </Grid>
      )}

      {isSuccess && (
        <>
          <Grid size={{ xs: 12 }}>
            {results.map((result, index) => (
              <Paper
                key={result.keyId || index}
                elevation={2}
                sx={{ p: 3, mb: 2, backgroundColor: "background.paper" }}
              >
                <Grid container spacing={2}>
                    {/* BitLocker Key Information */}
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        <VpnKey sx={{ fontSize: 18, mr: 1, verticalAlign: "middle" }} />
                        BitLocker Key Information
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Key ID
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}
                        >
                          {result.keyId || "N/A"}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Volume Type
                      </Typography>
                      <Chip
                        label={getVolumeTypeLabel(result.volumeType)}
                        size="small"
                        color={result.volumeType === "0" ? "primary" : "default"}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Created
                      </Typography>
                      <Typography variant="body2">
                        {result.createdDateTime
                          ? new Date(result.createdDateTime).toLocaleString()
                          : "N/A"}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Tenant
                      </Typography>
                      <Typography variant="body2">{result.tenant || "N/A"}</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 8 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Recovery Key
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {recoveryKeys[result.keyId] ? (
                          <>
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}
                            >
                              {recoveryKeys[result.keyId]}
                            </Typography>
                            <CippCopyToClipBoard text={recoveryKeys[result.keyId]} />
                          </>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={
                              loadingKeys[result.keyId] ? <CircularProgress size={16} /> : <Key />
                            }
                            onClick={() =>
                              handleRetrieveKey(result.keyId, result.deviceId, result.tenant)
                            }
                            disabled={loadingKeys[result.keyId] || !result.keyId || !result.deviceId}
                          >
                            Retrieve Key
                          </Button>
                        )}
                      </Box>
                    </Grid>

                    {/* Device Information */}
                    {result.deviceFound && (
                      <>
                        <Grid size={{ xs: 12 }}>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            <Computer sx={{ fontSize: 18, mr: 1, verticalAlign: "middle" }} />
                            Device Information
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Device Name
                          </Typography>
                          <Typography variant="body2">{result.deviceName || "N/A"}</Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Device ID
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}
                            >
                              {result.deviceId || "N/A"}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Operating System
                          </Typography>
                          <Typography variant="body2">
                            {result.operatingSystem || "N/A"}
                            {result.osVersion && ` (${result.osVersion})`}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Account Status
                          </Typography>
                          <Chip
                            icon={
                              result.accountEnabled ? (
                                <CheckCircle sx={{ fontSize: 16 }} />
                              ) : (
                                <Cancel sx={{ fontSize: 16 }} />
                              )
                            }
                            label={result.accountEnabled ? "Enabled" : "Disabled"}
                            size="small"
                            color={result.accountEnabled ? "success" : "default"}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Trust Type
                          </Typography>
                          <Typography variant="body2">{result.trustType || "N/A"}</Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Last Sign In
                          </Typography>
                          <Typography variant="body2">
                            {result.lastSignIn ? new Date(result.lastSignIn).toLocaleString() : "N/A"}
                          </Typography>
                        </Grid>
                      </>
                    )}

                    {!result.deviceFound && (
                      <Grid size={{ xs: 12 }}>
                        <Alert severity="warning" icon={<Info />}>
                          Device information not found in cache. The device may have been deleted or
                          not yet synced.
                        </Alert>
                      </Grid>
                    )}
                </Grid>
              </Paper>
            ))}
          </Grid>
        </>
      )}
    </Grid>
  );
  return content;
};

export default CippBitlockerKeySearch;
