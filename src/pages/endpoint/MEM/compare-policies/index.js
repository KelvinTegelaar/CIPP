import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import { ApiPostCall } from "../../../../api/ApiCall";
import { CippFormComponent } from "../../../../components/CippComponents/CippFormComponent";
import { CippFormCondition } from "../../../../components/CippComponents/CippFormCondition";
import { CippFormTenantSelector } from "../../../../components/CippComponents/CippFormTenantSelector";
import { CippCodeBlock } from "../../../../components/CippComponents/CippCodeBlock";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Stack,
  Chip,
  Skeleton,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  CompareArrows as CompareArrowsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useEffect, useMemo } from "react";
import { Grid } from "@mui/system";
import CippPageCard from "../../../../components/CippCards/CippPageCard";

const sourceTypeOptions = [
  { label: "CIPP Template", value: "template" },
  { label: "Tenant Policy", value: "tenantPolicy" },
  { label: "Community Repository", value: "communityRepo" },
];

const SourceSelector = ({ prefix, formControl, label }) => {
  const tenantValue = useWatch({ control: formControl.control, name: `${prefix}.tenantFilter` });
  const repoValue = useWatch({ control: formControl.control, name: `${prefix}.repo` });
  const branchValue = useWatch({ control: formControl.control, name: `${prefix}.branch` });

  useEffect(() => {
    if (repoValue?.addedFields?.defaultBranch) {
      formControl.setValue(`${prefix}.branch`, {
        label: repoValue.addedFields.defaultBranch,
        value: repoValue.addedFields.defaultBranch,
      });
    } else {
      formControl.setValue(`${prefix}.branch`, null);
    }
    formControl.setValue(`${prefix}.repoFile`, null);
  }, [repoValue?.value]);

  useEffect(() => {
    formControl.setValue(`${prefix}.repoFile`, null);
  }, [branchValue?.value]);

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardHeader title={label} titleTypographyProps={{ variant: "h6" }} />
      <CardContent>
        <Stack spacing={2}>
          <CippFormComponent
            type="radio"
            name={`${prefix}.type`}
            label="Source Type"
            formControl={formControl}
            options={sourceTypeOptions}
            row
          />

          <CippFormCondition
            field={`${prefix}.type`}
            compareType="is"
            compareValue="template"
            formControl={formControl}
          >
            <CippFormComponent
              type="autoComplete"
              name={`${prefix}.template`}
              label="Select Template"
              formControl={formControl}
              multiple={false}
              creatable={false}
              api={{
                url: "/api/ListIntuneTemplates",
                queryKey: `ListIntuneTemplates-${prefix}`,
                labelField: (item) =>
                  `${item.Displayname || item.displayName}${item.Type ? ` (${item.Type})` : ""}`,
                valueField: "GUID",
                addedField: { type: "Type" },
              }}
              validators={{ required: { value: true, message: "Template is required" } }}
            />
          </CippFormCondition>

          <CippFormCondition
            field={`${prefix}.type`}
            compareType="is"
            compareValue="tenantPolicy"
            formControl={formControl}
          >
            <Stack spacing={2}>
              <CippFormTenantSelector
                formControl={formControl}
                name={`${prefix}.tenantFilter`}
                type="single"
                allTenants={false}
                required={true}
                preselectedEnabled={true}
              />

              <CippFormComponent
                type="autoComplete"
                name={`${prefix}.policy`}
                label="Select Policy"
                formControl={formControl}
                multiple={false}
                creatable={false}
                isFetching={!tenantValue}
                api={
                  tenantValue
                    ? {
                        url: "/api/ListIntunePolicy",
                        queryKey: `ListIntunePolicy-${prefix}-${tenantValue?.value}`,
                        tenantFilter: tenantValue?.value,
                        labelField: (item) => {
                          const name = item.displayName || item.name || "Unnamed Policy";
                          const type = item.PolicyTypeName || item.URLName || "";
                          return type ? `${name} (${type})` : name;
                        },
                        valueField: "id",
                        addedField: { urlName: "URLName" },
                      }
                    : undefined
                }
                validators={{ required: { value: true, message: "Policy is required" } }}
              />
            </Stack>
          </CippFormCondition>

          <CippFormCondition
            field={`${prefix}.type`}
            compareType="is"
            compareValue="communityRepo"
            formControl={formControl}
          >
            <Stack spacing={2}>
              <CippFormComponent
                type="autoComplete"
                name={`${prefix}.repo`}
                label="Select Repository"
                formControl={formControl}
                multiple={false}
                creatable={false}
                api={{
                  url: "/api/ListCommunityRepos",
                  queryKey: `ListCommunityRepos-${prefix}`,
                  dataKey: "Results",
                  labelField: "FullName",
                  valueField: "FullName",
                  addedField: { defaultBranch: "DefaultBranch" },
                }}
                validators={{ required: { value: true, message: "Repository is required" } }}
              />

              <CippFormComponent
                type="autoComplete"
                name={`${prefix}.branch`}
                label="Select Branch"
                formControl={formControl}
                multiple={false}
                creatable={false}
                isFetching={!repoValue}
                api={
                  repoValue?.value
                    ? {
                        url: "/api/ExecGitHubAction",
                        queryKey: `GetBranches-${prefix}-${repoValue.value}`,
                        dataKey: "Results",
                        data: { Action: "GetBranches", FullName: repoValue.value },
                        labelField: "name",
                        valueField: "name",
                      }
                    : undefined
                }
                validators={{ required: { value: true, message: "Branch is required" } }}
              />

              <CippFormComponent
                type="autoComplete"
                name={`${prefix}.repoFile`}
                label="Select Template File"
                formControl={formControl}
                multiple={false}
                creatable={false}
                isFetching={!repoValue || !branchValue}
                api={
                  repoValue?.value && branchValue?.value
                    ? {
                        url: "/api/ExecGitHubAction",
                        queryKey: `GetFileTree-${prefix}-${repoValue.value}-${branchValue.value}`,
                        dataKey: "Results",
                        data: {
                          Action: "GetFileTree",
                          FullName: repoValue.value,
                          Branch: branchValue.value,
                        },
                        labelField: "path",
                        valueField: "path",
                      }
                    : undefined
                }
                validators={{ required: { value: true, message: "Template file is required" } }}
              />
            </Stack>
          </CippFormCondition>
        </Stack>
      </CardContent>
    </Card>
  );
};

