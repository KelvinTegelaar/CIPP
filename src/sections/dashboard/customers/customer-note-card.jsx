import PropTypes from 'prop-types';
import { formatDistanceToNowStrict } from 'date-fns';
import { Avatar, Button, Card, Stack, Typography } from '@mui/material';

export const CustomerNoteCard = (props) => {
  const { authorAvatar, authorName, content, createdAt, deletable, id, onDelete, ...other } = props;

  const ago = formatDistanceToNowStrict(createdAt);

  return (
    <Card {...other}>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: "flex-start",
          p: 2
        }}>
        <Avatar src={authorAvatar} />
        <Stack
          spacing={1}
          sx={{ flexGrow: 1 }}
        >
          <Typography variant="h6">
            {authorName}
          </Typography>
          <Typography variant="body2">
            {content}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              justifyContent: "space-between"
            }}>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary"
              }}
            >
              {ago} ago
            </Typography>
            {deletable && (
              <Button
                color="inherit"
                onClick={() => onDelete?.(id)}
                size="small"
              >
                Delete
              </Button>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};

CustomerNoteCard.propTypes = {
  authorAvatar: PropTypes.string,
  authorName: PropTypes.string,
  content: PropTypes.string.isRequired,
  createdAt: PropTypes.number.isRequired,
  deletable: PropTypes.bool,
  id: PropTypes.string.isRequired,
  onDelete: PropTypes.func
};
