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
    if (router.query) {
      const { tenantFilter: _tenantFilter, ...queryWithoutTenant } = router.query;
      const resetValues = {
        ...formControl.getValues(),
        ...queryWithoutTenant,
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
    //remove all empty values or blanks (recursively)
    const removeEmpty = (obj) => {
      if (Array.isArray(obj)) {
        return obj
          .map((item) => (item && typeof item === "object" ? removeEmpty(item) : item))
          .filter((item) => item !== "" && item !== null && item !== undefined);
      }
      Object.keys(obj).forEach((key) => {
        if (obj[key] === "" || obj[key] === null || obj[key] === undefined) {
          delete obj[key];
        } else if (typeof obj[key] === "object") {
          obj[key] = removeEmpty(obj[key]);
          if (!Array.isArray(obj[key]) && Object.keys(obj[key]).length === 0) {
            delete obj[key];
          }
        }
      });
      return obj;
    };
    removeEmpty(values);
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
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2}>
            {!hideTitle && (
              <Stack spacing={2}>
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
