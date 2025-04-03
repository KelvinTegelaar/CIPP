import { useRouter } from "next/router"; // Import Next.js router
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from "@mui/material";
import { Stack } from "@mui/system";
import { CippApiResults } from "./CippApiResults";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSettings } from "../../hooks/use-settings";
import CippFormComponent from "./CippFormComponent";
import { useMediaQuery } from "@mui/material";

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
    relatedQueryKeys: relatedQueryKeys
      ? relatedQueryKeys
      : api.relatedQueryKeys
      ? api.relatedQueryKeys
      : title,
    bulkRequest: api.multiPost === false,
    onResult: (result) => {
      setPartialResults((prevResults) => [...prevResults, result]);
    },
  });

  const actionPostRequest = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: relatedQueryKeys
      ? relatedQueryKeys
      : api.relatedQueryKeys
      ? api.relatedQueryKeys
      : title,
    bulkRequest: api.multiPost === false,
    onResult: (result) => {
      setPartialResults((prevResults) => [...prevResults, result]);
      if (api?.onSuccess) {
        api.onSuccess(result);
      }
    },
  });
  const actionGetRequest = ApiGetCall({
    ...getRequestInfo,
    relatedQueryKeys: relatedQueryKeys
      ? relatedQueryKeys
      : api.relatedQueryKeys
      ? api.relatedQueryKeys
      : title,
    bulkRequest: api.multiPost === false,
    onResult: (result) => {
      setPartialResults((prevResults) => [...prevResults, result]);
      if (api?.onSuccess) {
        api.onSuccess(result);
      }
    },
  });

  const processActionData = (dataObject, row, replacementBehaviour) => {
    if (typeof api?.dataFunction === "function") {
      return api.dataFunction(row);
    }
    var newData = {};

    if (api?.postEntireRow) {
      newData = row;
    } else {
      Object.keys(dataObject).forEach((key) => {
        const value = dataObject[key];
        if (typeof value === "string" && value.startsWith("!")) {
          newData[key] = value.slice(1);
        } else if (typeof value === "string") {
          if (row[value] !== undefined) {
            newData[key] = row[value];
          } else {
            newData[key] = value;
          }
        } else if (typeof value === "boolean") {
          newData[key] = value;
        } else if (typeof value === "object" && value !== null) {
          const processedValue = processActionData(value, row, replacementBehaviour);
          if (replacementBehaviour !== "removeNulls" || Object.keys(processedValue).length > 0) {
            newData[key] = processedValue;
          }
        } else if (replacementBehaviour !== "removeNulls") {
          newData[key] = value;
        } else if (row[value] !== undefined) {
          newData[key] = row[value];
        }
      });
    }
    return newData;
  };
  const tenantFilter = useSettings().currentTenant;
  const handleActionClick = (row, action, formData) => {
    setIsFormSubmitted(true);
    if (action.multiPost === undefined) {
      action.multiPost = false;
    }
    if (api.customFunction) {
      action.customFunction(row, action, formData);
      createDialog.handleClose();
      return;
    }

    const commonData = {
      tenantFilter: tenantFilter,
      ...formData,
      ...addedFieldData,
    };
    const processedActionData = processActionData(action.data, row, action.replacementBehaviour);

    if (Array.isArray(row) && action.multiPost === false) {
      const arrayOfObjects = row.map((singleRow) => {
        const itemData = { ...commonData };
        Object.keys(processedActionData).forEach((key) => {
          const rowValue = singleRow[processedActionData[key]];
          itemData[key] = rowValue !== undefined ? rowValue : processedActionData[key];
        });
        return itemData;
      });
      if (action.type === "POST") {
        actionPostRequest.mutate({
          url: action.url,
          bulkRequest: true,
          data: arrayOfObjects,
        });
      } else if (action.type === "GET") {
        setGetRequestInfo({
          url: action.url,
          waiting: true,
          queryKey: Date.now(),
          bulkRequest: true,
          data: arrayOfObjects,
        });
      }

      return;
    }

    if (Array.isArray(row) && action.multiPost === true) {
      const singleArrayData = row.map((singleRow) => {
        const itemData = { ...commonData };
        Object.keys(processedActionData).forEach((key) => {
          const rowValue = singleRow[processedActionData[key]];
          itemData[key] = rowValue !== undefined ? rowValue : processedActionData[key];
        });
        return itemData;
      });

      if (action.type === "POST") {
        actionPostRequest.mutate({
          url: action.url,
          bulkRequest: false,
          data: singleArrayData,
        });
      } else if (action.type === "GET") {
        setGetRequestInfo({
          url: action.url,
          waiting: true,
          queryKey: Date.now(),
          bulkRequest: false,
          data: singleArrayData,
        });
      }
      return;
    }

    const finalData = { ...commonData };
    Object.keys(processedActionData).forEach((key) => {
      const rowValue = row[processedActionData[key]];
      finalData[key] = rowValue !== undefined ? rowValue : processedActionData[key];
    });

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
  //add a useEffect, when dialogAfterEffect exists, and the post or get request is successful, run the dialogAfterEffect function
  useEffect(() => {
    if (dialogAfterEffect && (actionPostRequest.isSuccess || actionGetRequest.isSuccess)) {
      dialogAfterEffect(actionPostRequest.data.data || actionGetRequest.data);
    }
  }, [actionPostRequest.isSuccess, actionGetRequest.isSuccess]);
  const formHook = useForm();
  const onSubmit = (data) => handleActionClick(row, api, data);
  const selectedType = api.type === "POST" ? actionPostRequest : actionGetRequest;

  useEffect(() => {
    if (api?.setDefaultValues && createDialog.open) {
      fields.map((field) => {
        if (
          ((typeof row[field.name] === "string" && field.type === "textField") ||
            (typeof row[field.name] === "boolean" && field.type === "switch")) &&
          row[field.name] !== undefined &&
          row[field.name] !== null &&
          row[field.name] !== ""
        ) {
          formHook.setValue(field.name, row[field.name]);
        } else if (Array.isArray(row[field.name]) && field.type === "autoComplete") {
          var values = [];
          row[field.name].map((element) => {
            if (element.label && element.value) {
              values.push(element);
            } else if (typeof element === "string" || typeof element === "number") {
              values.push({
                label: element,
                value: element,
              });
            }
          });
          formHook.setValue(field.name, values);
        } else if (
          field.type === "autoComplete" &&
          row[field.name] !== "" &&
          (typeof row[field.name] === "string" ||
            (typeof row[field.name] === "object" &&
              row[field.name] !== undefined &&
              row[field.name] !== null))
        ) {
          if (typeof row[field.name] === "string") {
            formHook.setValue(field.name, {
              label: row[field.name],
              value: row[field.name],
            });
          } else if (
            typeof row[field.name] === "object" &&
            row[field.name]?.label &&
            row[field.name]?.value
          ) {
            formHook.setValue(field.name, row[field.name]);
          }
        }
      });
    }
  }, [createDialog.open, api?.setDefaultValues]);

  const getNestedValue = (obj, path) => {
    return path
      .split(".")
      .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  };

  const [linkClicked, setLinkClicked] = useState(false);

  useEffect(() => {
    if (api.link && !linkClicked && row && Object.keys(row).length > 0) {
      const timeoutId = setTimeout(() => {
        const linkWithRowData = api.link.replace(/\[([^\]]+)\]/g, (_, key) => {
          return getNestedValue(row, key) || `[${key}]`;
        });

        if (linkWithRowData.startsWith("/")) {
          // Internal link navigation
          setLinkClicked(true);
          router.push(linkWithRowData, undefined, { shallow: true });
        } else {
          // External link navigation
          setLinkClicked(true);
          window.open(linkWithRowData, api.target || "_blank");
        }
      }, 0); // Delay execution to the next event loop cycle

      return () => clearTimeout(timeoutId);
    }
  }, [api.link, linkClicked, row, router]);

  useEffect(() => {
    if (api.noConfirm && !api.link) {
      formHook.handleSubmit(onSubmit)(); // Submits the form on mount
      createDialog.handleClose(); // Closes the dialog after submitting
    }
  }, [api.noConfirm, api.link]); // Run effect when noConfirm or link changes

  const handleClose = () => {
    createDialog.handleClose();
    setPartialResults([]);
  };

  var confirmText;
  if (typeof api?.confirmText === "string" && !Array.isArray(row)) {
    confirmText = api.confirmText.replace(/\[([^\]]+)\]/g, (_, key) => {
      return getNestedValue(row, key) || `[${key}]`;
    });
  } else if (Array.isArray(row) && row.length > 1) {
    confirmText = api.confirmText.replace(/\[([^\]]+)\]/g, "the selected rows");
  } else if (Array.isArray(row) && row.length === 1) {
    confirmText = api.confirmText.replace(/\[([^\]]+)\]/g, (_, key) => {
      return getNestedValue(row[0], key) || `[${key}]`;
    });
  } else {
    confirmText = api.confirmText;
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
              <Grid container spacing={2}>
                {fields &&
                  fields.map((fieldProps, index) => {
                    if (fieldProps?.api?.processFieldData) {
                      fieldProps.api.data = processActionData(fieldProps.api.data, row);
                    }
                    return (
                      <Grid item xs={12} key={index}>
                        <CippFormComponent
                          formControl={formHook}
                          addedFieldData={addedFieldData}
                          setAddedFieldData={setAddedFieldData}
                          {...fieldProps}
                        />
                      </Grid>
                    );
                  })}
              </Grid>
            </DialogContent>
            <DialogContent>
              <CippApiResults apiObject={{ ...selectedType, data: partialResults }} />
            </DialogContent>
            <DialogActions>
              <Button color="inherit" onClick={() => handleClose()}>
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
