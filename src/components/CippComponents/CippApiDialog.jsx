import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Stack } from "@mui/system";
import { CippApiResults } from "./CippAPIResults";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { CippAutoComplete } from "./CippAutocomplete";

export const CippApiDialog = (props) => {
  const { createDialog, title, fields, api, ...other } = props;
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

  const handleActionClick = (row, action) => {
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
      actionPostRequest.mutate({ url: action.url, ...data });
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
  const onSubmit = (data) => console.log(data);
  return (
    <Dialog fullWidth maxWidth="sm" onClose={createDialog.handleClose} open={createDialog.open}>
      <form onSubmit={formHook.handleSubmit(onSubmit)}>
        <DialogTitle>{title}</DialogTitle>

        <DialogContent>
          <Stack spacing={3}>{api.confirmText}</Stack>
        </DialogContent>
        <DialogContent>
          <Controller
            name="autocomplete"
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
