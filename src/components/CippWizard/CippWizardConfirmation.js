import { Alert, Button, Card, CircularProgress, Stack, Typography } from "@mui/material";
import { PropertyList } from "../property-list";
import { PropertyListItem } from "../property-list-item";
import { ApiPostCall } from "../../api/ApiCall";
import { LoadingButton } from "@mui/lab";
import { ResourceError } from "../resource-error";

export const CippWizardConfirmation = (props) => {
  const { onPreviousStep, values } = props;

  const postRequest = ApiPostCall({ urlFromData: true });

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h6">Step 4. Confirmation</Typography>
      </div>
      <Card variant="outlined">
        <PropertyList>
          <PropertyListItem label={"Deployment Region"} value={values.region} />
          <PropertyListItem label={"First User"} value={values.UserPrincipalName} />
        </PropertyList>
      </Card>
      {postRequest.data?.data && (
        <Alert severity={postRequest.data?.data?.success ? "success" : "warning"}>
          {postRequest.data?.data?.result}
        </Alert>
      )}
      {postRequest.isError && <ResourceError message={postRequest.error.message} />}
      <Stack alignItems="center" direction="row" justifyContent="flex-end" spacing={2}>
        <Button color="inherit" onClick={onPreviousStep} size="large" type="button">
          Back
        </Button>
        <LoadingButton
          loading={postRequest.isFetching || postRequest.isPending}
          size="large"
          type="submit"
          onClick={() => postRequest.mutate({ url: values.url, ...values })}
          variant="contained"
        >
          Confirm
        </LoadingButton>
      </Stack>
    </Stack>
  );
};
