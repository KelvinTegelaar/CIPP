import React, { useEffect } from "react";
import { Divider, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { useSettings } from "/src/hooks/use-settings";
import { useRouter } from "next/router";
import { ApiGetCall } from "/src/api/ApiCall";
import countryList from "/src/data/countryList.json";

// Create timezone options from the provided list
const createTimezoneOptions = () => {
  const timezones = `Azores Standard Time            (UTC-01:00) Azores
Cape Verde Standard Time        (UTC-01:00) Cabo Verde Is.
UTC-02                          (UTC-02:00) Co-ordinated Universal Time-02
Greenland Standard Time         (UTC-02:00) Greenland
Mid-Atlantic Standard Time      (UTC-02:00) Mid-Atlantic - Old
Tocantins Standard Time         (UTC-03:00) Araguaina
Paraguay Standard Time          (UTC-03:00) Asuncion
E. South America Standard Time  (UTC-03:00) Brasilia
SA Eastern Standard Time        (UTC-03:00) Cayenne, Fortaleza
Argentina Standard Time         (UTC-03:00) City of Buenos Aires
Montevideo Standard Time        (UTC-03:00) Montevideo
Magallanes Standard Time        (UTC-03:00) Punta Arenas
Saint Pierre Standard Time      (UTC-03:00) Saint Pierre and Miquelon
Bahia Standard Time             (UTC-03:00) Salvador
Newfoundland Standard Time      (UTC-03:30) Newfoundland
Atlantic Standard Time          (UTC-04:00) Atlantic Time (Canada)
Venezuela Standard Time         (UTC-04:00) Caracas
Central Brazilian Standard Time (UTC-04:00) Cuiaba
SA Western Standard Time        (UTC-04:00) Georgetown, La Paz, Manaus, San Juan
Pacific SA Standard Time        (UTC-04:00) Santiago
SA Pacific Standard Time        (UTC-05:00) Bogota, Lima, Quito, Rio Branco
Eastern Standard Time (Mexico)  (UTC-05:00) Chetumal
Eastern Standard Time           (UTC-05:00) Eastern Time (US & Canada)
Haiti Standard Time             (UTC-05:00) Haiti
Cuba Standard Time              (UTC-05:00) Havana
US Eastern Standard Time        (UTC-05:00) Indiana (East)
Turks And Caicos Standard Time  (UTC-05:00) Turks and Caicos
Central America Standard Time   (UTC-06:00) Central America
Central Standard Time           (UTC-06:00) Central Time (US & Canada)
Easter Island Standard Time     (UTC-06:00) Easter Island
Central Standard Time (Mexico)  (UTC-06:00) Guadalajara, Mexico City, Monterrey
Canada Central Standard Time    (UTC-06:00) Saskatchewan
US Mountain Standard Time       (UTC-07:00) Arizona
Mountain Standard Time (Mexico) (UTC-07:00) La Paz, Mazatlan
Mountain Standard Time          (UTC-07:00) Mountain Time (US & Canada)
Yukon Standard Time             (UTC-07:00) Yukon
Pacific Standard Time (Mexico)  (UTC-08:00) Baja California
UTC-08                          (UTC-08:00) Co-ordinated Universal Time-08
Pacific Standard Time           (UTC-08:00) Pacific Time (US & Canada)
Alaskan Standard Time           (UTC-09:00) Alaska
UTC-09                          (UTC-09:00) Co-ordinated Universal Time-09
Marquesas Standard Time         (UTC-09:30) Marquesas Islands
Aleutian Standard Time          (UTC-10:00) Aleutian Islands
Hawaiian Standard Time          (UTC-10:00) Hawaii
UTC-11                          (UTC-11:00) Co-ordinated Universal Time-11
Dateline Standard Time          (UTC-12:00) International Date Line West
UTC                             (UTC) Co-ordinated Universal Time
GMT Standard Time               (UTC+00:00) Dublin, Edinburgh, Lisbon, London
Greenwich Standard Time         (UTC+00:00) Monrovia, Reykjavik
Sao Tome Standard Time          (UTC+00:00) Sao Tome
W. Europe Standard Time         (UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna
Central Europe Standard Time    (UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague
Romance Standard Time           (UTC+01:00) Brussels, Copenhagen, Madrid, Paris
Morocco Standard Time           (UTC+01:00) Casablanca
Central European Standard Time  (UTC+01:00) Sarajevo, Skopje, Warsaw, Zagreb
W. Central Africa Standard Time (UTC+01:00) West Central Africa
GTB Standard Time               (UTC+02:00) Athens, Bucharest
Middle East Standard Time       (UTC+02:00) Beirut
Egypt Standard Time             (UTC+02:00) Cairo
E. Europe Standard Time         (UTC+02:00) Chisinau
West Bank Standard Time         (UTC+02:00) Gaza, Hebron
South Africa Standard Time      (UTC+02:00) Harare, Pretoria
FLE Standard Time               (UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius
Israel Standard Time            (UTC+02:00) Jerusalem
South Sudan Standard Time       (UTC+02:00) Juba
Kaliningrad Standard Time       (UTC+02:00) Kaliningrad
Sudan Standard Time             (UTC+02:00) Khartoum
Libya Standard Time             (UTC+02:00) Tripoli
Namibia Standard Time           (UTC+02:00) Windhoek
Jordan Standard Time            (UTC+03:00) Amman
Arabic Standard Time            (UTC+03:00) Baghdad
Syria Standard Time             (UTC+03:00) Damascus
Turkey Standard Time            (UTC+03:00) Istanbul
Arab Standard Time              (UTC+03:00) Kuwait, Riyadh
Belarus Standard Time           (UTC+03:00) Minsk
Russian Standard Time           (UTC+03:00) Moscow, St Petersburg
E. Africa Standard Time         (UTC+03:00) Nairobi
Volgograd Standard Time         (UTC+03:00) Volgograd
Iran Standard Time              (UTC+03:30) Tehran
Arabian Standard Time           (UTC+04:00) Abu Dhabi, Muscat
Astrakhan Standard Time         (UTC+04:00) Astrakhan, Ulyanovsk
Azerbaijan Standard Time        (UTC+04:00) Baku
Russia Time Zone 3              (UTC+04:00) Izhevsk, Samara
Mauritius Standard Time         (UTC+04:00) Port Louis
Saratov Standard Time           (UTC+04:00) Saratov
Georgian Standard Time          (UTC+04:00) Tbilisi
Caucasus Standard Time          (UTC+04:00) Yerevan
Afghanistan Standard Time       (UTC+04:30) Kabul
West Asia Standard Time         (UTC+05:00) Ashgabat, Tashkent
Qyzylorda Standard Time         (UTC+05:00) Astana
Ekaterinburg Standard Time      (UTC+05:00) Ekaterinburg
Pakistan Standard Time          (UTC+05:00) Islamabad, Karachi
India Standard Time             (UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi
Sri Lanka Standard Time         (UTC+05:30) Sri Jayawardenepura
Nepal Standard Time             (UTC+05:45) Kathmandu
Central Asia Standard Time      (UTC+06:00) Bishkek
Bangladesh Standard Time        (UTC+06:00) Dhaka
Omsk Standard Time              (UTC+06:00) Omsk
Myanmar Standard Time           (UTC+06:30) Yangon (Rangoon)
SE Asia Standard Time           (UTC+07:00) Bangkok, Hanoi, Jakarta
Altai Standard Time             (UTC+07:00) Barnaul, Gorno-Altaysk
W. Mongolia Standard Time       (UTC+07:00) Hovd
North Asia Standard Time        (UTC+07:00) Krasnoyarsk
N. Central Asia Standard Time   (UTC+07:00) Novosibirsk
Tomsk Standard Time             (UTC+07:00) Tomsk
China Standard Time             (UTC+08:00) Beijing, Chongqing, Hong Kong SAR, Urumqi
North Asia East Standard Time   (UTC+08:00) Irkutsk
Singapore Standard Time         (UTC+08:00) Kuala Lumpur, Singapore
W. Australia Standard Time      (UTC+08:00) Perth
Taipei Standard Time            (UTC+08:00) Taipei
Ulaanbaatar Standard Time       (UTC+08:00) Ulaanbaatar
Aus Central W. Standard Time    (UTC+08:45) Eucla
Transbaikal Standard Time       (UTC+09:00) Chita
Tokyo Standard Time             (UTC+09:00) Osaka, Sapporo, Tokyo
North Korea Standard Time       (UTC+09:00) Pyongyang
Korea Standard Time             (UTC+09:00) Seoul
Yakutsk Standard Time           (UTC+09:00) Yakutsk
Cen. Australia Standard Time    (UTC+09:30) Adelaide
AUS Central Standard Time       (UTC+09:30) Darwin
E. Australia Standard Time      (UTC+10:00) Brisbane
AUS Eastern Standard Time       (UTC+10:00) Canberra, Melbourne, Sydney
West Pacific Standard Time      (UTC+10:00) Guam, Port Moresby
Tasmania Standard Time          (UTC+10:00) Hobart
Vladivostok Standard Time       (UTC+10:00) Vladivostok
Lord Howe Standard Time         (UTC+10:30) Lord Howe Island
Bougainville Standard Time      (UTC+11:00) Bougainville Island
Russia Time Zone 10             (UTC+11:00) Chokurdakh
Magadan Standard Time           (UTC+11:00) Magadan
Norfolk Standard Time           (UTC+11:00) Norfolk Island
Sakhalin Standard Time          (UTC+11:00) Sakhalin
Central Pacific Standard Time   (UTC+11:00) Solomon Is., New Caledonia
Russia Time Zone 11             (UTC+12:00) Anadyr, Petropavlovsk-Kamchatsky
New Zealand Standard Time       (UTC+12:00) Auckland, Wellington
UTC+12                          (UTC+12:00) Co-ordinated Universal Time+12
Fiji Standard Time              (UTC+12:00) Fiji
Kamchatka Standard Time         (UTC+12:00) Petropavlovsk-Kamchatsky - Old
Chatham Islands Standard Time   (UTC+12:45) Chatham Islands
UTC+13                          (UTC+13:00) Co-ordinated Universal Time+13
Tonga Standard Time             (UTC+13:00) Nuku'alofa
Samoa Standard Time             (UTC+13:00) Samoa
Line Islands Standard Time      (UTC+14:00) Kiritimati Island`;

  return timezones.split('\n').map(line => {
    const parts = line.trim().split(/\s{2,}/);
    if (parts.length >= 2) {
      return {
        value: parts[0].trim(),
        label: parts[1].trim(),
      };
    }
    return null;
  }).filter(Boolean);
};

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
  { value: "AllDays", label: "All Days" }
];

