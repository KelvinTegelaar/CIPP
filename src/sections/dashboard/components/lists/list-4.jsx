import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';

export const List4 = () => (
  <List disablePadding>
    <ListItem
      disableGutters
      divider
      sx={{
        px: 3,
        py: 1.5
      }}
    >
      <ListItemText
        disableTypography
        primary={(
          <Typography variant="subtitle2">
            Full Name
          </Typography>
        )}
        secondary={(
          <Box
            sx={{
              flex: 1,
              mt: 0.5
            }}
          >
            <Typography
              color="text.secondary"
              variant="body2"
            >
              Natalie Rusell
            </Typography>
          </Box>
        )}
        sx={{ my: 0 }}
      />
    </ListItem>
    <ListItem
      disableGutters
      divider
      sx={{
        px: 3,
        py: 1.5
      }}
    >
      <ListItemText
        disableTypography
        primary={(
          <Typography variant="subtitle2">
            Email Address
          </Typography>
        )}
        secondary={(
          <Box
            sx={{
              flex: 1,
              mt: 0.5
            }}
          >
            <Typography
              color="text.secondary"
              variant="body2"
            >
              natalie.rusell@gmail.com
            </Typography>
          </Box>
        )}
        sx={{ my: 0 }}
      />
    </ListItem>
    <ListItem
      disableGutters
      sx={{
        px: 3,
        py: 1.5
      }}
    >
      <ListItemText
        disableTypography
        primary={(
          <Typography variant="subtitle2">
            Job Position
          </Typography>
        )}
        secondary={(
          <Box
            sx={{
              flex: 1,
              mt: 0.5
            }}
          >
            <Typography
              color="text.secondary"
              variant="body2"
            >
              Backend Developer
            </Typography>
          </Box>
        )}
        sx={{ my: 0 }}
      />
    </ListItem>
  </List>
);
