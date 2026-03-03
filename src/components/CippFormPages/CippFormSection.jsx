import { Button, CardContent, CardActions } from "@mui/material";
import { ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { useEffect } from "react";
import { useFormState } from "react-hook-form";

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

  const { isValid } = useFormState({ control: formControl.control });

  useEffect(() => {
    if (postCall.isSuccess) {
      if (resetForm) {
        formControl.reset();
      }
    }
  }, [postCall.isSuccess]);

  const handleSubmit = () => {
    if (!isValid) {
      return;
    }
    let values = formControl.getValues();
    if (customDataformatter) {
      values = customDataformatter(values);
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
          disabled={postCall.isPending || !isValid}
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
