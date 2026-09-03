import PropTypes from 'prop-types';
import { CippIcons } from '../utils/icon-registry';
import { useDropzone } from 'react-dropzone';
import { Avatar, Box, SvgIcon, Typography } from '@mui/material';

export const FileDropzone = (props) => {
  const { accept, caption, maxFiles, maxSize, minSize, onDrop, sx } = props;
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    maxSize,
    minSize,
    onDrop
  });

  return (
    <Box
      sx={{
        alignItems: 'center',
        borderColor: (theme) => theme.palette.mode === 'dark'
          ? 'neutral.800'
          : 'neutral.200',
        borderRadius: 1,
        borderStyle: 'dashed',
        borderWidth: 1,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        justifyContent: 'center',
        outline: 'none',
        width: '100%',
        py: 2,
        ...(isDragActive && {
          borderColor: 'primary.main',
          backgroundColor: 'action.hover'
        }),
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: 'action.hover'
        },
        ...sx
      }}
      {...getRootProps()}>
      {/* No backgroundColor: the theme's Avatar override already picks a surface per mode,
          and the hard-coded neutral.200 was an off-white disc on a dark card. */}
      <Avatar
        sx={{
          color: 'text.secondary',
          height: 42,
          width: 42
        }}
      >
        <SvgIcon fontSize="small">
          <CippIcons.ArrowUpOnSquareIcon />
        </SvgIcon>
      </Avatar>
      {caption && (
        <Typography
          align="center"
          variant="caption"
          sx={{
            color: "text.secondary",
            mt: 1
          }}>
          {caption}
        </Typography>
      )}
      <input {...getInputProps()} />
    </Box>
  );
};

FileDropzone.propTypes = {
  accept: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
  caption: PropTypes.string,
  maxFiles: PropTypes.number,
  maxSize: PropTypes.number,
  minSize: PropTypes.number,
  onDrop: PropTypes.func,
  sx: PropTypes.object
};