// Automation Processing Options
const automateProcessingOptions = [
  { value: "None", label: "None - No processing" },
  { value: "AutoUpdate", label: "AutoUpdate - Accept/Decline but not delete" },
  { value: "AutoAccept", label: "AutoAccept - Accept and delete" }
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
        tags: room.tags?.map(tag => ({ label: tag, value: tag })) || [],

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

        // Calendar Configuration
        WorkDays: room.WorkDays?.split(',')?.map(day => ({ 
          label: day.trim(), 
          value: day.trim() 
        })) || [],
        WorkHoursStartTime: room.WorkHoursStartTime,
        WorkHoursEndTime: room.WorkHoursEndTime,
        WorkingHoursTimeZone: room.WorkingHoursTimeZone ? {
          value: room.WorkingHoursTimeZone,
          label: createTimezoneOptions().find(tz => tz.value === room.WorkingHoursTimeZone)?.label || room.WorkingHoursTimeZone
        } : null
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
        countryOrRegion: values.countryOrRegion?.value || values.countryOrRegion,
        
        // Room Equipment
        audioDeviceName: values.audioDeviceName?.trim(),
        videoDeviceName: values.videoDeviceName?.trim(),
        displayDeviceName: values.displayDeviceName?.trim(),
        
        // Room Features
        isWheelChairAccessible: values.isWheelChairAccessible,
        phone: values.phone?.trim(),
        tags: values.tags?.map(tag => tag.value),

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

        // Calendar Configuration
        WorkDays: values.WorkDays?.map(day => day.value).join(','),
        WorkHoursStartTime: values.WorkHoursStartTime,
        WorkHoursEndTime: values.WorkHoursEndTime,
        WorkingHoursTimeZone: values.WorkingHoursTimeZone?.value || values.WorkingHoursTimeZone,
      })}
    >
      <Grid container spacing={2}>
        {/* Basic Information */}
        <Grid item size={{ xs: 12 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Basic Information</Typography>
        </Grid>

        <Grid item size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Display Name"
            name="displayName"
            formControl={formControl}
            validators={{ required: "Display Name is required" }}
          />
        </Grid>

        <Grid item size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Hidden From Address Lists"
            name="hiddenFromAddressListsEnabled"
            formControl={formControl}
          />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        {/* Booking Settings */}
        <Grid item size={{ xs: 12 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Booking Settings</Typography>
        </Grid>

        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="number"
            label="Room Capacity"
            name="capacity"
            formControl={formControl}
            InputProps={{
              inputProps: { min: 0 }
            }}
          />
        </Grid>

        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="number"
            label="Maximum Booking Duration (Minutes)"
            name="MaximumDurationInMinutes"
            formControl={formControl}
            validators={{ 
              min: { value: 1, message: "Minimum duration is 1 minute" },
              max: { value: 1440, message: "Maximum duration is 1440 minutes (24 hours)" }
            }}
            InputProps={{
              inputProps: { min: 1, max: 1440 }
            }}
            fullWidth 
          />
        </Grid>

        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="number"
            label="Booking Window (Days)"
            name="BookingWindowInDays"
            formControl={formControl}
            validators={{ 
              min: { value: 0, message: "Minimum is 0 days" },
              max: { value: 1080, message: "Maximum is 1080 days (3 years)" }
            }}
            InputProps={{
              inputProps: { min: 0, max: 1080 }
            }}
            fullWidth 
          />
        </Grid>

        <Grid item size={{ md: 4, xs: 12 }}>
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

        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Allow Recurring Meetings"
            name="AllowRecurringMeetings"
            formControl={formControl}
          />
        </Grid>

        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Allow Double-Booking"
            name="AllowConflicts"
            formControl={formControl}
          />
        </Grid>

        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Process External Meetings"
            name="ProcessExternalMeetingMessages"
            formControl={formControl}
          />
        </Grid>

        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Enforce Room Capacity"
            name="EnforceCapacity"
            formControl={formControl}
          />
        </Grid>

        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Forward to Delegates"
            name="ForwardRequestsToDelegates"
            formControl={formControl}
          />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        {/* Working Hours */}
        <Grid item size={{ xs: 12 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Working Hours</Typography>
        </Grid>

        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Schedule Only During Work Hours"
            name="ScheduleOnlyDuringWorkHours"
            formControl={formControl}
          />
        </Grid>

        <Grid item size={{ md: 8, xs: 12 }}>
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

        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="autoComplete"
            label="Timezone"
            name="WorkingHoursTimeZone"
            options={createTimezoneOptions()}
            multiple={false}
            creatable={false}
            formControl={formControl}
          />
        </Grid>

        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="time"
            label="Work Hours Start"
            name="WorkHoursStartTime"
            formControl={formControl}
          />
        </Grid>

        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="time"
            label="Work Hours End"
            name="WorkHoursEndTime"
            formControl={formControl}
          />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        {/* Room Facilities */}
        <Grid item size={{ xs: 12 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Room Facilities & Equipment</Typography>
        </Grid>

        <Grid item size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Wheelchair Accessible"
            name="isWheelChairAccessible"
            formControl={formControl}
          />
        </Grid>

        <Grid item size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Phone"
            name="phone"
            formControl={formControl}
          />
        </Grid>

        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Audio Device"
            name="audioDeviceName"
            formControl={formControl}
          />
        </Grid>

        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Video Device"
            name="videoDeviceName"
            formControl={formControl}
          />
        </Grid>

        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Display Device"
            name="displayDeviceName"
            formControl={formControl}
          />
        </Grid>

        <Grid item size={{ xs: 12 }}>
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
        <Grid item size={{ xs: 12 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Location Information</Typography>
        </Grid>

        <Grid item size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Building"
            name="building"
            formControl={formControl}
          />
        </Grid>

        <Grid item size={{ md: 3, xs: 12 }}>
          <CippFormComponent
            type="number"
            label="Floor"
            name="floor"
            formControl={formControl}
          />
        </Grid>

        <Grid item size={{ md: 3, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Floor Label"
            name="floorLabel"
            formControl={formControl}
          />
        </Grid>

        <Grid item size={{ md: 12, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Street Address"
            name="street"
            formControl={formControl}
          />
        </Grid>

        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="City"
            name="city"
            formControl={formControl}
          />
        </Grid>

        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="State/Province"
            name="state"
            formControl={formControl}
          />
        </Grid>

        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Postal Code"
            name="postalCode"
            formControl={formControl}
          />
        </Grid>

        <Grid item size={{ md: 12, xs: 12 }}>
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
    </CippFormPage>
  );
};

EditRoomMailbox.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditRoomMailbox;