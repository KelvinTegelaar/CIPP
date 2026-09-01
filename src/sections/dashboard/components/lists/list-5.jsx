import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';

export const List5 = () => (
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
          <Typography
            sx={{ minWidth: 180 }}
            variant="subtitle2"
          >
            Full Name
          </Typography>
        )}
        secondary={(
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary"
              }}
            >
              Natalie Rusell
            </Typography>
          </Box>
        )}
        sx={{
          alignItems: 'flex-start',
          display: 'flex',
          flexDirection: 'row',
          my: 0
        }}
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
          <Typography
            sx={{ minWidth: 180 }}
            variant="subtitle2"
          >
            Email Address
          </Typography>
        )}
        secondary={(
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary"
              }}
            >
              natalie.rusell@gmail.com
            </Typography>
          </Box>
        )}
        sx={{
          alignItems: 'flex-start',
          display: 'flex',
          flexDirection: 'row',
          my: 0
        }}
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
          <Typography
            sx={{ minWidth: 180 }}
            variant="subtitle2"
          >
            Job Position
          </Typography>
        )}
        secondary={(
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary"
              }}
            >
              Backend Developer
            </Typography>
          </Box>
        )}
        sx={{
          alignItems: 'flex-start',
          display: 'flex',
          flexDirection: 'row',
          my: 0
        }}
      />
    </ListItem>
  </List>
);
