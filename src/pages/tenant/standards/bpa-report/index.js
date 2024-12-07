import { Button } from "@mui/material";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js"; // had to add an extra path here because I added an extra folder structure. We should switch to absolute pathing so we dont have to deal with relative.
import Link from "next/link";
import { EyeIcon } from "@heroicons/react/24/outline";
import { CopyAll, Delete, Edit } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Best Practice Reports";
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
      label: "Delete Template",
      type: "GET",
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
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/listBPATemplates"
      cardButton={
        <Button component={Link} href="bpa-report/builder">
          Add Template
        </Button>
      }
      actions={actions}
      simpleColumns={["Name", "Style"]}
      queryKey="ListPATemplates"
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
