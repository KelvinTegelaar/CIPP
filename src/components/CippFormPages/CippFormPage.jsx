import { useRouter } from 'next/router'
import { useTabNavigation, useTitleClaimedByTabPicker } from '../../layouts/tab-navigation-context'
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
} from '@mui/material'
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft'
import { ApiPostCall } from '../../api/ApiCall'
import { CippApiResults } from '../CippComponents/CippApiResults'
import { createContext, useContext, useEffect } from 'react'
import { useFormState } from 'react-hook-form'
import { CippHead } from '../CippComponents/CippHead'

// Lets a page render its own Save button somewhere inside `children` (e.g. next to a
// Run Test button) while reusing this component's submit pipeline. Pair with hideSubmit.
const CippFormPageContext = createContext(null)
export const useCippFormPageActions = () => useContext(CippFormPageContext)

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
  const ancestorHasGutters = useTabNavigation()?.providesGutters ?? false
  // On mobile the tab picker directly above already reads as this page's heading whenever it
  // shows the same text this h4 would (SAM App Roles printed its name twice in a row). The
  // claim compares what would actually render, page-type prefix included; a row that also
  // carries a titleButton keeps rendering, because the button has nowhere else to live.
  const renderedTitle = hidePageType ? title : `${formPageType} - ${title}`
  const titleClaimed = useTitleClaimedByTabPicker(renderedTitle) && !titleButton
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
      : formControl.getValues()
    //remove all empty values or blanks (recursively)
    //when preserveNullValues is set, explicit nulls are kept so the API can
    //distinguish "clear this field" from "field omitted"
    const isEmptyValue = (value) =>
      value === '' || value === undefined || (!preserveNullValues && value === null)
    const removeEmpty = (obj) => {
      if (Array.isArray(obj)) {
        return obj
          .map((item) => (item && typeof item === 'object' ? removeEmpty(item) : item))
          .filter((item) => !isEmptyValue(item))
      }
      Object.keys(obj).forEach((key) => {
        if (isEmptyValue(obj[key])) {
          delete obj[key]
        } else if (obj[key] !== null && typeof obj[key] === 'object') {
          obj[key] = removeEmpty(obj[key])
          if (!Array.isArray(obj[key]) && Object.keys(obj[key]).length === 0) {
            delete obj[key]
          }
        }
      })
      return obj
    }
    removeEmpty(values)
    postCall.mutate({
      url: postUrl,
      data: values,
    })
  }
  const formPageActions = {
    submit: formControl.handleSubmit(handleSubmit),
    isSubmitting: postCall.isPending,
    isValid,
    isDirty,
    allowResubmit,
  }

  return (
    <CippFormPageContext.Provider value={formPageActions}>
      <CippHead title={title} />
      <Box
        sx={{
          flexGrow: 1,
        }}
      >
        <Container
          maxWidth="lg"
          // HeaderedTabbedLayout already wraps children in a gutter-bearing Container, so on
          // those pages this one would double it — 32px of indent on a 390px screen. Desktop
          // keeps the standard 24px either way.
          sx={ancestorHasGutters ? { px: { xs: 0, sm: 3 } } : undefined}
        >
          <Stack spacing={2}>
            {!hideTitle && !titleClaimed && (
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  useFlexGap
                  sx={{ columnGap: 2, rowGap: 1 }}
                >
                  <Typography variant="h4">
                    {!hidePageType && <>{formPageType} - </>}
                    {title}
                  </Typography>
                  {titleButton && titleButton}
                </Stack>
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
                  {/* Stacked full-width on phones: Submit is the primary action of the whole
                      page and shouldn't be a narrow target crowded by the extra buttons. */}
                  <Stack
                    spacing={2}
                    direction={{ xs: 'column-reverse', sm: 'row' }}
                    sx={{
                      width: { xs: '100%', sm: 'auto' },
                      '& .MuiButton-root': { minHeight: { xs: 44, sm: 'auto' } },
                    }}
                  >
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
    </CippFormPageContext.Provider>
  )
}

export default CippFormPage
