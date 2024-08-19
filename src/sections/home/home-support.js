import {
  Avatar,
  avatarClasses,
  AvatarGroup,
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Unstable_Grid2 as Grid
} from '@mui/material';

const members = [
  {
    avatar: '/assets/support-stefania.png',
    name: 'Stefania Vladutu'
  },
  {
    avatar: '/assets/support-alexandru.png',
    name: 'Alexandru Comanescu'
  },
  {
    avatar: '/assets/support-adrian.png',
    name: 'Adrian Manea'
  }
];

export const HomeSupport = () => (
  <Box
    sx={{
      backgroundColor: 'background.paper',
      pt: '120px'
    }}
  >
    <Container maxWidth="lg">
      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.mode === 'dark'
            ? 'neutral.900'
            : 'neutral.50',
          borderColor: 'divider',
          borderRadius: 2,
          borderStyle: 'solid',
          borderWidth: 1
        }}
      >
        <Grid
          container
          sx={{
            pb: {
              xs: 3,
              md: 6
            },
            pt: {
              xs: 3,
              md: 8
            },
            px: {
              xs: 3,
              md: 8
            }
          }}
        >
          <Grid
            xs={12}
            md={6}
            sx={{
              borderRight: (theme) => ({
                md: `1px solid ${theme.palette.divider}`
              }),
              display: 'flex',
              flexDirection: 'column',
              mb: {
                xs: 4,
                md: 0
              },
              pr: {
                md: 4
              }
            }}
          >
            <Stack
              spacing={1}
              sx={{
                flexGrow: 1,
                mb: 4
              }}
            >
              <Typography variant="h4">
                Design Files
              </Typography>
              <Typography
                color="text.secondary"
                variant="subtitle1"
              >
                We&apos;ve included the source Figma files in Plus &amp;
                Extended licenses so you can get creative! Build layouts with confidence.
              </Typography>
            </Stack>
            <Stack
              alignItems="center"
              direction="row"
              flexWrap="wrap"
              gap={3}
              justifyContent="space-between"
            >
              <Button
                component="a"
                href="https://www.figma.com/file/xEAerPeQsTKImIS28QulSh"
                rel="nofollow noreferrer noopener"
                target="_blank"
              >
                Preview Figma Files
              </Button>
              <Stack
                alignItems="center"
                direction="row"
                spacing={3}
                sx={{
                  '& img': {
                    flexShrink: 0
                  }
                }}
              >
                <img src="/assets/logos/logo-react.svg" />
                <img src="/assets/logos/logo-typescript.svg" />
                <img src="/assets/logos/logo-figma.svg" />
              </Stack>
            </Stack>
          </Grid>
          <Grid
            xs={12}
            md={6}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              pl: {
                md: 4
              }
            }}
          >
            <Stack
              spacing={1}
              sx={{
                flexGrow: 1,
                mb: 4
              }}
            >
              <Typography variant="h4">
                Premium Support
              </Typography>
              <Typography
                color="text.secondary"
                variant="subtitle1"
              >
                Our support team is here to help you get started with any template-related questions.
                We answer pretty fast.
              </Typography>
            </Stack>
            <Stack
              alignItems="center"
              direction="row"
              flexWrap="wrap"
              gap={3}
              justifyContent="space-between"
            >
              <Button
                component="a"
                href="https://devias.io/contact"
                target="_blank"
              >
                Contact us
              </Button>
              <AvatarGroup
                sx={{
                  [`& .${avatarClasses.root}`]: {
                    borderColor: (theme) => theme.palette.mode === 'dark'
                      ? 'neutral.900'
                      : 'neutral.50'
                  }
                }}
              >
                {members.map((member) => (
                  <Avatar
                    key={member.name}
                    src={member.avatar}
                  />
                ))}
              </AvatarGroup>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Container>
  </Box>
);
