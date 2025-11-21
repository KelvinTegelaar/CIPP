import React, { useEffect } from "react";
import { Divider, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import { useSettings } from "/src/hooks/use-settings";
import { useRouter } from "next/router";
import { ApiGetCall } from "/src/api/ApiCall";
import countryList from "/src/data/countryList.json";
import timezoneList from "/src/data/timezoneList.json";

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

const EditEquipmentMailbox = () => {
  const router = useRouter();
  const { equipmentId } = router.query;
  const tenantDomain = useSettings().currentTenant;
  const formControl = useForm({
    mode: "onChange",
  });

  const equipmentInfo = ApiGetCall({
    url: `/api/ListEquipment?EquipmentId=${equipmentId}&tenantFilter=${tenantDomain}`,
    queryKey: `Equipment-${equipmentId}`,
    waiting: false,
  });

  useEffect(() => {
    if (equipmentInfo.isSuccess && equipmentInfo.data?.[0]) {
      const equipment = equipmentInfo.data[0];
      formControl.reset({
        // Core Properties
        displayName: equipment.displayName,
        hiddenFromAddressListsEnabled: equipment.hiddenFromAddressListsEnabled,

        // Equipment Details
        department: equipment.department,
        company: equipment.company,

        // Location Information
        streetAddress: equipment.streetAddress,
        city: equipment.city,
        stateOrProvince: equipment.stateOrProvince,
        postalCode: equipment.postalCode,
        countryOrRegion: equipment.countryOrRegion
          ? countryList.find((c) => c.Name === equipment.countryOrRegion)?.Code || ""
          : "",
        phone: equipment.phone,
        tags: equipment.tags?.map((tag) => ({ label: tag, value: tag })) || [],

        // Booking Information
        allowConflicts: equipment.allowConflicts,
        allowRecurringMeetings: equipment.allowRecurringMeetings,
        bookingWindowInDays: equipment.bookingWindowInDays,
        maximumDurationInMinutes: equipment.maximumDurationInMinutes,
        processExternalMeetingMessages: equipment.processExternalMeetingMessages,
        forwardRequestsToDelegates: equipment.forwardRequestsToDelegates,
        scheduleOnlyDuringWorkHours: equipment.scheduleOnlyDuringWorkHours,
        automateProcessing: equipment.automateProcessing,

        // Calendar Configuration
        workDays:
          equipment.workDays?.split(",")?.map((day) => ({
            label: day.trim(),
            value: day.trim(),
          })) || [],
        workHoursStartTime: equipment.workHoursStartTime,
        workHoursEndTime: equipment.workHoursEndTime,
        workingHoursTimeZone: equipment.workingHoursTimeZone
          ? {
              value: equipment.workingHoursTimeZone,
              label: timezoneList.find((tz) => tz.standardTime === equipment.workingHoursTimeZone)
                ? `${equipment.workingHoursTimeZone} - ${
                    timezoneList.find((tz) => tz.standardTime === equipment.workingHoursTimeZone)
                      ?.timezone
                  }`
                : equipment.workingHoursTimeZone,
            }
          : null,
      });
    }
  }, [equipmentInfo.isSuccess, equipmentInfo.data]);

  useEffect(() => {
    if (equipmentId) {
      equipmentInfo.refetch();
    }
  }, [router.query, equipmentId, tenantDomain]);

  return (
    <CippFormPage
      formControl={formControl}
      queryKey={`Equipment-${equipmentId}`}
      title="Edit Equipment Mailbox"
      backButtonTitle="Equipment Mailboxes Overview"
      postUrl="/api/EditEquipmentMailbox"
      customDataformatter={(values) => ({
        tenantID: tenantDomain,
        equipmentId: equipmentId,
        displayName: values.displayName?.trim(),
        hiddenFromAddressListsEnabled: values.hiddenFromAddressListsEnabled,

        // Equipment Details
        department: values.department?.trim(),
        company: values.company?.trim(),

        // Location Information
        streetAddress: values.streetAddress?.trim(),
        city: values.city?.trim(),
        stateOrProvince: values.stateOrProvince?.trim(),
        postalCode: values.postalCode?.trim(),
        countryOrRegion: values.countryOrRegion?.value || values.countryOrRegion || null,
        phone: values.phone?.trim(),
        tags: values.tags?.map((tag) => tag.value),

        // Booking Information
        allowConflicts: values.allowConflicts,
        allowRecurringMeetings: values.allowRecurringMeetings,
        bookingWindowInDays: values.bookingWindowInDays,
        maximumDurationInMinutes: values.maximumDurationInMinutes,
        processExternalMeetingMessages: values.processExternalMeetingMessages,
        forwardRequestsToDelegates: values.forwardRequestsToDelegates,
        scheduleOnlyDuringWorkHours: values.scheduleOnlyDuringWorkHours,
        automateProcessing: values.automateProcessing?.value || values.automateProcessing,

        // Calendar Configuration
        workDays: values.workDays?.map((day) => day.value).join(","),
        workHoursStartTime: values.workHoursStartTime,
        workHoursEndTime: values.workHoursEndTime,
        workingHoursTimeZone: values.workingHoursTimeZone?.value || values.workingHoursTimeZone,
      })}
    >
      {equipmentInfo.isLoading && (
        <CippFormSkeleton layout={[2, 3, 2, 2, 2, 1, 2, 2, 2, 3, 1, 1]} />
      )}
      {equipmentInfo.isSuccess && (
        <Grid container spacing={2}>
          {/* Basic Information */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Basic Information
            </Typography>
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

          {/* Booking Information */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Booking Information
            </Typography>
          </Grid>

          <Grid size={{ md: 4, xs: 12 }}>
            {/* MaximumDurationInMinutes: 0 = Unlimited, 0..2147483647 (default 1440) per Exchange/EXO spec */}
            <CippFormComponent
              type="number"
              label="Maximum Booking Duration (Minutes)"
              name="maximumDurationInMinutes"
              formControl={formControl}
              validators={{
                min: { value: 0, message: "Minimum is 0 (0 = Unlimited)" },
                max: {
                  value: 2147483647,
                  message: "Maximum is 2,147,483,647 minutes",
                },
              }}
              InputProps={{
                inputProps: { min: 0, max: 2147483647 },
              }}
              fullWidth
              helperText="Set to 0 for unlimited duration"
            />
          </Grid>

          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="number"
              label="Booking Window (Days)"
              name="bookingWindowInDays"
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
              name="automateProcessing"
              multiple={false}
              creatable={false}
              options={automateProcessingOptions}
              formControl={formControl}
            />
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Allow Recurring Meetings"
              name="allowRecurringMeetings"
              formControl={formControl}
            />
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Allow Double-Booking"
              name="allowConflicts"
              formControl={formControl}
            />
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Process External Meetings"
              name="processExternalMeetingMessages"
              formControl={formControl}
            />
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Forward to Delegates"
              name="forwardRequestsToDelegates"
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
              name="scheduleOnlyDuringWorkHours"
              formControl={formControl}
            />
          </Grid>

          <Grid size={{ md: 8, xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="Working Days"
              name="workDays"
              multiple={true}
              creatable={false}
              options={workDaysOptions}
              formControl={formControl}
            />
          </Grid>

          <Grid size={{ md: 12, xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="Timezone"
              name="workingHoursTimeZone"
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
              label="Work Hours Start Time"
              name="workHoursStartTime"
              formControl={formControl}
            />
          </Grid>

          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="time"
              label="Work Hours End Time"
              name="workHoursEndTime"
              formControl={formControl}
            />
          </Grid>

          <Divider sx={{ my: 2, width: "100%" }} />

          {/* Equipment & Location Details */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Equipment & Location Details
            </Typography>
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Department"
              name="department"
              formControl={formControl}
            />
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Company"
              name="company"
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

          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Street"
              name="streetAddress"
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
              label="State"
              name="stateOrProvince"
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

          <Grid size={{ md: 12, xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="Tags"
              name="tags"
              multiple={true}
              creatable={true}
              formControl={formControl}
            />
          </Grid>

          <Divider sx={{ my: 2, width: "100%" }} />
        </Grid>
      )}
    </CippFormPage>
  );
};

EditEquipmentMailbox.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditEquipmentMailbox;
