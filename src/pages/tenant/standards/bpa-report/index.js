import { Button } from "@mui/material";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js"; // had to add an extra path here because I added an extra folder structure. We should switch to absolute pathing so we dont have to deal with relative.
import Link from "next/link";
import { EyeIcon } from "@heroicons/react/24/outline";
import { CopyAll, Delete, Edit, AddBox, GitHub, Sync } from "@mui/icons-material";
import { ApiGetCall } from "/src/api/ApiCall";
import { Stack } from "@mui/system";
import { BPASyncDialog } from "/src/components/CippComponents/BPASyncDialog";
import { useDialog } from "/src/hooks/use-dialog";

const Page = () => {
  const pageTitle = "Best Practice Reports";
  const bpaDialog = useDialog();
  const integrations = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "Integrations",
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const actions = [
    {
      label: "View Report",
      link: "/tenant/standards/bpa-report/view?id=[Name]",
      icon: <EyeIcon />,
      color: "success",
      target: "_self",
    },
    {
      label: "Edit Template",
      //when using a link it must always be the full path /identity/administration/users/[id] for example.
      link: "/tenant/standards/bpa-report/builder?id=[Name]",
      icon: <Edit />,
      color: "success",
      target: "_self",
    },
    {
      label: "Clone & Edit Template",
      link: "/tenant/standards/bpa-report/builder?id=[Name]&clone=true",
      icon: <CopyAll />,
      color: "success",
      target: "_self",
    },
    {
      label: "Save to GitHub",
      type: "POST",
      url: "/api/ExecCommunityRepo",
      icon: <GitHub />,
      data: {
        Action: "UploadTemplate",
        GUID: "GUID",
      },
      fields: [
        {
          label: "Repository",
          name: "FullName",
          type: "select",
          api: {
            url: "/api/ListCommunityRepos",
            data: {
              WriteAccess: true,
            },
            queryKey: "CommunityRepos-Write",
            dataKey: "Results",
            valueField: "FullName",
            labelField: "FullName",
          },
          multiple: false,
          creatable: false,
          required: true,
          validators: {
            required: { value: true, message: "This field is required" },
          },
        },
        {
          label: "Commit Message",
          placeholder: "Enter a commit message for adding this file to GitHub",
          name: "Message",
          type: "textField",
          multiline: true,
          required: true,
          rows: 4,
        },
      ],
      confirmText: "Are you sure you want to save this template to the selected repository?",
      condition: () => integrations.isSuccess && integrations?.data?.GitHub?.Enabled,
    },
    {
      label: "Delete Template",
      type: "POST",
      url: "/api/RemoveBPATemplate",
      data: {
        TemplateName: "Name",
      },
      icon: <Delete />,
      confirmText: "Are you sure you want to delete this template?",
      multiPost: false,
    },
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/listBPATemplates"
        cardButton={
          <Stack direction="row" spacing={1}>
            <Button component={Link} href="bpa-report/builder" startIcon={<AddBox />}>
              Add Template
            </Button>
            <Button onClick={bpaDialog.handleOpen} startIcon={<Sync />}>
              Force Sync
            </Button>
          </Stack>
        }
        actions={actions}
        simpleColumns={["Name", "Style"]}
        queryKey="ListBPATemplates"
      />
      <BPASyncDialog createDialog={bpaDialog} />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
