import { Button, CardContent, CardActions } from "@mui/material";
import { ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { useEffect } from "react";

const CippFormSection = (props) => {
  const {
    children,
    queryKey,
    formControl,
    postUrl,
    customDataformatter,
    relatedQueryKeys,
    resetForm = true,
  } = props;

  const postCall = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: relatedQueryKeys,
  });

  useEffect(() => {
    if (postCall.isSuccess) {
      if (resetForm) {
        formControl.reset();
      }
    }
  }, [postCall.isSuccess]);

  const handleSubmit = () => {
    const values = formControl.getValues();
    if (customDataformatter) {
      customDataformatter(values);
    }
    postCall.mutate({
      url: postUrl,
      data: values,
      queryKey: queryKey,
    });
  };
  return (
    <>
      <CardContent>
        {children}
        <CippApiResults apiObject={postCall} />
      </CardContent>

      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Button
          disabled={postCall.isPending}
          onClick={formControl.handleSubmit(handleSubmit)}
          type="submit"
          variant="contained"
        >
          Submit
        </Button>
      </CardActions>
    </>
  );
};

export default CippFormSection;
