import {
  Alert,
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Divider,
} from "@mui/material";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import CippFormSkeleton from "../../../../components/CippFormPages/CippFormSkeleton";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { ApiGetCall } from "../../../../api/ApiCall";
import { useSettings } from "../../../../hooks/use-settings";
import { useEffect, useMemo } from "react";

// Structured clone helper for older runtimes
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

const generateGuid = () => {
  const wrap = (val) => `{${val}}`;
  if (typeof crypto !== "undefined" && crypto.randomUUID) return wrap(crypto.randomUUID());
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return wrap(`${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`);
};

const buildGroupEntryFromDefinitions = ({
  idDef,
  autoresolveDef,
  keywordDef,
  idValue = "",
  autoresolveValue = "",
  keywordValue = "",
} = {}) => {
  const children = [];

  if (idDef) {
    children.push({
      "@odata.type": "#microsoft.graph.deviceManagementConfigurationSimpleSettingInstance",
      settingDefinitionId: idDef,
      simpleSettingValue: {
        "@odata.type": "#microsoft.graph.deviceManagementConfigurationStringSettingValue",
        value: idValue,
      },
    });
  }

  if (autoresolveDef) {
    children.push({
      "@odata.type": "#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance",
      settingDefinitionId: autoresolveDef,
      choiceSettingValue: { value: autoresolveValue, children: [] },
    });
  }

  if (keywordDef) {
    children.push({
      "@odata.type": "#microsoft.graph.deviceManagementConfigurationSimpleSettingInstance",
      settingDefinitionId: keywordDef,
      simpleSettingValue: {
        "@odata.type": "#microsoft.graph.deviceManagementConfigurationStringSettingValue",
        value: keywordValue,
      },
    });
  }

  return { children };
};

const normalizeCollection = (collection) => {
  if (!collection) return [];
  return Array.isArray(collection) ? collection : [collection];
};

