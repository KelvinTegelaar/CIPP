import { useState } from 'react';
import PropTypes from 'prop-types';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  SvgIcon,
  Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { FileDropzone } from './file-dropzone';

export const ImagesDialog = (props) => {
  const { onClose, onSelect, open = false, ...other } = props;
  const [uploaded, setUploaded] = useState([]);
  const [selected, setSelected] = useState([]);

  const handleDrop = (files) => {

    // Here you should upload the images and get the URL back.
    // We simulate that by creating Object URLs from the file data.

    const images = files.map((file) => URL.createObjectURL(file));

    setUploaded(prevState => ([
      ...prevState,
      ...images
    ]));

    setSelected(prevState => ([
      ...prevState,
      ...images
    ]));
  };

  const handleSelectOne = (image) => {
    if (selected.includes(image)) {
      setSelected((prevState) => {
        return prevState.filter((_image) => _image !== image);
      });
    } else {
      setSelected((prevSelectedImages) => [...prevSelectedImages, image]);
    }
  };

  const handleDeleteOne = (image) => {
    setUploaded((prevState) => {
      return prevState.filter((_image) => _image !== image);
    });
  };

  const handleSelect = () => {
    onSelect?.(selected);
    setSelected([]);
    setUploaded([]);
  };

  return (
    <Dialog
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          width: '100%'
        }
      }}
      {...other}>
      <DialogTitle>
        <Typography
          sx={{ mb: 1 }}
          variant="inherit"
        >
          Upload Images
        </Typography>
        <Typography
          color="text.secondary"
          variant="body2"
        >
          You can only choose images
        </Typography>
      </DialogTitle>
      <DialogContent>
        <FileDropzone
          accept={{ 'image/*': [] }}
          caption="Browse images"
          onDrop={handleDrop}
          sx={{ mb: 3 }}
        />
        <Stack
          alignItems="center"
          direction="row"
          flexWrap="wrap"
          gap={2}
        >
          {uploaded.map((image) => {
            const isSelected = selected.includes(image);

            return (
              <Box
                key={image}
                onClick={() => handleSelectOne(image)}
                sx={{
                  backgroundImage: `url(${image})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  borderRadius: 1,
                  cursor: 'pointer',
                  height: 122,
                  flexGrow: 0,
                  flexShrink: 0,
                  overflow: 'hidden',
                  position: 'relative',
                  width: 122,
                  ...(isSelected && {
                    boxShadow: (theme) => `0px 0px 0px 2px ${theme.palette.primary.main}`
                  }),
                  '&:hover': {
                    '& > div': {
                      opacity: 1
                    }
                  }
                }}
              >
                <Box
                  sx={{
                    alignItems: 'center',
                    backgroundColor: (theme) => alpha(theme.palette.neutral[900], 0.8),
                    display: 'flex',
                    height: '100%',
                    justifyContent: 'center',
                    left: 0,
                    opacity: 0,
                    position: 'absolute',
                    top: 0,
                    width: '100%'
                  }}
                >
                  <IconButton
                    color="error"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteOne(image);
                    }}
                  >
                    <SvgIcon fontSize="small">
                      <TrashIcon />
                    </SvgIcon>
                  </IconButton>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          color="inherit"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSelect}
          variant="contained"
        >
          Select
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ImagesDialog.propTypes = {
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
  open: PropTypes.bool,
  selected: PropTypes.arrayOf(PropTypes.string.isRequired)
};
