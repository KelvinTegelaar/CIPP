import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Stack } from "@mui/system";
import { CippApiResults } from "./CippAPIResults";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { CippAutoComplete } from "./CippAutocomplete";

export const CippApiDialog = (props) => {
  const { createDialog, title, fields, api, row, ...other } = props;
  const actionPostRequest = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: title,
  });
  const [getRequestInfo, setGetRequestInfo] = useState({
    url: "",
    waiting: false,
    queryKey: "",
  });

  const actionGetRequest = ApiGetCall({
    ...getRequestInfo,
  });

  const handleActionClick = (row, action, formData) => {
    const data = {};
    if (action.multiPost && Array.isArray(row)) {
      Object.keys(action.data).forEach((key) => {
        data[key] = row.map((singleRow) => {
          const value = singleRow[action.data[key]];
          return value !== undefined ? value : action.data[key];
        });
      });
    } else {
      Object.keys(action.data).forEach((key) => {
        const value = row[action.data[key]];
        data[key] = value !== undefined ? value : action.data[key];
      });
    }

    if (action.type === "POST") {
      actionPostRequest.mutate({ url: action.url, ...data, ...formData });
    }

    if (action.type === "GET") {
      setGetRequestInfo({
        url: action.url,
        waiting: true,
        queryKey: Date.now(),
        data,
      });
    }
  };
  const formHook = useForm();
  const onSubmit = (data) => handleActionClick(row, api, data);
  return (
    <Dialog fullWidth maxWidth="sm" onClose={createDialog.handleClose} open={createDialog.open}>
      <form onSubmit={formHook.handleSubmit(onSubmit)}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={3}>{api.confirmText}</Stack>
        </DialogContent>
        <DialogContent>
          {fields &&
            fields.map((field, index) => {
              switch (field.type) {
                case "autoComplete":
                  return (
                    <Controller
                      key={index}
                      name={field.name}
                      control={formHook.control}
                      render={({ field }) => (
                        <CippAutoComplete
                          required
                          creatable={false}
                          multiple={false}
                          defaultValue={"Select a bla"}
                          options={["one", "two", "three"]}
                          onChange={(e, nv) => field.onChange(nv)}
                        />
                      )}
                    />
                  );
                case "textField":
                  return (
                    <TextField
                      key={index}
                      multiline={false}
                      name={field.name}
                      {...formHook.register(field.name)}
                    />
                  );
                case "textArea":
                  return (
                    <TextField
                      key={index}
                      multiline
                      rows={4}
                      {...field}
                      {...formHook.register(field.name)}
                    />
                  );
                default:
                  return null;
              }
            })}
        </DialogContent>
        <DialogContent>
          <>
            <CippApiResults apiObject={actionPostRequest} />
            <CippApiResults apiObject={actionGetRequest} />
          </>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={createDialog.handleClose}>
            Close
          </Button>
          <Button variant="contained" type="submit">
            Confirm
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
