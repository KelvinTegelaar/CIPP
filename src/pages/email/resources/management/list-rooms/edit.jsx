import { useEffect } from "react";
import { Box, Divider, IconButton, Tooltip, Typography } from "@mui/material";
import { Sync } from "@mui/icons-material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "../../../../../layouts/index.js";
import CippFormPage from "../../../../../components/CippFormPages/CippFormPage";
import CippFormComponent from "../../../../../components/CippComponents/CippFormComponent";
import CippFormSkeleton from "../../../../../components/CippFormPages/CippFormSkeleton";
import { useSettings } from "../../../../../hooks/use-settings";
import { useRouter } from "next/router";
import { ApiGetCall } from "../../../../../api/ApiCall";
import countryList from "../../../../../data/countryList.json";
import timezoneList from "../../../../../data/timezoneList.json";

// Work days options
const workDaysOptions = [
  { value: "Sunday", label: "Sunday" },
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "WeekDay", label: "Weekdays (Monday-Friday)" },
  { value: "WeekendDay", label: "Weekend (Saturday-Sunday)" },
  { value: "AllDays", label: "All Days" },
];

// Automation Processing Options
const automateProcessingOptions = [
  { value: "None", label: "None - No processing" },
  { value: "AutoUpdate", label: "AutoUpdate - Accept/Decline but not delete" },
  { value: "AutoAccept", label: "AutoAccept - Accept and delete" },
];

