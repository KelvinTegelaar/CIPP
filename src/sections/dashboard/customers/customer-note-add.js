import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import PaperClipIcon from '@heroicons/react/24/outline/PaperClipIcon';
import {
  Button,
  Card,
  Divider,
  IconButton,
  InputBase,
  Stack,
  SvgIcon,
  Typography
} from '@mui/material';

export const CustomerNoteAdd = (props) => {
  const { disabled = false, onAdd, ...other } = props;
  const [content, setContent] = useState('');

  const handleChange = useCallback((event) => {
    setContent(event.target.value);
  }, []);

  const handleSend = useCallback(() => {
    onAdd?.(content);
    setContent('');
  }, [content, onAdd]);

  const canSend = !disabled && content.length > 0;

  return (
    <Card {...other}>
      <Stack
        alignItems="flex-start"
        direction="row"
        spacing={2}
        sx={{ p: 2 }}
      >
        <InputBase
          multiline
          onChange={handleChange}
          placeholder="Comment text..."
          sx={{ flexGrow: 1 }}
          value={content}
        />
        <IconButton size="small">
          <SvgIcon fontSize="small">
            <PaperClipIcon />
          </SvgIcon>
        </IconButton>
      </Stack>
      <Divider />
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        sx={{
          backgroundColor: (theme) => theme.palette.mode === 'dark'
            ? 'neutral.900'
            : 'neutral.50',
          p: 2
        }}
      >
        <Stack
          alignItems="center"
          direction="row"
          spacing={1}
        >
          <SvgIcon fontSize="small">
            <EyeIcon />
          </SvgIcon>
          <Typography variant="body2">
            Visible to all
          </Typography>
          <IconButton size="small">
            <SvgIcon fontSize="small">
              <ChevronDownIcon />
            </SvgIcon>
          </IconButton>
        </Stack>
        <Button
          disabled={!canSend}
          onClick={handleSend}
          variant="contained"
        >
          Send
        </Button>
      </Stack>
    </Card>
  );
};

CustomerNoteAdd.propTypes = {
  disabled: PropTypes.bool,
  onAdd: PropTypes.func
};
