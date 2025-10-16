import { useRouter } from "next/router";
import {
  Box,
  Container,
  Stack,
  Button,
  SvgIcon,
  Typography,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import { ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { useEffect } from "react";
import { useFormState } from "react-hook-form";
import { CippHead } from "../CippComponents/CippHead";

const CippFormPage = (props) => {
  const {
    title,
    backButtonTitle,
    titleButton,
    formPageType = "Add",
    children,
    queryKey,
    formControl,
    postUrl,
    customDataformatter,
    resetForm = false,
    hideBackButton = false,
    hidePageType = false,
    hideTitle = false,
    hideSubmit = false,
    allowResubmit = false,
    addedButtons,
    ...other
  } = props;
  const router = useRouter();
  //check if there are
  const postCall = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: queryKey,
  });

  const { isValid, isDirty } = useFormState({ control: formControl.control });

  useEffect(() => {
    delete router.query.tenantFilter;

    if (router.query) {
      const resetValues = {
        ...formControl.getValues(),
        ...router.query,
      };
      formControl.reset(resetValues);
    }
  }, [router]);

  const handleBackClick = () => {
    router.back(); // Navigate to the previous page when the button is clicked
  };

  useEffect(() => {
    if (postCall.isSuccess) {
      if (resetForm) {
        formControl.reset();
      }
    }
  }, [postCall.isSuccess]);

  const handleSubmit = () => {
    formControl.trigger();
    // Check if the form is valid before proceeding
    if (!isValid) {
      return;
    }
    const values = customDataformatter
      ? customDataformatter(formControl.getValues())
      : formControl.getValues();
    //remove all empty values or blanks
    Object.keys(values).forEach((key) => {
      if (values[key] === "" || values[key] === null) {
        delete values[key];
      }
    });
    postCall.mutate({
      url: postUrl,
      data: values,
    });
  };
  return (
    <>
      <CippHead title={title} />
      <Box
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={4}>
            {!hideTitle && (
              <Stack spacing={2}>
                {!hideBackButton && (
                  <div>
                    <Button
                      color="inherit"
                      onClick={handleBackClick} // Go back to the previous page
                      startIcon={
                        <SvgIcon fontSize="small">
                          <ArrowLeftIcon />
                        </SvgIcon>
                      }
                    >
                      {backButtonTitle}
                    </Button>
                  </div>
                )}

                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography variant="h4">
                    {!hidePageType && <>{formPageType} - </>}
                    {title}
                  </Typography>
                  {titleButton && titleButton}
                </div>
              </Stack>
            )}

            <Card>
              <CardContent>
                {children}
                <CippApiResults apiObject={postCall} />
              </CardContent>
              {!hideSubmit && (
                <CardActions sx={{ justifyContent: "flex-end" }}>
                  <Stack spacing={2} direction="row">
                    {addedButtons && addedButtons}
                    <Button
                      disabled={postCall.isPending || !isValid || (!allowResubmit && !isDirty)}
                      onClick={formControl.handleSubmit(handleSubmit)}
                      type="submit"
                      variant="contained"
                    >
                      Submit
                    </Button>
                  </Stack>
                </CardActions>
              )}
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default CippFormPage;