const EditReusableSettingsTemplate = () => {
  const router = useRouter();
  const { id: rawId } = router.query;
  const { currentTenant } = useSettings();

  const normalizedId = useMemo(() => {
    if (typeof rawId === "string") return rawId;
    if (Array.isArray(rawId) && rawId.length > 0) return rawId[0];
    return undefined;
  }, [rawId]);

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: currentTenant,
      GUID: normalizedId,
    },
  });

  const templateQuery = ApiGetCall({
    url: "/api/ListIntuneReusableSettingTemplates",
    data: normalizedId ? { id: normalizedId } : undefined,
    queryKey: `ReusableSettingTemplate-${normalizedId}`,
    waiting: !!normalizedId,
  });

  const templateData = Array.isArray(templateQuery.data)
    ? templateQuery.data[0]
    : templateQuery.data;

  const normalizedTemplate = useMemo(() => {
    if (!templateData) return null;
    return {
      ...templateData,
      // Normalize all known casing variants to the canonical RawJSON property
      RawJSON: templateData.RawJSON ?? templateData.RAWJson ?? templateData.RAWJSON,
    };
  }, [templateData]);

  const parsedRaw = useMemo(() => {
    if (!normalizedTemplate?.RawJSON) return null;
    try {
      return JSON.parse(normalizedTemplate.RawJSON);
    } catch (e) {
      return null;
    }
  }, [normalizedTemplate]);

  // Strip the group collection out of the parsed RAW for cleaner form state
  const sanitizedParsedRaw = useMemo(() => {
    if (!parsedRaw) return null;
    const clone = deepClone(parsedRaw);
    if (clone?.settingInstance?.groupSettingCollectionValue) {
      delete clone.settingInstance.groupSettingCollectionValue;
    }
    return clone;
  }, [parsedRaw]);

  const groupCollection = useMemo(() => {
    const source =
      parsedRaw?.settingInstance?.groupSettingCollectionValue ||
      templateData?.settingInstance?.groupSettingCollectionValue ||
      [];
    return normalizeCollection(source);
  }, [parsedRaw, templateData]);

  const groupChildDefinitions = useMemo(() => {
    const first = groupCollection?.[0]?.children || [];
    return {
      idDef: first.find((c) => c.settingDefinitionId?.toLowerCase().includes("_id"))
        ?.settingDefinitionId,
      autoresolveDef: first.find((c) =>
        c.settingDefinitionId?.toLowerCase().includes("_autoresolve"),
      )?.settingDefinitionId,
      keywordDef: first.find((c) => c.settingDefinitionId?.toLowerCase().includes("_keyword"))
        ?.settingDefinitionId,
    };
  }, [groupCollection]);

  useEffect(() => {
    if (groupCollection) {
      formControl.setValue("groupSettingCollectionValue", groupCollection);
      if (sanitizedParsedRaw) {
        formControl.setValue("parsedRAWJson", sanitizedParsedRaw);
      }
    }
  }, [groupCollection, sanitizedParsedRaw, formControl]);

  useEffect(() => {
    if (normalizedTemplate) {
      formControl.setValue(
        "displayName",
        normalizedTemplate.displayName || normalizedTemplate.name,
      );
      formControl.setValue(
        "description",
        normalizedTemplate.description || normalizedTemplate.Description,
      );
    }
  }, [normalizedTemplate, formControl]);

  /**
   * Convert RHF form values into the API payload while preserving Graph @odata fields.
   * - Flattens react-hook-form autocomplete objects to their .value.
   * - Restores @odata.* keys from the original template to avoid dot-notation loss from RHF.
   * - Syncs displayName/description into parsed RAW JSON and reinserts the edited groupSettingCollectionValue.
   * - Builds the final payload expected by /api/AddIntuneReusableSettingTemplate, including tenant fallback.
   */
  const customDataFormatter = useMemo(() => {
    const getOriginalValueByPath = (obj, path) => {
      if (!obj) return undefined;
      const keys = path.split(".");
      let current = obj;
      for (const key of keys) {
        if (current && typeof current === "object" && key in current) {
          current = current[key];
        } else {
          return undefined;
        }
      }
      return current;
    };

    const extractValues = (obj) => {
      if (obj === null || obj === undefined) return obj;

      if (
        obj &&
        typeof obj === "object" &&
        obj.hasOwnProperty("value") &&
        obj.hasOwnProperty("label")
      ) {
        return obj.value;
      }

      if (Array.isArray(obj)) {
        return obj.map((item) => extractValues(item));
      }

      if (typeof obj === "object") {
        const result = {};
        Object.keys(obj).forEach((key) => {
          const value = extractValues(obj[key]);

          if (key.endsWith("@odata") && value && typeof value === "object") {
            // Restore @odata.* keys from the original template to avoid RHF dot-notation artifacts
            Object.keys(value).forEach((odataKey) => {
              const baseKey = key.replace("@odata", "");
              const originalKey = `${baseKey}@odata.${odataKey}`;
              const originalValue = getOriginalValueByPath(normalizedTemplate, originalKey);
              if (originalValue !== undefined) {
                result[originalKey] = originalValue;
              }
            });
          } else {
            result[key] = value;
          }
        });
        return result;
      }

      return obj;
    };

    return (values) => {
      const processedValues = extractValues(values) || {};

      // Sync template/policy name & description into parsed RAW JSON, and merge edited group collection
      if (processedValues.parsedRAWJson) {
        if (processedValues.displayName) {
          processedValues.parsedRAWJson.displayName = processedValues.displayName;
        }
        if (processedValues.description) {
          processedValues.parsedRAWJson.description = processedValues.description;
        }

        if (
          processedValues.groupSettingCollectionValue &&
          processedValues.parsedRAWJson.settingInstance
        ) {
          processedValues.parsedRAWJson.settingInstance.groupSettingCollectionValue =
            processedValues.groupSettingCollectionValue;
        }
      }

      return {
        GUID: processedValues.GUID || normalizedId,
        displayName: processedValues.displayName,
        description: processedValues.description,
        package: processedValues.package,
        rawJSON: JSON.stringify(processedValues.parsedRAWJson || processedValues, null, 2),
        tenantFilter: processedValues.tenantFilter || currentTenant,
      };
    };
  }, [currentTenant, normalizedId, normalizedTemplate]);

  const { fields, append, remove } = useFieldArray({
    control: formControl.control,
    name: "groupSettingCollectionValue",
  });

  const createEmptyEntry = () => {
    return buildGroupEntryFromDefinitions({
      ...groupChildDefinitions,
      idValue: generateGuid(),
    });
  };

  return (
    <CippFormPage
      title={
        normalizedTemplate?.displayName ||
        normalizedTemplate?.name ||
        normalizedTemplate?.Displayname ||
        "Reusable Settings Template"
      }
      formControl={formControl}
      queryKey={[`ReusableSettingTemplate-${normalizedId}`, "ListIntuneReusableSettingTemplates"]}
      backButtonTitle="Reusable Settings Templates"
      postUrl="/api/AddIntuneReusableSettingTemplate"
      backUrl="/endpoint/MEM/reusable-settings-templates"
      customDataformatter={customDataFormatter}
      formPageType="Edit"
      resetForm={false}
    >
      <Box sx={{ my: 2 }}>
        {templateQuery.isLoading ? (
          <CippFormSkeleton layout={[2, 1, 2, 2]} />
        ) : templateQuery.isError || !normalizedTemplate ? (
          <Alert severity="error">Error loading reusable settings template.</Alert>
        ) : (
          <>
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Typography variant="h6">Template</Typography>
              <CippFormComponent
                type="textField"
                name="displayName"
                label="Template / Policy Display Name"
                formControl={formControl}
              />
              <CippFormComponent
                type="textField"
                name="description"
                label="Template / Policy Description"
                formControl={formControl}
                multiline
                minRows={2}
              />
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {fields?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Group Setting Collection (Policy)
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ display: "none" }}>ID</TableCell>
                      <TableCell>Autoresolve</TableCell>
                      <TableCell>Keyword</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fields.map((field, index) => {
                      const idPath = `groupSettingCollectionValue.${index}.children.0.simpleSettingValue.value`;
                      const autoresolvePath = `groupSettingCollectionValue.${index}.children.1.choiceSettingValue.value`;
                      const keywordPath = `groupSettingCollectionValue.${index}.children.2.simpleSettingValue.value`;

                      const autoresolveBase = groupChildDefinitions.autoresolveDef || "autoresolve";
                      const autoresolveTrue = `${autoresolveBase}_true`;
                      const autoresolveFalse = `${autoresolveBase}_false`;

                      return (
                        <TableRow key={field.id || index}>
                          <TableCell sx={{ display: "none" }}>
                            <CippFormComponent
                              type="textField"
                              name={idPath}
                              label="ID"
                              formControl={formControl}
                            />
                          </TableCell>
                          <TableCell sx={{ width: "25%" }}>
                            <CippFormComponent
                              type="autoComplete"
                              name={autoresolvePath}
                              label="Autoresolve"
                              formControl={formControl}
                              multiple={false}
                              options={[
                                { label: "True", value: autoresolveTrue },
                                { label: "False", value: autoresolveFalse },
                              ]}
                              creatable
                            />
                          </TableCell>
                          <TableCell sx={{ width: "35%" }}>
                            <CippFormComponent
                              type="textField"
                              name={keywordPath}
                              label="Keyword"
                              formControl={formControl}
                              includeSystemVariables
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Button size="small" color="error" onClick={() => remove(index)}>
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => append(createEmptyEntry())}
                  >
                    Add row
                  </Button>
                </Stack>
              </Box>
            )}
          </>
        )}
      </Box>
    </CippFormPage>
  );
};

EditReusableSettingsTemplate.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditReusableSettingsTemplate;