const EditRoomMailbox = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const tenantDomain = useSettings().currentTenant;
  const formControl = useForm({
    mode: "onChange",
  });

  const roomInfo = ApiGetCall({
    url: `/api/ListRooms?roomId=${roomId}&tenantFilter=${tenantDomain}`,
    queryKey: `Room-${roomId}`,
    waiting: false,
  });

  useEffect(() => {
    if (roomInfo.isSuccess && roomInfo.data?.[0]) {
      const room = roomInfo.data[0];
      formControl.reset({
        // Core Properties
        displayName: room.displayName,
        hiddenFromAddressListsEnabled: room.hiddenFromAddressListsEnabled,

        // Room Booking Settings
        capacity: room.capacity,

        // Location Information
        building: room.building,
        floor: room.floor,
        floorLabel: room.floorLabel,
        street: room.street,
        city: room.city,
        state: room.state,
        postalCode: room.postalCode,
        countryOrRegion: room.countryOrRegion
          ? countryList.find((c) => c.Name === room.countryOrRegion)?.Code || ""
          : "",

        // Room Equipment
        audioDeviceName: room.audioDeviceName,
        videoDeviceName: room.videoDeviceName,
        displayDeviceName: room.displayDeviceName,

        // Room Features
        isWheelChairAccessible: room.isWheelChairAccessible,
        phone: room.phone,
        tags: room.tags?.map((tag) => ({ label: tag, value: tag })) || [],

        // Calendar Properties
        AllowConflicts: room.AllowConflicts,
        AllowRecurringMeetings: room.AllowRecurringMeetings,
        BookingWindowInDays: room.BookingWindowInDays,
        MaximumDurationInMinutes: room.MaximumDurationInMinutes,
        ProcessExternalMeetingMessages: room.ProcessExternalMeetingMessages,
        EnforceCapacity: room.EnforceCapacity,
        ForwardRequestsToDelegates: room.ForwardRequestsToDelegates,
        ScheduleOnlyDuringWorkHours: room.ScheduleOnlyDuringWorkHours,
        AutomateProcessing: room.AutomateProcessing,
        AddOrganizerToSubject: room.AddOrganizerToSubject,
        DeleteSubject: room.DeleteSubject,
        RemoveCanceledMeetings: room.RemoveCanceledMeetings,

        // Calendar Configuration
        WorkDays:
          room.WorkDays?.split(",")?.map((day) => ({
            label: day.trim(),
            value: day.trim(),
          })) || [],
        WorkHoursStartTime: room.WorkHoursStartTime,
        WorkHoursEndTime: room.WorkHoursEndTime,
        WorkingHoursTimeZone: room.WorkingHoursTimeZone
          ? {
              value: room.WorkingHoursTimeZone,
              label: timezoneList.find((tz) => tz.standardTime === room.WorkingHoursTimeZone)
                ? `${room.WorkingHoursTimeZone} - ${
                    timezoneList.find((tz) => tz.standardTime === room.WorkingHoursTimeZone)
                      ?.timezone
                  }`
                : room.WorkingHoursTimeZone,
            }
          : null,
      });
    }
  }, [roomInfo.isSuccess, roomInfo.data]);

  useEffect(() => {
    if (roomId) {
      roomInfo.refetch();
    }
  }, [router.query, roomId, tenantDomain]);

  return (
    <CippFormPage
      formControl={formControl}
      queryKey={`Room-${roomId}`}
      title="Edit Room Mailbox"
      backButtonTitle="Room Mailboxes Overview"
      postUrl="/api/EditRoomMailbox"
      customDataformatter={(values) => ({
        tenantID: tenantDomain,
        roomId: roomId,
        displayName: values.displayName?.trim(),
        hiddenFromAddressListsEnabled: values.hiddenFromAddressListsEnabled,

        // Room Booking Settings
        capacity: values.capacity,

        // Location Information
        building: values.building?.trim(),
        floor: values.floor,
        floorLabel: values.floorLabel?.trim(),
        street: values.street?.trim(),
        city: values.city?.trim(),
        state: values.state?.trim(),
        postalCode: values.postalCode?.trim(),
        countryOrRegion: values.countryOrRegion?.value || values.countryOrRegion || null,

        // Room Equipment
        audioDeviceName: values.audioDeviceName?.trim(),
        videoDeviceName: values.videoDeviceName?.trim(),
        displayDeviceName: values.displayDeviceName?.trim(),

        // Room Features
        isWheelChairAccessible: values.isWheelChairAccessible,
        phone: values.phone?.trim(),
        tags: values.tags?.map((tag) => tag.value),

        // Calendar Properties
        AllowConflicts: values.AllowConflicts,
        AllowRecurringMeetings: values.AllowRecurringMeetings,
        BookingWindowInDays: values.BookingWindowInDays,
        MaximumDurationInMinutes: values.MaximumDurationInMinutes,
        ProcessExternalMeetingMessages: values.ProcessExternalMeetingMessages,
        EnforceCapacity: values.EnforceCapacity,
        ForwardRequestsToDelegates: values.ForwardRequestsToDelegates,
        ScheduleOnlyDuringWorkHours: values.ScheduleOnlyDuringWorkHours,
        AutomateProcessing: values.AutomateProcessing?.value || values.AutomateProcessing,
        AddOrganizerToSubject: values.AddOrganizerToSubject,
        DeleteSubject: values.DeleteSubject,
        RemoveCanceledMeetings: values.RemoveCanceledMeetings,

        // Calendar Configuration
        WorkDays: values.WorkDays?.map((day) => day.value).join(","),
        WorkHoursStartTime: values.WorkHoursStartTime,
        WorkHoursEndTime: values.WorkHoursEndTime,
        WorkingHoursTimeZone: values.WorkingHoursTimeZone?.value || values.WorkingHoursTimeZone,
      })}
    >
      {roomInfo.isFetching && (
        <CippFormSkeleton layout={[2, 3, 1, 2, 3, 2, 1, 2, 3, 1, 3, 1, 3, 1]} />
      )}
      {roomInfo.isSuccess && !roomInfo.isFetching && (
        <Grid container spacing={2}>
          {/* Basic Information */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle1">Basic Information</Typography>
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={() => roomInfo.refetch()}>
                  <Sync fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Display Name"
              name="displayName"
              formControl={formControl}
              validators={{ required: "Display Name is required" }}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Hidden From Address Lists"
              name="hiddenFromAddressListsEnabled"
              formControl={formControl}
            />
          </Grid>
          <Divider sx={{ my: 2, width: "100%" }} />
          {/* Booking Settings */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Booking Settings
            </Typography>
          </Grid>

          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="number"
              label="Room Capacity"
              name="capacity"
              formControl={formControl}
              InputProps={{
                inputProps: { min: 0 },
              }}
            />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="number"
              label="Maximum Booking Duration (Minutes)"
              name="MaximumDurationInMinutes"
              formControl={formControl}
              validators={{
                min: { value: 1, message: "Minimum duration is 1 minute" },
                max: { value: 1440, message: "Maximum duration is 1440 minutes (24 hours)" },
              }}
              InputProps={{
                inputProps: { min: 1, max: 1440 },
              }}
              fullWidth
            />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="number"
              label="Booking Window (Days)"
              name="BookingWindowInDays"
              formControl={formControl}
              validators={{
                min: { value: 0, message: "Minimum is 0 days" },
                max: { value: 1080, message: "Maximum is 1080 days (3 years)" },
              }}
              InputProps={{
                inputProps: { min: 0, max: 1080 },
              }}
              fullWidth
            />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="Booking Process"
              name="AutomateProcessing"
              multiple={false}
              creatable={false}
              options={automateProcessingOptions}
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Allow Recurring Meetings"
              name="AllowRecurringMeetings"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Allow Double-Booking"
              name="AllowConflicts"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Process External Meetings"
              name="ProcessExternalMeetingMessages"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Enforce Room Capacity"
              name="EnforceCapacity"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Forward to Delegates"
              name="ForwardRequestsToDelegates"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Add Organizer to Subject"
              name="AddOrganizerToSubject"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Delete Subject"
              name="DeleteSubject"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Remove Canceled Meetings"
              name="RemoveCanceledMeetings"
              formControl={formControl}
            />
          </Grid>
          <Divider sx={{ my: 2, width: "100%" }} />
          {/* Working Hours */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Working Hours
            </Typography>
          </Grid>

          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Schedule Only During Work Hours"
              name="ScheduleOnlyDuringWorkHours"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 8, xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="Working Days"
              name="WorkDays"
              multiple={true}
              creatable={false}
              options={workDaysOptions}
              formControl={formControl}
            />
          </Grid>

          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="Timezone"
              name="WorkingHoursTimeZone"
              options={timezoneList.map((tz) => ({
                value: tz.standardTime,
                label: `${tz.standardTime} - ${tz.timezone}`,
              }))}
              multiple={false}
              creatable={false}
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="time"
              label="Work Hours Start"
              name="WorkHoursStartTime"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="time"
              label="Work Hours End"
              name="WorkHoursEndTime"
              formControl={formControl}
            />
          </Grid>
          <Divider sx={{ my: 2, width: "100%" }} />
          {/* Room Facilities */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Room Facilities & Equipment
            </Typography>
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Wheelchair Accessible"
              name="isWheelChairAccessible"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Phone"
              name="phone"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Audio Device"
              name="audioDeviceName"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Video Device"
              name="videoDeviceName"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Display Device"
              name="displayDeviceName"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="Tags"
              name="tags"
              formControl={formControl}
              multiple={true}
              creatable={true}
            />
          </Grid>
          <Divider sx={{ my: 2, width: "100%" }} />
          {/* Location Information */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Location Information
            </Typography>
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Building"
              name="building"
              formControl={formControl}
            />
          </Grid>

          <Grid size={{ md: 3, xs: 12 }}>
            <CippFormComponent type="number" label="Floor" name="floor" formControl={formControl} />
          </Grid>

          <Grid size={{ md: 3, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Floor Label"
              name="floorLabel"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 12, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Street Address"
              name="street"
              formControl={formControl}
            />
          </Grid>

          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="City"
              name="city"
              formControl={formControl}
            />
          </Grid>

          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="State/Province"
              name="state"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Postal Code"
              name="postalCode"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 12, xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="Country/Region"
              name="countryOrRegion"
              multiple={false}
              creatable={false}
              options={countryList.map(({ Code, Name }) => ({
                label: Name,
                value: Code,
              }))}
              formControl={formControl}
            />
          </Grid>
        </Grid>
      )}
    </CippFormPage>
  );
};

EditRoomMailbox.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditRoomMailbox;
