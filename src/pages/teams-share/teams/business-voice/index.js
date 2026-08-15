import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { useCippReportDB } from "../../../../components/CippComponents/CippReportDBControls";
import { PersonAdd, PersonRemove, LocationOn } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Teams Business Voice";

  const reportDB = useCippReportDB({
    apiUrl: "/api/ListTeamsVoice",
    queryKey: "ListTeamsVoice",
    cacheName: "TeamsVoice",
    syncTitle: "Sync Teams Business Voice Report",
    allowToggle: true,
    defaultCached: false,
  });

  const actions = [
    // the modal dropdowns that were added below may not exist yet, and will need to be tested.
    {
      label: "Assign User",
      type: "POST",
      icon: <PersonAdd />,
      url: "/api/ExecTeamsVoicePhoneNumberAssignment",
      data: {
        PhoneNumber: "TelephoneNumber",
        PhoneNumberType: "NumberType",
        locationOnly: false,
      },
      fields: [
        {
          type: "autoComplete",
          name: "input",
          label: "Select User",
          multiple: false,
          creatable: false,
          api: {
            url: "/api/ListGraphRequest",
            queryKey: "TeamsVoiceAssignableUsers",
            dataKey: "Results",
            data: {
              Endpoint: "users",
              manualPagination: true,
              $select: "id,userPrincipalName,displayName",
              $count: true,
              $orderby: "displayName",
              $top: 999,
            },
            labelField: (input) => `${input.displayName} (${input.userPrincipalName})`,
            valueField: "userPrincipalName",
          },
        },
      ],
      confirmText: "Select the User to assign the phone number to.",
    },
    {
      label: "Unassign User",
      type: "POST",
      icon: <PersonRemove />,
      url: "/api/ExecRemoveTeamsVoicePhoneNumberAssignment",
      data: {
        PhoneNumber: "TelephoneNumber",
        AssignedTo: "AssignedTo",
        PhoneNumberType: "NumberType",
      },
      confirmText: "Are you sure you want to remove the assignment?",
    },
    {
      label: "Set Emergency Location",
      type: "POST",
      icon: <LocationOn />,
      url: "/api/ExecTeamsVoicePhoneNumberAssignment",
      data: {
        PhoneNumber: "TelephoneNumber",
        locationOnly: true,
      },
      fields: [
        {
          type: "autoComplete",
          name: "input",
          label: "Emergency Location",
          api: {
            url: "/api/ListTeamsLisLocation",
            queryKey: "TeamsLisLocations",
            // Description is optional on a location, so fall back to the place name and
            // then the street address rather than rendering "No label found".
            labelField: (location) =>
              location.Description ||
              location.Location ||
              [location.HouseNumber, location.StreetName, location.City]
                .filter(Boolean)
                .join(" ") ||
              location.LocationId,
            valueField: "LocationId",
          },
        },
      ],
      confirmText: "Select the Emergency Location.",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "TelephoneNumber",
      "AcquiredCapabilities",
      "AssignmentStatus",
      "AssignedTo",
      "EmergencyLocation",
    ],
    actions: actions,
  };

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={reportDB.resolvedApiUrl}
        queryKey={reportDB.resolvedQueryKey}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={[
          ...reportDB.cacheColumns,
          "AssignedTo.userPrincipalName",
          "TelephoneNumber",
          "AssignmentStatus",
          "NumberType",
          "EmergencyLocation",
          "AcquiredCapabilities",
          "IsoCountryCode",
          "PlaceName",
          "ActivationState",
          "IsOperatorConnect",
          "AcquisitionDate",
        ]}
        filterlist={[
          {
            filterName: "Unassigned User Numbers",
            filter:
              "Complex: AssignmentStatus eq Unassigned; AcquiredCapabilities like UserAssignment",
          },
        ]}
        dataSourceControls={reportDB.controls}
      />
      {reportDB.syncDialog}
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>;

export default Page;
