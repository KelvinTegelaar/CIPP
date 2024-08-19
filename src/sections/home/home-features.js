import ArrowDownOnSquareIcon from '@heroicons/react/24/outline/ArrowDownOnSquareIcon';
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon';
import {
  Avatar,
  Box,
  Container,
  Divider,
  Stack,
  SvgIcon,
  Typography,
  Unstable_Grid2 as Grid
} from '@mui/material';

export const HomeFeatures = () => (
  <Box
    sx={{
      backgroundColor: 'background.paper',
      py: '120px'
    }}
  >
    <Container maxWidth="lg">
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography
            align="center"
            variant="h2"
          >
            Packed with features
          </Typography>
          <Typography
            align="center"
            color="text.secondary"
          >
            More than 30 screens, utilities and hooks for your product development
          </Typography>
        </Stack>
        <div>
          <Grid
            container
            spacing={3}
          >
            <Grid xs={12}>
              <Stack
                direction="row"
                flexWrap={{
                  xs: 'wrap',
                  md: 'nowrap'
                }}
                gap={3}
                sx={{
                  backgroundColor: (theme) => theme.palette.mode === 'dark'
                    ? 'neutral.900'
                    : 'neutral.50',
                  borderRadius: '10px',
                  p: 3
                }}
              >
                <Box
                  sx={{
                    fontSize: 0,
                    '& img': {
                      maxHeight: 350,
                      width: '100%'
                    }
                  }}
                >
                  <img src="/assets/home-features-auth.png" />
                </Box>
                <Stack
                  justifyContent="center"
                  spacing={1}
                >
                  <Typography variant="h4">
                    Authentication
                  </Typography>
                  <Typography color="text.secondary">
                    The template comes with Cognito, Firebase, Auth0 and JWT Auth systems installed and
                    configured. Get up and running in a matter of minutes.
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid
              xs={12}
              md={6}
            >
              <Box
                sx={{
                  backgroundColor: (theme) => theme.palette.mode === 'dark'
                    ? 'neutral.900'
                    : 'neutral.50',
                  borderRadius: '10px',
                  p: 6
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    fontSize: 0,
                    justifyContent: 'center',
                    mb: 3,
                    overflow: 'hidden',
                    '& img': {
                      borderTopLeftRadius: '20px',
                      borderTopRightRadius: '20px',
                      boxShadow: 16,
                      maxWidth: '100%',
                      width: 360
                    }
                  }}
                >
                  <img src="/assets/home-features-states.png" />
                </Box>
                <Typography
                  sx={{ mb: 1 }}
                  variant="h5"
                >
                  Loading and Error states
                </Typography>
                <Typography color="text.secondary">
                  Screens come connected to a fake server api client and state management system,
                  and can be hooked to your real server in no time.
                </Typography>
              </Box>
            </Grid>
            <Grid
              xs={12}
              md={6}
            >
              <Box
                sx={{
                  backgroundColor: (theme) => theme.palette.mode === 'dark'
                    ? 'neutral.900'
                    : 'neutral.50',
                  borderRadius: '10px',
                  p: 6
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    fontSize: 0,
                    justifyContent: 'center',
                    mb: 3,
                    overflow: 'hidden',
                    '& img': {
                      borderTopLeftRadius: '20px',
                      borderTopRightRadius: '20px',
                      boxShadow: 16,
                      maxWidth: '100%',
                      width: 360
                    }
                  }}
                >
                  <img src="/assets/home-features-filters.png" />
                </Box>
                <Typography
                  sx={{ mb: 1 }}
                  variant="h5"
                >
                  Advanced Features
                </Typography>
                <Typography color="text.secondary">
                  When it comes to management, it’s important to have good tools for specific needs,
                  so we included a powerful filter system so you won’t have to build one.
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Divider
            sx={{
              mb: 8,
              mt: 6
            }}
          />
          <Grid container>
            <Grid
              xs={12}
              md={6}
              sx={{
                borderRight: (theme) => ({
                  md: `1px solid ${theme.palette.divider}`
                })
              }}
            >
              <Box
                sx={{
                  pl: 2,
                  pr: {
                    xs: 2,
                    md: 5
                  },
                  py: 2
                }}
              >
                <Avatar
                  sx={{
                    backgroundColor: 'warning.main',
                    color: 'warning.contrastText',
                    height: 64,
                    width: 64
                  }}
                >
                  <SvgIcon fontSize="large">
                    <Squares2X2Icon />
                  </SvgIcon>
                </Avatar>
                <Typography
                  sx={{ my: 1 }}
                  variant="h5"
                >
                  Responsive
                </Typography>
                <Typography color="text.secondary">
                  Fully responsive templates. Layouts are created with mobile in mind
                  to make your project ready for any type of end-user.
                </Typography>
              </Box>
            </Grid>
            <Grid
              xs={12}
              md={6}
            >
              <Box
                sx={{
                  pl: {
                    xs: 2,
                    md: 5
                  },
                  pr: 2,
                  py: 2
                }}
              >
                <Avatar
                  sx={{
                    backgroundColor: 'success.main',
                    color: 'success.contrastText',
                    height: 64,
                    width: 64
                  }}
                >
                  <SvgIcon fontSize="large">
                    <ArrowDownOnSquareIcon />
                  </SvgIcon>
                </Avatar>
                <Typography
                  sx={{ my: 1 }}
                  variant="h5"
                >
                  Free Updates
                </Typography>
                <Typography color="text.secondary">
                  We continuously deploy new updates which include updated dependencies,
                  new screens and bug fixes.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </div>
      </Stack>
    </Container>
  </Box>
);
