import {
  Box,
  Button,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useFieldArray, useForm } from "react-hook-form";
import { useMemo } from "react";
import { useSettings } from "../../../../hooks/use-settings";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";

const Page = () => {
  const userSettingsDefaults = useSettings();

  const baseSettingDefinitionId = "vendor_msft_firewall_mdmstore_dynamickeywords_addresses_{id}";

  const generateGuid = () => {
    const wrap = (val) => `{${val}}`;
    if (typeof crypto !== "undefined" && crypto.randomUUID) return wrap(crypto.randomUUID());
    const s4 = () =>
      Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    return wrap(`${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`);
  };

  const buildGroupEntryFromBase = (baseId, options = {}) => {
    const { idValue = generateGuid(), autoresolveValue = "", keywordValue = "" } = options;
    return {
      children: [
        {
          "@odata.type": "#microsoft.graph.deviceManagementConfigurationSimpleSettingInstance",
          settingDefinitionId: `${baseId}_id`,
          simpleSettingValue: {
            "@odata.type": "#microsoft.graph.deviceManagementConfigurationStringSettingValue",
            value: idValue,
          },
        },
        {
          "@odata.type": "#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance",
          settingDefinitionId: `${baseId}_autoresolve`,
          choiceSettingValue: { value: autoresolveValue, children: [] },
        },
        {
          "@odata.type": "#microsoft.graph.deviceManagementConfigurationSimpleSettingInstance",
          settingDefinitionId: `${baseId}_keyword`,
          simpleSettingValue: {
            "@odata.type": "#microsoft.graph.deviceManagementConfigurationStringSettingValue",
            value: keywordValue,
          },
        },
      ],
    };
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

  const buildInitialGroupEntry = () =>
    buildGroupEntryFromBase(baseSettingDefinitionId, { idValue: generateGuid() });

  const initialGroupCollection = [buildInitialGroupEntry()];
  const initialParsedRaw = {
    settingDefinitionId: baseSettingDefinitionId,
    settingInstance: {
      "@odata.type": "#microsoft.graph.deviceManagementConfigurationGroupSettingCollectionInstance",
      settingDefinitionId: baseSettingDefinitionId,
      groupSettingCollectionValue: [buildInitialGroupEntry()],
    },
  };

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
      parsedRAWJson: initialParsedRaw,
      groupSettingCollectionValue: initialGroupCollection,
    },
  });

  const customDataFormatter = useMemo(() => {
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
          result[key] = extractValues(obj[key]);
        });
        return result;
      }

      return obj;
    };

    return (values) => {
      const processedValues = extractValues(values) || {};
      const baseRaw = processedValues.parsedRAWJson || {};
      const normalizeCollection = (collection) => {
        if (!collection) return undefined;
        return Array.isArray(collection) ? collection : [collection];
      };
      const ensureIdValues = (collection) => {
        if (!collection) return collection;
        return collection.map((entry) => {
          if (!entry?.children || !Array.isArray(entry.children)) return entry;
          const nextChildren = entry.children.map((child) => {
            if (
              child?.settingDefinitionId?.toLowerCase().endsWith("_id") &&
              child?.simpleSettingValue &&
              !child.simpleSettingValue.value
            ) {
              return {
                ...child,
                simpleSettingValue: {
                  ...child.simpleSettingValue,
                  value: generateGuid(),
                },
              };
            }
            return child;
          });
          return { ...entry, children: nextChildren };
        });
      };
      const deriveBaseSettingDefinitionId = (collection) => {
        if (!collection?.length) return undefined;
        const firstChildren = collection[0]?.children || [];
        const firstDef = firstChildren.find((child) => child?.settingDefinitionId)?.settingDefinitionId;
        if (!firstDef) return undefined;
        return firstDef
          .replace(/_id$/i, "")
          .replace(/_autoresolve$/i, "")
          .replace(/_keyword$/i, "");
      };

      if (!baseRaw.settingInstance) {
        baseRaw.settingInstance = {};
      }

      if (processedValues.displayName) {
        baseRaw.displayName = processedValues.displayName;
      }
      if (processedValues.description) {
        baseRaw.description = processedValues.description;
      }
      const normalizedCollection = normalizeCollection(
        processedValues.groupSettingCollectionValue ??
          baseRaw?.settingInstance?.groupSettingCollectionValue,
      );

      const normalizedWithIds = ensureIdValues(normalizedCollection);

      if (normalizedWithIds) {
        baseRaw.settingInstance.groupSettingCollectionValue = normalizedWithIds;
      }

      if (baseRaw.settingInstance.groupSettingCollectionValue) {
        if (!baseRaw.settingInstance["@odata.type"]) {
          baseRaw.settingInstance["@odata.type"] =
            "#microsoft.graph.deviceManagementConfigurationGroupSettingCollectionInstance";
        }

        const resolvedBaseDefinitionId =
          baseRaw.settingDefinitionId || deriveBaseSettingDefinitionId(normalizedWithIds);

        if (!baseRaw.settingDefinitionId) {
          baseRaw.settingDefinitionId = resolvedBaseDefinitionId;
        }

        if (!baseRaw.settingInstance.settingDefinitionId) {
          baseRaw.settingInstance.settingDefinitionId = resolvedBaseDefinitionId;
        }
      }

      return {
        GUID: processedValues.GUID,
        displayName: processedValues.displayName,
        description: processedValues.description,
        rawJSON: JSON.stringify(baseRaw, null, 2),
        tenantFilter: processedValues.tenantFilter || userSettingsDefaults.currentTenant,
      };
    };
  }, [userSettingsDefaults.currentTenant]);

  const { fields, append, remove } = useFieldArray({
    control: formControl.control,
    name: "groupSettingCollectionValue",
  });

  const groupChildDefinitions = useMemo(() => {
    const first = fields?.[0]?.children || [];
    return {
      idDef: first.find((c) => c.settingDefinitionId?.toLowerCase().includes("_id"))
        ?.settingDefinitionId,
      autoresolveDef: first.find((c) =>
        c.settingDefinitionId?.toLowerCase().includes("_autoresolve"),
      )?.settingDefinitionId,
      keywordDef: first.find((c) => c.settingDefinitionId?.toLowerCase().includes("_keyword"))
        ?.settingDefinitionId,
    };
  }, [fields]);

  const createEmptyEntry = () => {
    return buildGroupEntryFromDefinitions(groupChildDefinitions);
  };

  return (
    <CippFormPage
      resetForm={false}
      queryKey={`IntuneReusableSettingTemplates-${userSettingsDefaults.currentTenant}`}
      formControl={formControl}
      title="Reusable Settings Template"
      backButtonTitle="Reusable Settings Templates"
      postUrl="/api/AddIntuneReusableSettingTemplate"
      backUrl="/endpoint/MEM/reusable-settings-templates"
      customDataformatter={customDataFormatter}
      formPageType="Add"
    >
      <Box sx={{ my: 2 }}>
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Typography variant="h6">Template</Typography>
          <CippFormComponent
            type="textField"
            name="displayName"
            label="Template / Policy Display Name"
            formControl={formControl}
            validators={{ required: "Display Name is required" }}
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
                disabled={!groupChildDefinitions.idDef}
              >
                Add row
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </CippFormPage>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