const hasValue = (val) => val !== null && val !== undefined && val !== "";

const getDiffStatus = (row) => {
  const a = hasValue(row.ExpectedValue);
  const b = hasValue(row.ReceivedValue);
  if (a && b) return "different";
  if (a) return "onlyA";
  if (b) return "onlyB";
  return "equal";
};

const diffChipProps = {
  different: { label: "Different", color: "error" },
  onlyA: { label: "Only in A", color: "warning" },
  onlyB: { label: "Only in B", color: "info" },
  equal: { label: "Equal", color: "success" },
};

const DiffStatusChip = ({ row }) => {
  const props = diffChipProps[getDiffStatus(row)];
  return <Chip label={props.label} size="small" color={props.color} variant="outlined" />;
};

const diffRowColors = {
  different: { dark: "rgba(244, 67, 54, 0.08)", light: "rgba(244, 67, 54, 0.04)" },
  onlyA: { dark: "rgba(255, 152, 0, 0.08)", light: "rgba(255, 152, 0, 0.04)" },
  onlyB: { dark: "rgba(33, 150, 243, 0.08)", light: "rgba(33, 150, 243, 0.04)" },
  equal: { dark: "transparent", light: "transparent" },
};

const getRowColor = (row, theme) => {
  const colors = diffRowColors[getDiffStatus(row)];
  return theme.palette.mode === "dark" ? colors.dark : colors.light;
};

