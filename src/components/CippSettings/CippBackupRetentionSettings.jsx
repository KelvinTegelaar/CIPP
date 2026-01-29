import { Button, ButtonGroup, SvgIcon, Typography, TextField, Box } from "@mui/material";
import CippButtonCard from "../CippCards/CippButtonCard";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { History } from "@mui/icons-material";
import { useState, useEffect } from "react";

const CippBackupRetentionSettings = () => {
  const retentionSetting = ApiGetCall({
    url: "/api/ExecBackupRetentionConfig?List=true",
    queryKey: "BackupRetentionSettings",
  });

  const retentionChange = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: "BackupRetentionSettings",
  });

  const [retentionDays, setRetentionDays] = useState(30);
  const [error, setError] = useState("");

  useEffect(() => {
    if (retentionSetting?.data?.Results?.RetentionDays) {
      setRetentionDays(retentionSetting.data.Results.RetentionDays);
    }
  }, [retentionSetting.data]);

  const handleRetentionChange = () => {
    const days = parseInt(retentionDays);

    if (isNaN(days) || days < 7) {
      setError("Retention must be at least 7 days");
      return;
    }

    setError("");
    retentionChange.mutate({
      url: "/api/ExecBackupRetentionConfig",
      data: { RetentionDays: days },
      queryKey: "BackupRetentionPost",
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setRetentionDays(value);

    const days = parseInt(value);
    if (!isNaN(days) && days < 7) {
      setError("Retention must be at least 7 days");
    } else if (isNaN(days)) {
      setError("Please enter a valid number");
    } else {
      setError("");
    }
  };

  const RetentionControls = () => {
    return (
      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
        <TextField
          size="small"
          type="number"
          value={retentionDays}
          onChange={handleInputChange}
          disabled={retentionChange.isPending || retentionSetting.isLoading}
          inputProps={{ min: 7 }}
          error={!!error}
          helperText={error}
          sx={{ width: "120px" }}
          label="Days"
        />
        <Button
          variant="contained"
          color="primary"
          size="small"
          disabled={retentionChange.isPending || retentionSetting.isLoading || !!error}
          onClick={handleRetentionChange}
          sx={{ mt: 0.5 }}
        >
          Save
        </Button>
      </Box>
    );
  };

  return (
    <CippButtonCard
      title="Backup Retention"
      cardSx={{ display: "flex", flexDirection: "column", height: "100%" }}
      CardButton={<RetentionControls />}
    >
      <Typography variant="body2">
        Configure how long to keep backup files. Both CIPP system backups and tenant backups will be
        automatically deleted after this period. Minimum retention is 7 days, default is 30 days.
        Cleanup runs daily at 2:00 AM.
      </Typography>
    </CippButtonCard>
  );
};

export default CippBackupRetentionSettings;
