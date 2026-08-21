import { useRouter } from "next/router";
import { Box, Container, Stack, Button, SvgIcon, Typography, Card } from "@mui/material";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import { CippHead } from "../CippComponents/CippHead";
import { useTitleClaimedByTabPicker } from "../../layouts/tab-navigation-context";
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
  // On mobile the tab picker directly above already reads as this page's heading whenever
  // its current tab label is the same string — printing the h4 too said "CIPP Roles" twice.
  const titleClaimed = useTitleClaimedByTabPicker(title);

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
            md, so a 600-900px viewport got 24px here and 16px everywhere else. xs matches
            the table pages' card rhythm (12px to a card edge, not 16+16 before any text) —
            the card's own CardContent still pays 16 inside. */}
        <Container maxWidth={cardSize} sx={{ px: { xs: 1.5, md: 3 } }}>
          <Stack spacing={2}>
            {hideTitleText !== true && !titleClaimed && (
              <Stack spacing={2}>
                <div>
                  <Typography variant="h4">{title}</Typography>
                </div>
              </Stack>
            )}
            {infoBar}
            <Card>{children}</Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default CippPageCard;
