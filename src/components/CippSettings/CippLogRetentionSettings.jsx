import { Button, Typography, TextField, Box } from "@mui/material";
import CippButtonCard from "../CippCards/CippButtonCard";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { useState, useEffect } from "react";

const CippLogRetentionSettings = () => {
  const retentionSetting = ApiGetCall({
    url: "/api/ExecLogRetentionConfig?List=true",
    queryKey: "LogRetentionSettings",
  });

  const retentionChange = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: "LogRetentionSettings",
  });

  const [retentionDays, setRetentionDays] = useState(90);
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

    if (days > 365) {
      setError("Retention must be at most 365 days");
      return;
    }

    setError("");
    retentionChange.mutate({
      url: "/api/ExecLogRetentionConfig",
      data: { RetentionDays: days },
      queryKey: "LogRetentionPost",
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setRetentionDays(value);

    const days = parseInt(value);
    if (!isNaN(days) && days < 7) {
      setError("Retention must be at least 7 days");
    } else if (!isNaN(days) && days > 365) {
      setError("Retention must be at most 365 days");
    } else if (isNaN(days) && value !== "") {
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
          inputProps={{ min: 7, max: 365 }}
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
      title="Log Retention"
      cardSx={{ display: "flex", flexDirection: "column", height: "100%" }}
      CardButton={<RetentionControls />}
    >
      <Typography variant="body2">
        Configure how long to keep CIPP log entries. Logs will be automatically deleted after this
        period. Minimum retention is 7 days, maximum is 365 days, default is 90 days.
      </Typography>
      <CippApiResults apiObject={retentionChange} />
    </CippButtonCard>
  );
};

export default CippLogRetentionSettings;
