import { useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { CloudSync, Edit, Business, Work, Badge } from "@mui/icons-material";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import { CippAddContactDrawer } from "../../../../components/CippComponents/CippAddContactDrawer";
import { CippDeployContactTemplateDrawer } from "../../../../components/CippComponents/CippDeployContactTemplateDrawer";

const Page = () => {
  const pageTitle = "Contacts";
  const cardButtonPermissions = ["Exchange.Contact.ReadWrite"];
  const router = useRouter();

  const handleCardClick = useCallback((contact) => {
    router.push(`/email/administration/contacts/edit?id=${encodeURIComponent(contact.Guid || contact.id || "")}`);
  }, [router]);

  // Card view configuration (works for both mobile and desktop)
  const cardConfig = {
    title: "DisplayName",
    subtitle: "WindowsEmailAddress",
    avatar: {
      field: "DisplayName",
    },
    badges: [
      {
        field: "IsDirSynced",
        conditions: {
          true: { label: "On-Prem Synced", color: "info", icon: <CloudSync fontSize="small" />, tooltip: "Synced from on-premises Active Directory" },
          false: { label: "Cloud", color: "default", tooltip: "Cloud-only contact" },
        },
      },
    ],
    extraFields: [
      { field: "Company", icon: <Business />, maxLines: 1 },
      { field: "Title", icon: <Work />, maxLines: 1 },
    ],
    // Additional fields shown only on desktop cards
    desktopFields: [
      { field: "Department", label: "Department", icon: <Badge /> },
    ],
    // Grid sizing for consistent card widths
      cardGridProps: {
        md: 6,
        lg: 4,
      },
    mobileQuickActions: [
      "Edit Contact",
      "Remove Contact",
    ],
    maxQuickActions: 8,
  };

  const actions = useMemo(
    () => [
      {
        label: "Edit Contact",
        link: "/email/administration/contacts/edit?id=[Guid]",
        multiPost: false,
        postEntireRow: true,
        icon: <Edit />,
        color: "warning",
        condition: (row) => !row.IsDirSynced,
        category: "edit",
        quickAction: true,
      },
      {
        label: "Set Source of Authority",
        type: "POST",
        url: "/api/ExecSetCloudManaged",
        icon: <CloudSync />,
        data: {
          ID: "graphId",
          displayName: "DisplayName",
          type: "!Contact",
        },
        // Pre-select the current source of authority; leave unselected when the
        // selected rows have mixed states
        defaultvalues: (row) => {
          const states = [
            ...new Set((Array.isArray(row) ? row : [row]).map((r) => r?.IsDirSynced === true)),
          ];
          return states.length === 1 ? { isCloudManaged: String(!states[0]) } : {};
        },
        fields: [
          {
            type: "radio",
            name: "isCloudManaged",
            label: "Source of Authority",
            options: [
              { label: "Cloud Managed", value: true },
              { label: "On-Premises Managed", value: false },
            ],
            validators: {
              required: "Please select a source of authority",
              validate: (value, formValues, row) => {
                const states = [
                  ...new Set(
                    (Array.isArray(row) ? row : [row]).map((r) => r?.IsDirSynced === true),
                  ),
                ];
                if (states.length === 1 && String(value) === String(!states[0])) {
                  return "Source of authority is unchanged";
                }
                return true;
              },
            },
          },
        ],
        confirmText:
          "Are you sure you want to change the source of authority for '[DisplayName]'? Setting it to On-Premises Managed will take until the next sync cycle to show the change.",
        multiPost: false,
        // The SOA API targets the Graph org contact (graphId), which only exists for
        // contacts that are or were directory-synced; cloud-native mail contacts have
        // no Graph counterpart and the request would be meaningless
        condition: (row) => !!row?.graphId,
        category: "manage",
      },
      {
        label: "Remove Contact",
        type: "POST",
        url: "/api/RemoveContact",
        data: {
          GUID: "Guid",
          mail: "WindowsEmailAddress",
        },
        confirmText:
          "Are you sure you want to delete this contact? Remember this will not work if the contact is AD Synced.",
        color: "error",
        icon: <TrashIcon />,
        condition: (row) => !row.IsDirSynced,
        category: "danger",
        quickAction: true,
      },
    ],
    []
  );

  const simpleColumns = ["DisplayName", "WindowsEmailAddress", "Company", "IsDirSynced"];
  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListContacts"
      actions={actions}
      simpleColumns={simpleColumns}
      cardButton={
        <>
          <CippAddContactDrawer requiredPermissions={cardButtonPermissions} />
          <CippDeployContactTemplateDrawer requiredPermissions={cardButtonPermissions} />
        </>
      }
      cardConfig={cardConfig}
      onCardClick={handleCardClick}
      offCanvasOnRowClick={true}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;
export default Page;
