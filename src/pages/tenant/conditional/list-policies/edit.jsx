import React, { useEffect, useState } from "react";
import { Alert, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import CippFormSkeleton from "../../../../components/CippFormPages/CippFormSkeleton";
import { ApiGetCall } from "../../../../api/ApiCall";
import CippCAPolicyBuilder, {
  extractCAPolicyJSON,
} from "../../../../components/CippComponents/CippCAPolicyBuilder";
import { useSettings } from "../../../../hooks/use-settings.js";

const EditCAPolicy = () => {
  const router = useRouter();
  const { id: policyId } = router.query;
  const tenantFilter = useSettings()?.currentTenant;
  const [policyData, setPolicyData] = useState(null);

  const formControl = useForm({ mode: "onChange" });

  // Fetch the current policies for this tenant
  const policiesQuery = ApiGetCall({
    url: `/api/ListConditionalAccessPolicies?tenantFilter=${tenantFilter}`,
    queryKey: `CAPolicies-${tenantFilter}`,
    enabled: !!policyId && !!tenantFilter,
  });

  useEffect(() => {
    if (policiesQuery.isSuccess && policiesQuery.data?.Results) {
      const match = policiesQuery.data.Results.find((p) => p.id === policyId);
      if (match?.rawjson) {
        const parsed = JSON.parse(match.rawjson);
        setPolicyData(parsed);
      }
    }
  }, [policiesQuery.isSuccess, policiesQuery.data, policyId]);

  const dataFormatter = (values) => {
    const cleaned = extractCAPolicyJSON(values);
    return {
      tenantFilter,
      PolicyId: policyId,
      PolicyBody: cleaned,
    };
  };

  return (
    <CippFormPage
      title={`Edit ${policyData?.displayName || "CA Policy"}`}
      formControl={formControl}
      queryKey={[`CAPolicies-${tenantFilter}`]}
      backButtonTitle="Conditional Access Policies"
      postUrl="/api/ExecEditCAPolicyFull"
      customDataformatter={dataFormatter}
      formPageType="Edit"
    >
      <Box sx={{ my: 2 }}>
        {policiesQuery.isLoading ? (
          <CippFormSkeleton layout={[2, 1, 2, 2]} />
        ) : policiesQuery.isError ? (
          <Alert severity="error">Error loading policies.</Alert>
        ) : !policyData ? (
          <Alert severity="warning">Policy not found for ID: {policyId}</Alert>
        ) : (
          <CippCAPolicyBuilder formControl={formControl} existingPolicy={policyData} />
        )}
      </Box>
    </CippFormPage>
  );
};

EditCAPolicy.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditCAPolicy;
