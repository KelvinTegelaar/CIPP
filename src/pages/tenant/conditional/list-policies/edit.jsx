import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "../../../../layouts/index";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import CippFormSkeleton from "../../../../components/CippFormPages/CippFormSkeleton";
import { ApiGetCall, ApiPostCall } from "../../../../api/ApiCall";
import CippCAPolicyBuilder, {
  directoryObjectLabel,
  extractCAPolicyJSON,
} from "../../../../components/CippComponents/CippCAPolicyBuilder";
import { useSettings } from "../../../../hooks/use-settings.js";

// The assignment arrays Graph stores as object IDs. The special tokens (All, None,
// GuestsOrExternalUsers) share these arrays and are left as they are.
const DIRECTORY_FIELDS = ["includeUsers", "excludeUsers", "includeGroups", "excludeGroups"];
const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// directoryObjects/getByIds accepts at most 1000 IDs per call
const GET_BY_IDS_LIMIT = 1000;

const collectDirectoryIds = (policy) => {
  const users = policy?.conditions?.users ?? {};
  const ids = DIRECTORY_FIELDS.flatMap((field) => users[field] ?? []).filter((id) =>
    GUID_PATTERN.test(id)
  );
  return [...new Set(ids)];
};

// Swap each object ID for a { label, value } option so the editor shows names. The value stays
// the ID, which is what extractCAPolicyJSON sends back on save. An ID that did not resolve (a
// user or group deleted since it was assigned) keeps the ID as its label.
const labelDirectoryIds = (policy, names) => {
  const users = policy?.conditions?.users;
  if (!users) return policy;
  const labelled = { ...users };
  DIRECTORY_FIELDS.forEach((field) => {
    if (Array.isArray(users[field])) {
      labelled[field] = users[field].map((id) =>
        GUID_PATTERN.test(id) ? { label: names[id] ?? id, value: id } : id
      );
    }
  });
  return { ...policy, conditions: { ...policy.conditions, users: labelled } };
};

const EditCAPolicy = () => {
  const router = useRouter();
  const { id: policyId } = router.query;
  const tenantFilter = useSettings()?.currentTenant;
  const [policyData, setPolicyData] = useState(null);
  // null while the policy's user and group IDs are being resolved to names; {} when it has none
  const [directoryNames, setDirectoryNames] = useState(null);

  const formControl = useForm({ mode: "onChange" });
  const { mutateAsync: lookupDirectoryObjects } = ApiPostCall({});

  // Fetch the current policies for this tenant
  const policiesQuery = ApiGetCall({
    url: `/api/ListConditionalAccessPolicies?tenantFilter=${tenantFilter}`,
    queryKey: `CAPolicies-${tenantFilter}`,
    enabled: !!policyId && !!tenantFilter,
  });

  useEffect(() => {
    if (!policiesQuery.isSuccess || !policiesQuery.data?.Results) return undefined;
    const match = policiesQuery.data.Results.find((p) => p.id === policyId);
    if (!match?.rawjson) return undefined;
    const parsed = JSON.parse(match.rawjson);
    setPolicyData(parsed);
    setDirectoryNames(null);

    const ids = collectDirectoryIds(parsed);
    if (ids.length === 0) {
      setDirectoryNames({});
      return undefined;
    }
    const batches = [];
    for (let i = 0; i < ids.length; i += GET_BY_IDS_LIMIT) {
      batches.push({
        tenantFilter,
        ids: ids.slice(i, i + GET_BY_IDS_LIMIT),
        $select: "id,displayName,userPrincipalName,mail",
      });
    }
    let cancelled = false;
    const names = {};
    lookupDirectoryObjects({ url: "/api/ListDirectoryObjects", bulkRequest: true, data: batches })
      .then((pages) => {
        pages.forEach((page) => {
          (page?.value ?? []).forEach((obj) => {
            if (obj?.id) names[obj.id] = directoryObjectLabel(obj);
          });
        });
      })
      // A failed lookup is not fatal: the editor falls back to showing the raw IDs.
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setDirectoryNames(names);
      });
    return () => {
      cancelled = true;
    };
  }, [policiesQuery.isSuccess, policiesQuery.data, policyId, tenantFilter, lookupDirectoryObjects]);

  const existingPolicy = useMemo(
    () => (policyData && directoryNames ? labelDirectoryIds(policyData, directoryNames) : null),
    [policyData, directoryNames]
  );

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
        {policiesQuery.isLoading || (policyData && !existingPolicy) ? (
          <CippFormSkeleton layout={[2, 1, 2, 2]} />
        ) : policiesQuery.isError ? (
          <Alert severity="error">Error loading policies.</Alert>
        ) : !policyData ? (
          <Alert severity="warning">Policy not found for ID: {policyId}</Alert>
        ) : (
          <CippCAPolicyBuilder
            formControl={formControl}
            existingPolicy={existingPolicy}
            directorySearch
          />
        )}
      </Box>
    </CippFormPage>
  );
};

EditCAPolicy.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditCAPolicy;
