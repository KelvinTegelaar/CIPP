import { useEffect, useState } from "react";
import { Box, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "../../../../layouts/index";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { useRouter } from "next/router";
import { ApiGetCall } from "../../../../api/ApiCall";
import { useSettings } from "../../../../hooks/use-settings";
import CippAddAssignmentFilterForm from "../../../../components/CippFormPages/CippAddAssignmentFilterForm";

const EditAssignmentFilter = () => {
  const router = useRouter();
  const { filterId } = router.query;
  const [filterIdReady, setFilterIdReady] = useState(false);
  const tenantFilter = useSettings().currentTenant;

  const filterInfo = ApiGetCall({
    url: `/api/ListAssignmentFilters?filterId=${filterId}&tenantFilter=${tenantFilter}`,
    queryKey: `ListAssignmentFilters-${filterId}`,
    waiting: filterIdReady,
  });

  useEffect(() => {
    if (filterId) {
      setFilterIdReady(true);
      filterInfo.refetch();
    }
  }, [router.query, filterId, tenantFilter]);

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: tenantFilter,
      assignmentFilterManagementType: "devices",
    },
  });

  useEffect(() => {
    if (filterInfo.isSuccess && filterInfo.data) {
      const filter = Array.isArray(filterInfo.data) ? filterInfo.data[0] : filterInfo.data;
      
      if (filter) {
        const formValues = {
          tenantFilter: tenantFilter,
          filterId: filter.id,
          displayName: filter.displayName || "",
          description: filter.description || "",
          platform: filter.platform || "",
          rule: filter.rule || "",
          assignmentFilterManagementType: filter.assignmentFilterManagementType || "devices",
        };

        formControl.reset(formValues);
      }
    }
  }, [filterInfo.isSuccess, filterInfo.data, tenantFilter]);

  const filterName = filterInfo.data?.[0]?.displayName || filterInfo.data?.displayName;

  return (
    <>
      <CippFormPage
        formControl={formControl}
        queryKey={[`ListAssignmentFilters-${filterId}`]}
        title={filterName ? `Assignment Filter: ${filterName}` : "Assignment Filter"}
        formPageType="Edit"
        backButtonTitle="Assignment Filters"
        postUrl="/api/EditAssignmentFilter"
        hideSubmit={!filterId}
      >
        {!filterId && (
          <Alert severity="info" sx={{ m: 2 }}>
            No filter selected. Open this page from the Assignment Filters list to edit a filter.
          </Alert>
        )}
        {filterId && (
          <Box sx={{ my: 2 }}>
            <CippAddAssignmentFilterForm formControl={formControl} isEdit={true} />
          </Box>
        )}
      </CippFormPage>
    </>
  );
};

EditAssignmentFilter.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditAssignmentFilter;
