import { Button } from "@mui/material";
import { CippIcons } from "../../../../utils/icon-registry"
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "../../../../layouts/index";
import Link from "next/link";
import { CippPropertyListCard } from "../../../../components/CippCards/CippPropertyListCard";
import { getCippTranslation } from "../../../../utils/get-cipp-translation";
import { getCippFormatting } from "../../../../utils/get-cipp-formatting";

const Page = () => {
  const pageTitle = "JIT Role Templates";

  const actions = [
    {
      label: "Edit Template",
      icon: <CippIcons.Edit />,
      link: "/identity/administration/jit-role-templates/edit?id=[GUID]",
    },
    {
      label: "Delete Template",
      type: "POST",
      url: "/api/RemoveJITRoleTemplate",
      icon: <CippIcons.Delete />,
      data: {
        ID: "GUID",
      },
      confirmText: "Do you want to delete the template?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    children: (data) => {
      const keys = Object.keys(data).filter(
        (key) => !key.includes("@odata") && !key.includes("@data")
      );
      const properties = [];
      keys.forEach((key) => {
        if (data[key] && data[key].length > 0) {
          properties.push({
            label: getCippTranslation(key),
            value: getCippFormatting(data[key], key),
          });
        }
      });
      return (
        <CippPropertyListCard
          cardSx={{ p: 0, m: -2 }}
          title="Template Details"
          propertyItems={properties}
          actionItems={actions}
          data={data}
        />
      );
    },
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListJITRoleTemplates"
      queryKey="ListJITRoleTemplates"
      tenantInTitle={false}
      actions={actions}
      cardButton={
        <Button component={Link} href="jit-role-templates/add" startIcon={<CippIcons.AddBox />}>
          Add JIT Role Template
        </Button>
      }
      offCanvas={offCanvas}
      simpleColumns={["templateName", "roles", "createdBy", "createdDate"]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
