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
    defaultValues: { CheckInterval: null, AutoUpdate: true, CheckTime: null },
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
  const updateSettings = data?.UpdateSettings;

  // Presentation for a channel value. Standard channels get their friendly name; a branch build
  // shows its tag, which is the thing that matches the branch it came from. Kept here rather
  // than server-side so channelLabels stays the single source of truth for both the picker and
  // the running-channel chip.
  //
  // The "pinned" arm only exists for immutable -<shortsha> tags left over from an earlier
  // version of preview-container.yml; it no longer creates them, and cleanup sweeps the
  // stragglers. Remove this once none remain.
  const prettyChannelLabel = (option) => {
    const value = option?.value ?? option;
    if (channelLabels[value]) return channelLabels[value].label;
    const pinned = /-([0-9a-f]{7})$/.exec(value ?? "");
    if (pinned) return `${value.replace(/-[0-9a-f]{7}$/, "")} — pinned ${pinned[1]}`;
    return value;
  };

  const buildChannelPattern = data?.BuildChannelPattern
    ? new RegExp(data.BuildChannelPattern)
    : null;
  const isBuildChannel = (value) =>
    Boolean(value) && !(data?.ValidChannels ?? []).includes(value) &&
    (buildChannelPattern ? buildChannelPattern.test(value) : false);

  const selectedChannel = channelForm.watch("Channel");
  const selectedChannelValue = selectedChannel?.value ?? selectedChannel;
  const buildChannelSelected = isBuildChannel(selectedChannelValue);

  // A branch build has no entry in channelLabels — show the tag itself rather than "Unknown",
  // so it's obvious at a glance that the instance is running something off the supported track.
  const channelInfo =
    channelLabels[data?.CurrentChannel] ??
    (isBuildChannel(data?.CurrentChannel)
      ? { label: prettyChannelLabel({ value: data.CurrentChannel }), color: "error" }
      : channelLabels.unknown);

  // The option list is loaded by the autocomplete itself (see the api prop below), so seed the
  // field from the running channel directly rather than looking it up in a local options array.
  useEffect(() => {
    if (containerStatus.isSuccess && data?.CurrentChannel) {
      channelForm.reset({
        Channel: {
          label: prettyChannelLabel({ value: data.CurrentChannel }),
          value: data.CurrentChannel,
        },
      });
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

  const formatUtcDate = (value) => {
    if (!value || value === "unknown") return "unknown";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;
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
                    Image Built (UTC)
                  </Typography>
                </Grid>
                <Grid size={{ xs: 8 }}>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }} title={data?.BuildDate}>
                    {formatUtcDate(data?.BuildDate)}
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
              image digest and optionally restart the container to apply the update. By default,
              CIPP checks every hour and auto-restarts at the preferred time of 23:00.
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

            {(updateSettings?.RunningVersion || updateSettings?.RemoteVersion) && (
              <Grid container spacing={1}>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Running Version
                  </Typography>
                </Grid>
                <Grid size={{ xs: 8 }}>
                  <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                    {updateSettings.RunningVersion || "unknown"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Remote Version
                  </Typography>
                </Grid>
                <Grid size={{ xs: 8 }}>
                  <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                    {updateSettings.RemoteVersion || "unknown"}
                  </Typography>
                </Grid>
                {updateSettings?.RemoteBuildDate && (
                  <>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Remote Built (UTC)
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 8 }}>
                      <Typography
                        variant="caption"
                        sx={{ fontFamily: "monospace" }}
                        title={updateSettings.RemoteBuildDate}
                      >
                        {formatUtcDate(updateSettings.RemoteBuildDate)}
                      </Typography>
                    </Grid>
                  </>
                )}
                {updateSettings?.RemoteDigest && (
                  <>
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
                  </>
                )}
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
            {/*
              Options come from ListChannels rather than a static list so branch builds appear
              as soon as their image is pushed. showRefresh gives the field a refresh button —
              push a branch, wait for the build, refresh, select it, no page reload.
              Free text stays enabled as a fallback if the registry lookup fails; the backend
              validates both the tag pattern and that the image actually exists.
            */}
            <CippFormComponent
              type="autoComplete"
              name="Channel"
              label="Release Channel"
              formControl={channelForm}
              api={{
                url: "/api/ExecContainerManagement",
                data: { Action: "ListChannels" },
                queryKey: "containerChannels",
                dataKey: "Results",
                labelField: prettyChannelLabel,
                valueField: "value",
                excludeTenantFilter: true,
                showRefresh: true,
              }}
              groupBy={(option) => option.rawData?.group ?? "Standard channels"}
              creatable={true}
              multiple={false}
            />
            {buildChannelSelected && (
              <Alert severity="error">
                <strong>{selectedChannelValue}</strong> is an unsupported build from an unmerged
                branch. It does not receive updates, and it is deleted when its branch is — after
                which this instance cannot start until you switch back to a standard channel. Use
                it for testing only.
              </Alert>
            )}
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
