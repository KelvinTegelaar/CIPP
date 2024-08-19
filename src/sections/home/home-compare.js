import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import {
  Box,
  Button,
  Container,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  SvgIcon,
  Typography,
  Unstable_Grid2 as Grid
} from '@mui/material';

const freeFeatures = [
  '4 page examples',
  'Community support',
  'Free design assets (Figma)'
];

const proFeatures = [
  '30 page examples',
  'Premium support',
  'Pro design assets (Figma)',
  'Authentication with Amplify, Auth0, Firebase and JWT',
  'Data states',
  'Built with Mocked API'
];

export const HomeCompare = () => (
  <Box
    sx={{
      backgroundColor: 'background.paper',
      py: '120px'
    }}
  >
    <Container maxWidth="md">
      <Typography
        align="center"
        sx={{ mb: 8 }}
        variant="h2"
      >
        Try the free demo
      </Typography>
      <Grid
        container
        spacing={3}
      >
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
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              p: 3
            }}
          >
            <Typography
              color="text.disabled"
              variant="overline"
            >
              Version
            </Typography>
            <Typography variant="h4">
              Free
            </Typography>
            <List
              sx={{
                flexGrow: 1,
                px: 1,
                py: 2
              }}
            >
              {freeFeatures.map((feature) => (
                <ListItem
                  disableGutters
                  key={feature}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 'auto',
                      mr: 1.5,
                      color: 'success.main'
                    }}
                  >
                    <SvgIcon fontSize="small">
                      <CheckCircleIcon />
                    </SvgIcon>
                  </ListItemIcon>
                  <ListItemText
                    primary={feature}
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
              ))}
            </List>
            <Divider />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 2
              }}
            >
              <Button
                component="a"
                endIcon={(
                  <SvgIcon fontSize="small">
                    <ArrowTopRightOnSquareIcon />
                  </SvgIcon>
                )}
                href="https://github.com/devias-io/carpatin-dashboard-free"
                size="large"
                target="_target"
                variant="outlined"
              >
                Try the Demo
              </Button>
            </Box>
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
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              p: 3
            }}
          >
            <Typography
              color="text.disabled"
              variant="overline"
            >
              Version
            </Typography>
            <Typography variant="h4">
              Pro
            </Typography>
            <List
              sx={{
                flexGrow: 1,
                px: 1,
                py: 2
              }}
            >
              {proFeatures.map((feature) => (
                <ListItem
                  disableGutters
                  key={feature}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 'auto',
                      mr: 1.5,
                      color: 'success.main'
                    }}
                  >
                    <SvgIcon fontSize="small">
                      <CheckCircleIcon />
                    </SvgIcon>
                  </ListItemIcon>
                  <ListItemText
                    primary={feature}
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
              ))}
            </List>
            <Divider />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 2
              }}
            >
              <Button
                component="a"
                endIcon={(
                  <SvgIcon fontSize="small">
                    <ArrowTopRightOnSquareIcon />
                  </SvgIcon>
                )}
                href="https://mui.com/store/items/carpatin-dashboard"
                size="large"
                target="_target"
                variant="contained"
              >
                Purchase Pro Version
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  </Box>
);