const formatValue = (val) => {
  if (val === null || val === undefined) return <Typography color="text.disabled">N/A</Typography>;
  if (typeof val === "object") {
    return (
      <Box
        component="pre"
        sx={{ m: 0, fontSize: "0.8rem", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {JSON.stringify(val, null, 2)}
      </Box>
    );
  }
  return String(val);
};

const Page = () => {
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      sourceA: { type: "template" },
      sourceB: { type: "template" },
    },
  });

  const compareApi = ApiPostCall({ relatedQueryKeys: [] });

  const sourceAType = useWatch({ control: formControl.control, name: "sourceA.type" });
  const sourceBType = useWatch({ control: formControl.control, name: "sourceB.type" });
  const sourceATemplate = useWatch({ control: formControl.control, name: "sourceA.template" });
  const sourceBTemplate = useWatch({ control: formControl.control, name: "sourceB.template" });
  const sourceAPolicy = useWatch({ control: formControl.control, name: "sourceA.policy" });
  const sourceBPolicy = useWatch({ control: formControl.control, name: "sourceB.policy" });
  const sourceARepoFile = useWatch({ control: formControl.control, name: "sourceA.repoFile" });
  const sourceBRepoFile = useWatch({ control: formControl.control, name: "sourceB.repoFile" });

  const isSourceReady = (type, template, policy, repoFile) =>
    type === "template"
      ? !!template?.value
      : type === "tenantPolicy"
        ? !!policy?.value
        : type === "communityRepo"
          ? !!repoFile?.value
          : false;

  const canCompare =
    isSourceReady(sourceAType, sourceATemplate, sourceAPolicy, sourceARepoFile) &&
    isSourceReady(sourceBType, sourceBTemplate, sourceBPolicy, sourceBRepoFile);

  const handleCompare = () => {
    const values = formControl.getValues();

    const buildPayload = (source) => {
      if (source.type === "template") {
        return {
          type: "template",
          templateGuid: source.template?.value,
        };
      }
      if (source.type === "communityRepo") {
        return {
          type: "communityRepo",
          fullName: source.repo?.value,
          branch: source.branch?.value,
          path: source.repoFile?.value,
        };
      }
      return {
        type: "tenantPolicy",
        tenantFilter: source.tenantFilter?.value,
        policyId: source.policy?.value,
        urlName: source.policy?.addedFields?.urlName,
      };
    };

    compareApi.mutate({
      url: "/api/ExecCompareIntunePolicy",
      data: {
        sourceA: buildPayload(values.sourceA),
        sourceB: buildPayload(values.sourceB),
      },
    });
  };

  const results = useMemo(() => {
    if (!compareApi.isSuccess) return null;
    return compareApi.data?.data || compareApi.data;
  }, [compareApi.isSuccess, compareApi.data]);

  const errorMessage = useMemo(() => {
    if (!compareApi.isError) return null;
    const errData = compareApi.error?.response?.data;
    return errData?.Results || compareApi.error?.message || "An error occurred";
  }, [compareApi.isError, compareApi.error]);

  const sourceAJson = useMemo(
    () => (results?.sourceAData ? JSON.stringify(results.sourceAData, null, 2) : ""),
    [results?.sourceAData],
  );
  const sourceBJson = useMemo(
    () => (results?.sourceBData ? JSON.stringify(results.sourceBData, null, 2) : ""),
    [results?.sourceBData],
  );

  return (
    <CippPageCard title="Compare Intune Policies" backButtonTitle="Back to Policies">
      <CardContent>
        <Stack spacing={3}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <SourceSelector prefix="sourceA" formControl={formControl} label="Source A" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SourceSelector prefix="sourceB" formControl={formControl} label="Source B" />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<CompareArrowsIcon />}
              onClick={handleCompare}
              disabled={!canCompare || compareApi.isPending}
            >
              {compareApi.isPending ? "Comparing..." : "Compare"}
            </Button>
          </Box>

          {compareApi.isPending && (
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="rectangular" height={200} />
                </Stack>
              </CardContent>
            </Card>
          )}

          {errorMessage && (
            <Alert severity="error" icon={<ErrorIcon />}>
              {errorMessage}
            </Alert>
          )}

          {results && (
            <Stack spacing={3}>
              <Alert
                severity={results.identical ? "success" : "warning"}
                icon={results.identical ? <CheckCircleIcon /> : <CompareArrowsIcon />}
              >
                {results.identical
                  ? "Policies are identical - no differences found."
                  : `${results.Results?.length || 0} difference${results.Results?.length === 1 ? "" : "s"} found between policies.`}
                <Box component="span" sx={{ display: "block", mt: 0.5 }}>
                  <strong>A:</strong> {results.sourceALabel} &mdash; <strong>B:</strong>{" "}
                  {results.sourceBLabel}
                </Box>
              </Alert>

              {!results.identical && results.Results?.length > 0 && (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Property</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Source A</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Source B</TableCell>
                        <TableCell sx={{ fontWeight: "bold", width: 120 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {results.Results.map((row, index) => (
                        <TableRow
                          key={index}
                          sx={(theme) => ({
                            backgroundColor: getRowColor(row, theme),
                          })}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>{row.Property}</TableCell>
                          <TableCell>{formatValue(row.ExpectedValue)}</TableCell>
                          <TableCell>{formatValue(row.ReceivedValue)}</TableCell>
                          <TableCell>
                            <DiffStatusChip row={row} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <Accordion variant="outlined">
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Source A Raw JSON — {results.sourceALabel}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <CippCodeBlock code={sourceAJson} language="json" type="editor" readOnly />
                </AccordionDetails>
              </Accordion>

              <Accordion variant="outlined">
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Source B Raw JSON — {results.sourceBLabel}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <CippCodeBlock code={sourceBJson} language="json" type="editor" readOnly />
                </AccordionDetails>
              </Accordion>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </CippPageCard>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
