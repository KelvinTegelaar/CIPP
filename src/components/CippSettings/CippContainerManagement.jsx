import { useEffect } from "react";
import {
  Alert,
  Button,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import CippFormComponent from "../CippComponents/CippFormComponent";
import CippButtonCard from "../CippCards/CippButtonCard";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";

const channelLabels = {
  latest: { label: "Latest (Stable)", color: "success" },
  dev: { label: "Dev", color: "warning" },
  nightly: { label: "Nightly", color: "info" },
  unknown: { label: "Unknown", color: "default" },
};

const intervalOptions = [
  { label: "Disabled", value: "0" },
  { label: "Every hour", value: "1h" },
  { label: "Every 4 hours", value: "4h" },
  { label: "Every 12 hours", value: "12h" },
  { label: "Every day", value: "1d" },
];

const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  label: `${i.toString().padStart(2, "0")}:00`,
  value: String(i),
}));

export const CippContainerManagement = () => {
  const channelForm = useForm({
    mode: "onChange",
    defaultValues: { Channel: null },
  });

  const updateSettingsForm = useForm({
    mode: "onChange",
    defaultValues: { CheckInterval: null, AutoUpdate: false, CheckTime: null },
  });

  const containerStatus = ApiGetCall({
    url: "/api/ExecContainerManagement",
    data: { Action: "Status" },
    queryKey: "containerStatus",
  });

  const channelAction = ApiPostCall({
    relatedQueryKeys: ["containerStatus"],
  });

  const restartAction = ApiPostCall({
    relatedQueryKeys: ["containerStatus"],
  });

  const updateCheckAction = ApiPostCall({
    relatedQueryKeys: ["containerStatus"],
  });

  const updateSettingsAction = ApiPostCall({
    relatedQueryKeys: ["containerStatus"],
  });

  const data = containerStatus.data?.Results;
  const channelInfo = channelLabels[data?.CurrentChannel] ?? channelLabels.unknown;
  const updateSettings = data?.UpdateSettings;

  const channelOptions = (data?.ValidChannels ?? ["latest", "dev", "nightly"]).map((c) => ({
    label: channelLabels[c]?.label ?? c,
    value: c,
  }));

  useEffect(() => {
    if (containerStatus.isSuccess && data?.CurrentChannel) {
      const current = channelOptions.find((o) => o.value === data.CurrentChannel);
      if (current) {
        channelForm.reset({ Channel: current });
      }
    }
  }, [containerStatus.isSuccess, data?.CurrentChannel]);

  useEffect(() => {
    if (containerStatus.isSuccess && updateSettings) {
      const interval = intervalOptions.find((o) => o.value === (updateSettings.CheckInterval ?? "0"));
      const hour = updateSettings.CheckTime != null
        ? hourOptions.find((o) => o.value === String(updateSettings.CheckTime))
        : null;
      updateSettingsForm.reset({
        CheckInterval: interval ?? intervalOptions[0],
        AutoUpdate: updateSettings.AutoUpdate ?? false,
        CheckTime: hour ?? null,
      });
    }
  }, [containerStatus.isSuccess, updateSettings?.CheckInterval, updateSettings?.AutoUpdate, updateSettings?.CheckTime]);

  const handleUpdateChannel = () => {
    const selected = channelForm.getValues("Channel");
    const channel = selected?.value ?? selected;
    channelAction.mutate({
      url: "/api/ExecContainerManagement",
      data: { Action: "UpdateChannel", Channel: channel },
    });
  };

  const handleRestart = () => {
    restartAction.mutate({
      url: "/api/ExecContainerManagement",
      data: { Action: "Restart" },
    });
  };

  const handleCheckUpdate = () => {
    updateCheckAction.mutate({
      url: "/api/ExecContainerManagement",
      data: { Action: "CheckUpdate" },
    });
  };

  const handleSaveUpdateSettings = () => {
    const interval = updateSettingsForm.getValues("CheckInterval");
    const autoUpdate = updateSettingsForm.getValues("AutoUpdate");
    const checkTime = updateSettingsForm.getValues("CheckTime");
    updateSettingsAction.mutate({
      url: "/api/ExecContainerManagement",
      data: {
        Action: "SaveUpdateSettings",
        CheckInterval: interval?.value ?? interval ?? "0",
        AutoUpdate: autoUpdate ?? false,
        CheckTime: checkTime?.value ?? checkTime ?? null,
      },
    });
  };

  const truncateDigest = (digest) => {
    if (!digest) return "—";
    // Show algo prefix + first 12 hex chars
    if (digest.startsWith("sha256:")) {
      return `sha256:${digest.slice(7, 19)}…`;
    }
    return digest.length > 20 ? `${digest.slice(0, 20)}…` : digest;
  };

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
      <CippButtonCard title="Container Status" isFetching={containerStatus.isFetching}>
        <CardContent>
          {containerStatus.isLoading ? (
            <Stack spacing={2}>
              <Skeleton variant="rectangular" height={40} />
              <Skeleton variant="rectangular" height={40} />
            </Stack>
          ) : (
            <Stack spacing={2}>
              {data?.ConfiguredChannel && data.ConfiguredChannel !== data.CurrentChannel && (
                <Alert severity="warning">
                  A channel change is pending. Running: <strong>{data.CurrentChannel}</strong>,
                  configured: <strong>{data.ConfiguredChannel}</strong>. Restart the container to
                  apply.
                </Alert>
              )}
              {updateSettings?.UpdateAvailable && (
                <Alert severity="info">
                  A container update is available. Restart the container to pull the latest image.
                </Alert>
              )}
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Running Channel
                  </Typography>
                </Grid>
                <Grid size={{ xs: 8 }}>
                  <Chip label={channelInfo.label} color={channelInfo.color} size="small" />
                </Grid>

                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Image Tag
                  </Typography>
                </Grid>
                <Grid size={{ xs: 8 }}>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {data?.ImageTag ?? "unknown"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    App Version
                  </Typography>
                </Grid>
                <Grid size={{ xs: 8 }}>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {data?.CurrentVersion ?? "unknown"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Commit SHA
                  </Typography>
                </Grid>
                <Grid size={{ xs: 8 }}>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {data?.CommitSha ?? "unknown"}
                  </Typography>
                </Grid>

                {updateSettings?.RunningDigest && (
                  <>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Container Digest
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 8 }}>
                      <Typography
                        variant="body2"
                        title={updateSettings.RunningDigest}
                        sx={{ fontFamily: "monospace", cursor: "help" }}
                      >
                        {truncateDigest(updateSettings.RunningDigest)}
                      </Typography>
                    </Grid>
                  </>
                )}

                {data?.CurrentImage && data.CurrentImage !== "unknown" && (
                  <>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Container Image
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 8 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace", wordBreak: "break-all" }}
                      >
                        {data.CurrentImage}
                      </Typography>
                    </Grid>
                  </>
                )}

                {data?.SiteName && (
                  <>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        App Service
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 8 }}>
                      <Typography variant="body2">{data.SiteName}</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Stack>
          )}
        </CardContent>
      </CippButtonCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
      <CippButtonCard title="Update Management">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Configure automatic update checking. CIPP will query the container registry for a new
              image digest and optionally restart the container to apply the update.
              NOTE: If the container restarts for any reason the latest image version for your update channel will be pulled regardless
            </Typography>

            <CippFormComponent
              type="autoComplete"
              name="CheckInterval"
              label="Check Interval"
              options={intervalOptions}
              formControl={updateSettingsForm}
              creatable={false}
              multiple={false}
            />

            <CippFormComponent
              type="autoComplete"
              name="CheckTime"
              label="Preferred Check Time"
              options={hourOptions}
              formControl={updateSettingsForm}
              creatable={false}
              multiple={false}
            />

            <CippFormComponent
              type="switch"
              name="AutoUpdate"
              label="Auto-restart when an update is detected"
              formControl={updateSettingsForm}
            />

            <CippApiResults apiObject={updateSettingsAction} />

            <Divider />

            {updateSettings?.LastCheck && (
              <Typography variant="body2" color="text.secondary">
                Last checked: {new Date(updateSettings.LastCheck * 1000).toLocaleString()}
                {updateSettings.UpdateAvailable ? (
                  <Chip label="Update available" color="info" size="small" sx={{ ml: 1 }} />
                ) : (
                  <Chip label="Up to date" color="success" size="small" sx={{ ml: 1 }} />
                )}
              </Typography>
            )}

            {updateSettings?.RunningDigest && updateSettings?.RemoteDigest && (
              <Grid container spacing={1}>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Running Digest
                  </Typography>
                </Grid>
                <Grid size={{ xs: 8 }}>
                  <Typography
                    variant="caption"
                    title={updateSettings.RunningDigest}
                    sx={{ fontFamily: "monospace", cursor: "help" }}
                  >
                    {truncateDigest(updateSettings.RunningDigest)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Remote Digest
                  </Typography>
                </Grid>
                <Grid size={{ xs: 8 }}>
                  <Typography
                    variant="caption"
                    title={updateSettings.RemoteDigest}
                    sx={{ fontFamily: "monospace", cursor: "help" }}
                  >
                    {truncateDigest(updateSettings.RemoteDigest)}
                  </Typography>
                </Grid>
              </Grid>
            )}

            <CippApiResults apiObject={updateCheckAction} />
          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={handleCheckUpdate}
            disabled={updateCheckAction.isPending}
          >
            {updateCheckAction.isPending ? "Checking..." : "Check Now"}
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveUpdateSettings}
            disabled={updateSettingsAction.isPending}
          >
            {updateSettingsAction.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </CardActions>
      </CippButtonCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
      <CippButtonCard title="Release Channel">
        <CardContent>
          <Stack spacing={2}>
            <Alert severity="warning">
              Changing the release channel updates the container image tag. The new image will be
              pulled on the next container restart. Switching to &quot;Dev&quot; or
              &quot;Nightly&quot; may include unstable or untested changes.
            </Alert>
            <CippFormComponent
              type="autoComplete"
              name="Channel"
              label="Release Channel"
              options={channelOptions}
              formControl={channelForm}
              creatable={false}
              multiple={false}
            />
            <CippApiResults apiObject={channelAction} />
          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
          <Button
            variant="contained"
            onClick={handleUpdateChannel}
            disabled={channelAction.isPending}
          >
            {channelAction.isPending ? "Updating..." : "Update Channel"}
          </Button>
        </CardActions>
      </CippButtonCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
      <CippButtonCard title="Restart Application">
        <CardContent>
          <Stack spacing={2}>
          <Alert severity="info">
            Restart the application container. This will cause a brief downtime while the container
            restarts. If you changed the release channel, this will pull the new image.
          </Alert>
          <CippApiResults apiObject={restartAction} />
          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
          <Button
            variant="outlined"
            color="warning"
            onClick={handleRestart}
            disabled={restartAction.isPending}
          >
            Restart Container
          </Button>
        </CardActions>
      </CippButtonCard>
      </Grid>
    </Grid>
  );
};

export default CippContainerManagement;
