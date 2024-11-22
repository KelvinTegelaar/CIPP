import { useForm } from "react-hook-form";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippSchedulerForm from "../../../components/CippFormPages/CippSchedulerForm";
import { useRouter } from "next/router";

const Page = () => {
  const formControl = useForm({ mode: "onChange" });
  const router = useRouter();
  return (
    <CippFormPage
      queryKey={["ListScheduledItems-Edit", "ListScheduledItems-hidden", "ListScheduledItems"]}
      backButtonTitle="Scheduler"
      formPageType={router.query.id ? "Edit" : router.query.Clone ? "Clone" : "Add"}
      formControl={formControl}
      title="Scheduler"
      resetForm={false}
      hideSubmit={true}
    >
      <CippSchedulerForm formControl={formControl} />
    </CippFormPage>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
