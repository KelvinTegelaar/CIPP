import { useRouter } from 'next/router'
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
  Tooltip,
} from "@mui/material";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import { ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { createContext, useContext, useEffect } from "react";
import { useFormState } from "react-hook-form";
import { CippHead } from "../CippComponents/CippHead";

// Lets a page render its own Save button somewhere inside `children` (e.g. next to a
// Run Test button) while reusing this component's submit pipeline. Pair with hideSubmit.
const CippFormPageContext = createContext(null);
export const useCippFormPageActions = () => useContext(CippFormPageContext);

const getSubmitTooltip = ({ isPending, isValid, isDirty, allowResubmit }) => {
  if (isPending) return "Submitting...";
  if (!isValid) return "Please fix the validation errors before submitting";
  if (!allowResubmit && !isDirty) return "Make a change to the form to enable submission";
  return "";
};

const SubmitButton = ({ disabled, isPending, isValid, isDirty, allowResubmit, onClick }) => {
  const tooltip = getSubmitTooltip({ isPending, isValid, isDirty, allowResubmit });
  return (
    <Tooltip title={tooltip} arrow disableHoverListener={!disabled}>
      <span>
        <Button disabled={disabled} onClick={onClick} type="submit" variant="contained">
          Submit
        </Button>
      </span>
    </Tooltip>
  );
};

const CippFormPage = (props) => {
  const {
    title,
    backButtonTitle,
    titleButton,
    formPageType = 'Add',
    children,
    queryKey,
    formControl,
    postUrl,
    customDataformatter,
    resetForm = false,
    preserveNullValues = false,
    hideBackButton = false,
    hidePageType = false,
    hideTitle = false,
    hideSubmit = false,
    allowResubmit = false,
    addedButtons,
    onSubmitResult,
    ...other
  } = props
  const router = useRouter()
  //check if there are
  const postCall = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: queryKey,
    onResult: (result) => {
      if (onSubmitResult) {
        onSubmitResult(result)
      }
    },
  })

  const { isValid, isDirty } = useFormState({ control: formControl.control })

  useEffect(() => {
    if (router.query) {
      const { tenantFilter: _tenantFilter, ...queryWithoutTenant } = router.query
      const resetValues = {
        ...formControl.getValues(),
        ...queryWithoutTenant,
      }
      formControl.reset(resetValues)
    }
  }, [router])

  const handleBackClick = () => {
    router.back() // Navigate to the previous page when the button is clicked
  }

  useEffect(() => {
    if (postCall.isSuccess) {
      if (resetForm) {
        formControl.reset()
      }
    }
  }, [postCall.isSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = () => {
    formControl.trigger()
    // Check if the form is valid before proceeding
    if (!isValid) {
      return
    }
    const values = customDataformatter
      ? customDataformatter(formControl.getValues())
      : formControl.getValues();
    //remove all empty values or blanks (recursively)
    //when preserveNullValues is set, explicit nulls are kept so the API can
    //distinguish "clear this field" from "field omitted"
    const isEmptyValue = (value) =>
      value === "" || value === undefined || (!preserveNullValues && value === null);
    const removeEmpty = (obj) => {
      if (Array.isArray(obj)) {
        return obj
          .map((item) => (item && typeof item === "object" ? removeEmpty(item) : item))
          .filter((item) => {
            if (isEmptyValue(item)) return false;
            if (Array.isArray(item)) return item.length > 0;
            if (item !== null && typeof item === "object") return Object.keys(item).length > 0;
            return true;
          });
      }
      Object.keys(obj).forEach((key) => {
        if (isEmptyValue(obj[key])) {
          delete obj[key];
        } else if (obj[key] !== null && typeof obj[key] === "object") {
          obj[key] = removeEmpty(obj[key]);
          if (Array.isArray(obj[key]) ? obj[key].length === 0 : Object.keys(obj[key]).length === 0) {
            delete obj[key];
          }
        }
      });
      return obj;
    };
    const cleanedValues = removeEmpty(values);
    postCall.mutate({
      url: postUrl,
      data: cleanedValues,
    });
  };
  const formPageActions = {
    submit: formControl.handleSubmit(handleSubmit),
    isSubmitting: postCall.isPending,
    isValid,
    isDirty,
    allowResubmit,
  };

  return (
    <CippFormPageContext.Provider value={formPageActions}>
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
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
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
                <Box sx={{ mt: postCall.isIdle ? 0 : 2 }}>
                  <CippApiResults apiObject={postCall} />
                </Box>
              </CardContent>
              {!hideSubmit && (
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Stack spacing={2} direction="row">
                    {addedButtons && addedButtons}
                    <SubmitButton
                      disabled={postCall.isPending || !isValid || (!allowResubmit && !isDirty)}
                      isPending={postCall.isPending}
                      isValid={isValid}
                      isDirty={isDirty}
                      allowResubmit={allowResubmit}
                      onClick={formControl.handleSubmit(handleSubmit)}
                    />
                  </Stack>
                </CardActions>
              )}
            </Card>
          </Stack>
        </Container>
      </Box>
    </CippFormPageContext.Provider>
  )
}

export default CippFormPage
