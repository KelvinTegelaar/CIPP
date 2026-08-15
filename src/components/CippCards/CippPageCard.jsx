import { useRouter } from "next/router";
import { Box, Container, Stack, Button, SvgIcon, Typography, Card } from "@mui/material";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import { CippHead } from "../CippComponents/CippHead";
const CippPageCard = (props) => {
  const {
    title,
    backButtonTitle = "Back",
    children,
    cardSize = "xl",
    hideTitleText = false,
    hideBackButton = false,
    noTenantInHead = false,
    infoBar,
  } = props;
  const router = useRouter();

  const handleBackClick = () => {
    router.back(); // Navigate to the previous page when the button is clicked
  };

  return (
    <>
      <CippHead title={title} noTenant={noTenantInHead} />
      <Box
        sx={{
          flexGrow: 1,
          pb: { xs: 2, md: 4 },
        }}
      >
        {/* MUI's Container widens its gutters at sm; every layout in this app switches at
            md, so a 600-900px viewport got 24px here and 16px everywhere else. */}
        <Container maxWidth={cardSize} sx={{ px: { xs: 2, md: 3 } }}>
          <Stack spacing={2}>
            <Stack spacing={2}>
              {hideTitleText !== true && (
                <div>
                  <Typography variant="h4">{title}</Typography>
                </div>
              )}
            </Stack>
            {infoBar}
            <Card>{children}</Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default CippPageCard;
