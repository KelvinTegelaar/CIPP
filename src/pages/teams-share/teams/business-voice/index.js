import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Teams Business Voice";

  const actions = [
    // the modal dropdowns that were added below may not exist yet, and will need to be tested.
    {
      label: "Assign User",
      type: "POST",
      url: "/api/ExecTeamsVoicePhoneNumberAssignment",
      data: {
        PhoneNumber: "TelephoneNumber",
        TenantFilter: "TenantFilter",
        PhoneNumberType: "NumberType",
        locationOnly: false,
      },
      modalDropdown: {
        url: "/api/listUsers?TenantFilter=TenantFilter",
        labelField: "displayName",
        valueField: "userPrincipalName",
      },
      confirmText: "Select the User to assign.",
    },
    {
      label: "Unassign User",
      type: "POST",
      url: "/api/ExecRemoveTeamsVoicePhoneNumberAssignment",
      data: {
        PhoneNumber: "TelephoneNumber",
        TenantFilter: "TenantFilter",
        AssignedTo: "AssignedTo",
        PhoneNumberType: "NumberType",
      },
      confirmText: "Are you sure you want to remove the assignment?",
    },
    {
      label: "Set Emergency Location",
      type: "POST",
      url: "/api/ExecTeamsVoicePhoneNumberAssignment",
      data: {
        PhoneNumber: "TelephoneNumber",
        TenantFilter: "TenantFilter",
        locationOnly: true,
      },
      modalDropdown: {
        url: "/api/ListTeamsLisLocation?TenantFilter=TenantFilter",
        labelField: "Description",
        valueField: "LocationId",
      },
      confirmText: "Select the Emergency Location.",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "TelephoneNumber",
      "AcquiredCapabilities",
      "AssignmentStatus",
      "AssignedTo",
    ],
    actions: actions,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListTeamsVoice"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={[
        "AssignedTo",
        "TelephoneNumber",
        "AssignmentStatus",
        "NumberType",
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
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
