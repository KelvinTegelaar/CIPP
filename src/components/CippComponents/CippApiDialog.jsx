import { useRouter } from "next/router";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
} from "@mui/material";
import { Stack } from "@mui/system";
import { CippApiResults } from "./CippApiResults";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useSettings } from "../../hooks/use-settings";
import CippFormComponent from "./CippFormComponent";

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
    children,
    ...other
  } = props;
  const router = useRouter();
  const [addedFieldData, setAddedFieldData] = useState({});
  const [partialResults, setPartialResults] = useState([]);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const mdDown = useMediaQuery((theme) => theme.breakpoints.down("md"));

  if (mdDown) {
    other.fullScreen = true;
  }
  useEffect(() => {
    if (createDialog.open) {
      setIsFormSubmitted(false);
      formHook.reset();
    }
  }, [createDialog.open]);

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
    if (typeof api?.customDataformatter === "function") {
      finalData = api.customDataformatter(row, action, formData);
    } else {
      if (action.multiPost === undefined) action.multiPost = false;

      if (api.customFunction) {
        action.customFunction(row, action, formData);
        createDialog.handleClose();
        return;
      }

      const commonData = {
        tenantFilter,
        ...formData,
        ...addedFieldData,
      };
      const processedActionData = processActionData(action.data, row, action.replacementBehaviour);

      if (!processedActionData || Object.keys(processedActionData).length === 0) {
        console.warn("No data to process for action:", action);
      } else {
        // MULTI ROW CASES
        if (Array.isArray(row)) {
          const arrayData = row.map((singleRow) => {
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
            actionPostRequest.mutate(payload);
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
      // ✅ FIXED: DIRECT MERGE INSTEAD OF CORRUPT TRANSFORMATION
      finalData = {
        ...commonData,
        ...processedActionData,
      };
    }

    if (action.type === "POST") {
      actionPostRequest.mutate({
        url: action.url,
        bulkRequest: false,
        data: finalData,
      });
    } else if (action.type === "GET") {
      setGetRequestInfo({
        url: action.url,
        waiting: true,
        queryKey: Date.now(),
        bulkRequest: false,
        data: finalData,
      });
    }
  };

  useEffect(() => {
    if (dialogAfterEffect && (actionPostRequest.isSuccess || actionGetRequest.isSuccess)) {
      dialogAfterEffect(actionPostRequest.data?.data || actionGetRequest.data);
    }
  }, [actionPostRequest.isSuccess, actionGetRequest.isSuccess]);

  const formHook = useForm();
  const onSubmit = (data) => handleActionClick(row, api, data);
  const selectedType = api.type === "POST" ? actionPostRequest : actionGetRequest;

  useEffect(() => {
    if (api?.setDefaultValues && createDialog.open) {
      fields.forEach((field) => {
        const val = row[field.name];
        if (
          (typeof val === "string" && field.type === "textField") ||
          (typeof val === "boolean" && field.type === "switch")
        ) {
          formHook.setValue(field.name, val);
        } else if (Array.isArray(val) && field.type === "autoComplete") {
          const values = val
            .map((el) =>
              el?.label && el?.value
                ? el
                : typeof el === "string" || typeof el === "number"
                ? { label: el, value: el }
                : null
            )
            .filter(Boolean);
          formHook.setValue(field.name, values);
        } else if (field.type === "autoComplete" && val) {
          formHook.setValue(
            field.name,
            typeof val === "string"
              ? { label: val, value: val }
              : val.label && val.value
              ? val
              : undefined
          );
        }
      });
    }
  }, [createDialog.open, api?.setDefaultValues]);

  const getNestedValue = (obj, path) =>
    path
      .split(".")
      .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);

  const [linkClicked, setLinkClicked] = useState(false);
  useEffect(() => setLinkClicked(false), [api.link]);

  useEffect(() => {
    if (api.link && !linkClicked && row && Object.keys(row).length > 0) {
      const timeoutId = setTimeout(() => {
        const linkWithData = api.link.replace(
          /\[([^\]]+)\]/g,
          (_, key) => getNestedValue(row, key) || `[${key}]`
        );
        setLinkClicked(true);
        if (linkWithData.startsWith("/") && !api?.external)
          router.push(linkWithData, undefined, { shallow: true });
        else window.open(linkWithData, api.target || "_blank");
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [api.link, linkClicked, row, router]);

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
        (_, key) => getNestedValue(row, key) || `[${key}]`
      );
    } else if (row.length > 1) {
      confirmText = api.confirmText.replace(/\[([^\]]+)\]/g, "the selected rows");
    } else if (row.length === 1) {
      confirmText = api.confirmText.replace(
        /\[([^\]]+)\]/g,
        (_, key) => getNestedValue(row[0], key) || `[${key}]`
      );
    }
  } else {
    const replaceTextInElement = (element) => {
      if (!element) return element;
      if (typeof element === "string") {
        if (Array.isArray(row)) {
          return row.length > 1
            ? element.replace(/\[([^\]]+)\]/g, "the selected rows")
            : element.replace(
                /\[([^\]]+)\]/g,
                (_, key) => getNestedValue(row[0], key) || `[${key}]`
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

  return (
    <>
      {!api?.link && (
        <Dialog fullWidth maxWidth="sm" onClose={handleClose} open={createDialog.open} {...other}>
          <form onSubmit={formHook.handleSubmit(onSubmit)}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
              <Stack spacing={2}>{confirmText}</Stack>
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
                    {fields?.map((fieldProps, i) => (
                      <Box key={i} sx={{ width: "100%" }}>
                        <CippFormComponent
                          formControl={formHook}
                          addedFieldData={addedFieldData}
                          setAddedFieldData={setAddedFieldData}
                          {...fieldProps}
                        />
                      </Box>
                    ))}
                  </>
                )}
              </Stack>
            </DialogContent>
            <DialogContent>
              <CippApiResults apiObject={{ ...selectedType, data: partialResults }} />
            </DialogContent>
            <DialogActions>
              <Button color="inherit" onClick={handleClose}>
                Close
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={isFormSubmitted && !allowResubmit}
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
