import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { useForm } from "react-hook-form";
import { useDialog } from "../../../hooks/use-dialog";
import { CippNotificationForm } from "../../../components/CippComponents/CippNotificationForm";

const Page = () => {
  const pageTitle = "Notification Settings";
  const notificationDialog = useDialog();

  const formControl = useForm({
    mode: "onChange",
  });

  return (
    <CippFormPage
      title={pageTitle}
      hideBackButton={true}
      hidePageType={true}
      formControl={formControl}
      resetForm={false}
      postUrl="/api/ExecNotificationConfig"
      relatedQueryKeys={["ListNotificationConfig"]}
    >
      {/* Use the reusable notification form component */}
      <CippNotificationForm
        formControl={formControl}
        showTestButton={true}
      />
    </CippFormPage>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
