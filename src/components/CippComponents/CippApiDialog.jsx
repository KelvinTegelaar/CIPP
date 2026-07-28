import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Stack } from "@mui/system";
import { WarningAmber, PersonAdd } from "@mui/icons-material";
import { CippApiResults } from "./CippApiResults";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { getSafeInternalRoute, openSafeExternalUrl } from "../../utils/safe-navigation";
import { isDangerAction } from "../../utils/action-categories";
import { useForm, useFormState } from "react-hook-form";
import { useSettings } from "../../hooks/use-settings";
import CippFormComponent from "./CippFormComponent";
import { CippFormCondition } from "./CippFormCondition";

export const CippApiDialog = (props) => {
  const {
    createDialog,
    title,
    fields,
    api,
    row = {},
    relatedQueryKeys,
    dialogAfterEffect,
    allowResubmit = false,
    allowAddAnother = false,
    addAnotherLabel = "Add Another",
    children,
    defaultvalues,
    onActionSuccess,
    ...other
  } = props;
  const router = useRouter();
  const linkOpenedRef = useRef(false);
  const [addedFieldData, setAddedFieldData] = useState({});
  const [partialResults, setPartialResults] = useState([]);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const mdDown = useMediaQuery((theme) => theme.breakpoints.down("md"));

  if (mdDown) {
    other.fullScreen = true;
  }

  const formHook = useForm({
    defaultValues: typeof defaultvalues === "function" ? defaultvalues(row) : defaultvalues || {},
    mode: "onChange", // Enable real-time validation
  });

  // Get form state for validation
  const { isValid } = useFormState({ control: formHook.control });

  useEffect(() => {
    if (createDialog.open) {
      setIsFormSubmitted(false);
      formHook.reset(typeof defaultvalues === "function" ? defaultvalues(row) : defaultvalues || {});
    }
  }, [createDialog.open, defaultvalues]);

  const [getRequestInfo, setGetRequestInfo] = useState({
    url: "",
    waiting: false,
    queryKey: "",
    relatedQueryKeys: relatedQueryKeys ?? api.relatedQueryKeys ?? title,
    bulkRequest: api.multiPost === false,
    onResult: (result) => setPartialResults((prev) => [...prev, result]),
  });

  const actionPostRequest = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: relatedQueryKeys ?? api.relatedQueryKeys ?? title,
    bulkRequest: api.multiPost === false,
    onResult: (result) => {
      setPartialResults((prev) => [...prev, result]);
      api?.onSuccess?.(result);
    },
  });

  const actionGetRequest = ApiGetCall({
    ...getRequestInfo,
    relatedQueryKeys: relatedQueryKeys ?? api.relatedQueryKeys ?? title,
    bulkRequest: api.multiPost === false,
    onResult: (result) => {
      setPartialResults((prev) => [...prev, result]);
      api?.onSuccess?.(result);
    },
  });

  // Whenever the dialog is (re)opened, discard any results from a previous run
  // so a freshly created window never shows stale output from an earlier action.
  // The POST mutation and GET query retain their last result while this component
  // stays mounted, so clear both alongside the streamed partial results.
  useEffect(() => {
    if (createDialog.open) {
      setPartialResults([]);
      actionPostRequest.reset();
      setGetRequestInfo((prev) => ({ ...prev, waiting: false, queryKey: "" }));
    }
  }, [createDialog.open]);

  const processActionData = (dataObject, row, replacementBehaviour) => {
    if (typeof api?.dataFunction === "function") return api.dataFunction(row, dataObject);

    let newData = {};
    if (api?.postEntireRow) {
      return row;
    }

    if (!dataObject) {
      return dataObject;
    }

    Object.keys(dataObject).forEach((key) => {
      const value = dataObject[key];

      if (typeof value === "string" && value.startsWith("!")) {
        newData[key] = value.slice(1);
      } else if (typeof value === "string") {
        newData[key] = row[value] ?? value;
      } else if (typeof value === "boolean") {
        newData[key] = value;
      } else if (typeof value === "object" && value !== null) {
        const processedValue = processActionData(value, row, replacementBehaviour);
        if (replacementBehaviour !== "removeNulls" || Object.keys(processedValue).length > 0) {
          newData[key] = processedValue;
        }
      } else if (replacementBehaviour !== "removeNulls") {
        newData[key] = value;
      }
    });

    return newData;
  };

  const tenantFilter = useSettings().currentTenant;
  const handleActionClick = (row, action, formData) => {
    setIsFormSubmitted(true);
    let finalData = {};
    let isBulkRequest = false;
    if (typeof api?.customDataformatter === "function") {
      finalData = api.customDataformatter(row, action, formData);
      // If customDataformatter returns an array, enable bulk request mode
      isBulkRequest = Array.isArray(finalData);
    } else {
      if (action.multiPost === undefined) action.multiPost = false;

      if (api.customFunction) {
        action.customFunction(row, action, formData);
        createDialog.handleClose();
        return;
      }

      // Helper function to get the correct tenant filter for a row
      const getRowTenantFilter = (rowData) => {
        // If we're in AllTenants mode and the row has a Tenant property, use that
        if (tenantFilter === "AllTenants" && rowData?.Tenant) {
          return rowData.Tenant;
        }
        // Otherwise use the current tenant filter
        return tenantFilter;
      };

      const processedActionData = processActionData(action.data, row, action.replacementBehaviour);

      if (!processedActionData || Object.keys(processedActionData).length === 0) {
        console.warn("No data to process for action:", action);
      } else {
        // MULTI ROW CASES
        if (Array.isArray(row)) {
          const arrayData = row.map((singleRow) => {
            const commonData = {
              tenantFilter: getRowTenantFilter(singleRow),
              ...formData,
              ...addedFieldData,
            };
            const itemData = { ...commonData };
            Object.keys(processedActionData).forEach((key) => {
              const rowValue = singleRow[processedActionData[key]];
              itemData[key] = rowValue !== undefined ? rowValue : processedActionData[key];
            });
            return itemData;
          });

          const payload = {
            url: action.url,
            bulkRequest: !action.multiPost,
            data: arrayData,
          };

          if (action.type === "POST") {
            actionPostRequest.mutate(payload, {
              onSuccess: (response) => onActionSuccess?.(response),
            });
          } else if (action.type === "GET") {
            setGetRequestInfo({
              ...payload,
              waiting: true,
              queryKey: Date.now(),
            });
          }

          return;
        }
      }

      // SINGLE ROW CASE
      const commonData = {
        tenantFilter: getRowTenantFilter(row),
        ...formData,
        ...addedFieldData,
      };

      // ✅ FIXED: DIRECT MERGE INSTEAD OF CORRUPT TRANSFORMATION
      finalData = {
        ...commonData,
        ...processedActionData,
      };
    }

    if (action.type === "POST") {
      actionPostRequest.mutate(
        {
          url: action.url,
          bulkRequest: isBulkRequest,
          data: finalData,
        },
        { onSuccess: (response) => onActionSuccess?.(response) }
      );
    } else if (action.type === "GET") {
      setGetRequestInfo({
        url: action.url,
        waiting: true,
        queryKey: Date.now(),
        bulkRequest: isBulkRequest,
        data: finalData,
      });
    }
  };

  useEffect(() => {
    if (dialogAfterEffect && (actionPostRequest.isSuccess || actionGetRequest.isSuccess)) {
      dialogAfterEffect(actionPostRequest.data?.data || actionGetRequest.data);
    }
  }, [actionPostRequest.isSuccess, actionGetRequest.isSuccess]);

  const onSubmit = (data) => handleActionClick(row, api, data);
  const selectedType = api.type === "POST" ? actionPostRequest : actionGetRequest;

  useEffect(() => {
    if (api?.setDefaultValues && createDialog.open) {
      fields.forEach((field) => {
        const targetName = field.name.replace(/\[(\w+)\]/g, ".$1");
        const val = targetName
          .split(".")
          .reduce((acc, key) => (acc != null ? acc[key] : undefined), row);
        if (
          (typeof val === "string" && field.type === "textField") ||
          (typeof val === "boolean" && field.type === "switch")
        ) {
          formHook.setValue(targetName, val);
        } else if (Array.isArray(val) && field.type === "autoComplete") {
          const values = val
            .map((el) =>
              el?.label && el?.value
                ? el
                : typeof el === "string" || typeof el === "number"
                  ? { label: el, value: el }
                  : null,
            )
            .filter(Boolean);
          formHook.setValue(targetName, values);
        } else if (field.type === "autoComplete" && val) {
          formHook.setValue(
            targetName,
            typeof val === "string"
              ? { label: val, value: val }
              : val.label && val.value
                ? val
                : undefined,
          );
        }
      });
    }
  }, [createDialog.open, api?.setDefaultValues]);

  const escapeHtml = (text) => {
    if (typeof text !== "string") return text;
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  const getRawNestedValue = (obj, path) => {
    return path
      .split(".")
      .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  };

  const getNestedValue = (obj, path) => {
    const value = getRawNestedValue(obj, path);
    return typeof value === "string" ? escapeHtml(value) : value;
  };

  // Handle link actions - opens the link when dialog opens, using ref to prevent duplicates
  useEffect(() => {
    if (
      api.link &&
      createDialog.open &&
      row &&
      Object.keys(row).length > 0 &&
      !linkOpenedRef.current
    ) {
      linkOpenedRef.current = true;
      // Values are URL encoded on the way in: group types and display names
      // contain spaces, which getSafeInternalRoute rejects as unsafe.
      const linkWithData = api.link.replace(/\[([^\]]+)\]/g, (_, key) => {
        const value = getRawNestedValue(row, key);
        return value || value === 0 ? encodeURIComponent(value) : `[${key}]`;
      });
      const safeRoute = getSafeInternalRoute(linkWithData);
      if (safeRoute && !api?.external) {
        router.push(safeRoute, undefined, { shallow: true });
      } else if (api?.external || linkWithData.startsWith("//")) {
        openSafeExternalUrl(linkWithData, api.target || "_blank");
      } else {
        console.warn(`Refusing to navigate to unsafe or unresolved link: ${linkWithData}`);
      }
      createDialog.handleClose();
    }
  }, [api.link, createDialog.open, row, router]);

  // Reset the ref when dialog closes so the same link can be opened again
  useEffect(() => {
    if (!createDialog.open) {
      linkOpenedRef.current = false;
    }
  }, [createDialog.open]);

  useEffect(() => {
    if (api.noConfirm && !api.link) {
      formHook.handleSubmit(onSubmit)();
      createDialog.handleClose();
    }
  }, [api.noConfirm, api.link]);

  const handleClose = () => {
    createDialog.handleClose();
    setPartialResults([]);
  };

  let confirmText;
  if (typeof api?.confirmText === "string") {
    if (!Array.isArray(row)) {
      confirmText = api.confirmText.replace(
        /\[([^\]]+)\]/g,
        (_, key) => getNestedValue(row, key) || `[${key}]`,
      );
    } else if (row.length > 1) {
      confirmText = api.confirmText.replace(/\[([^\]]+)\]/g, `the ${row.length} selected rows`);
    } else if (row.length === 1) {
      confirmText = api.confirmText.replace(
        /\[([^\]]+)\]/g,
        (_, key) => getNestedValue(row[0], key) || `[${key}]`,
      );
    }
  } else {
    const replaceTextInElement = (element) => {
      if (!element) return element;
      if (typeof element === "string") {
        if (Array.isArray(row)) {
          return row.length > 1
            ? element.replace(/\[([^\]]+)\]/g, `the ${row.length} selected rows`)
            : element.replace(
                /\[([^\]]+)\]/g,
                (_, key) => getNestedValue(row[0], key) || `[${key}]`,
              );
        }
        return element.replace(/\[([^\]]+)\]/g, (_, key) => getNestedValue(row, key) || `[${key}]`);
      }
      if (React.isValidElement(element)) {
        const newChildren = React.Children.map(element.props.children, replaceTextInElement);
        return React.cloneElement(element, {}, newChildren);
      }
      return element;
    };
    confirmText = replaceTextInElement(api?.confirmText);
  }

  const theme = useTheme();
  // Destructive actions are marked with category "danger" and/or colour
  // "danger"/"error" depending on the page, so accept any of them here
  const isDanger = isDangerAction(api);

  return (
    <>
      {!api?.link && (
        <Dialog
          fullWidth
          maxWidth="sm"
          onClose={handleClose}
          open={createDialog.open}
          disableRestoreFocus
          {...other}
          PaperProps={{
            ...other?.PaperProps,
            sx: {
              ...other?.PaperProps?.sx,
              ...(isDanger && {
                border: `2px solid ${theme.palette.error.main}`,
                boxShadow: `0 0 24px ${alpha(theme.palette.error.main, 0.25)}`,
              }),
            },
          }}
        >
          <form onSubmit={formHook.handleSubmit(onSubmit)}>
            <DialogTitle
              sx={
                isDanger
                  ? {
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      bgcolor: alpha(theme.palette.error.main, 0.08),
                      color: theme.palette.error.main,
                      borderBottom: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                    }
                  : undefined
              }
            >
              {isDanger && <WarningAmber sx={{ fontSize: 28 }} />}
              {title}
            </DialogTitle>
            <DialogContent sx={{ pt: isDanger ? 2.5 : undefined }}>
              {isDanger ? (
                <Alert severity="error" variant="outlined" icon={false} sx={{ mt: 1 }}>
                  <Typography variant="body2">{confirmText}</Typography>
                </Alert>
              ) : (
                <Stack spacing={2}>{confirmText}</Stack>
              )}
            </DialogContent>
            <DialogContent>
              <Stack spacing={2}>
                {children ? (
                  typeof children === "function" ? (
                    children({
                      formHook,
                      row,
                    })
                  ) : (
                    children
                  )
                ) : (
                  <>
                    {fields?.map((fieldProps, i) => {
                      const { condition, ...rest } = fieldProps;
                      const fieldElement = (
                        <CippFormComponent
                          formControl={formHook}
                          addedFieldData={addedFieldData}
                          setAddedFieldData={setAddedFieldData}
                          row={row}
                          {...rest}
                        />
                      );
                      return (
                        <Box key={i} sx={{ width: "100%" }}>
                          {condition ? (
                            <CippFormCondition {...condition} formControl={formHook}>
                              {fieldElement}
                            </CippFormCondition>
                          ) : (
                            fieldElement
                          )}
                        </Box>
                      );
                    })}
                  </>
                )}
              </Stack>
            </DialogContent>
            <DialogContent>
              <CippApiResults apiObject={{ ...selectedType, data: partialResults }} />
            </DialogContent>
            <DialogActions
              sx={isDanger ? { borderTop: `1px solid ${alpha(theme.palette.error.main, 0.2)}` } : undefined}
            >
              <Button color="inherit" onClick={handleClose}>
                Close
              </Button>
              {allowAddAnother && isFormSubmitted && (
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={() => {
                    setIsFormSubmitted(false);
                    setPartialResults([]);
                    formHook.reset(
                      typeof defaultvalues === "function" ? defaultvalues(row) : defaultvalues || {},
                    );
                  }}
                >
                  {addAnotherLabel}
                </Button>
              )}
              <Button
                variant="contained"
                color={isDanger ? "error" : "primary"}
                type="submit"
                disabled={!isValid || (isFormSubmitted && !allowResubmit && !allowAddAnother)}
              >
                {isFormSubmitted && allowResubmit ? "Reconfirm" : "Confirm"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </>
  );
};
