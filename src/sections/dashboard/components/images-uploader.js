import { useCallback, useState } from 'react';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  SvgIcon,
  Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ImagesDialog } from '../../../components/images-dialog';
import { useDialog } from '../../../hooks/use-dialog';

export const ImagesUploader = () => {
  const dialog = useDialog();
  const [images, setImages] = useState([
    '/assets/products/product-1.png',
    '/assets/products/product-5.png',
    '/assets/products/product-7.png'
  ]);

  const handleSelectMany = useCallback((images) => {
    dialog.handleClose();
    setImages((prevState) => ([
      ...prevState,
      ...images
    ]));
  }, [dialog]);

  const handleDeleteOne = useCallback((image) => {
    setImages((prevState) => {
      return prevState.filter((_image) => _image !== image);
    });
  }, []);

  return (
    <>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle2">
              Images
            </Typography>
            <Stack spacing={1}>
              <div>
                <Button
                  onClick={dialog.handleOpen}
                  variant="contained"
                >
                  Browse
                </Button>
              </div>
              <Stack
                alignItems="center"
                direction="row"
                flexWrap="wrap"
                gap={2}
              >
                {images.map((image) => (
                  <Box
                    key={image}
                    sx={{
                      backgroundImage: `url(${image})`,
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                      borderRadius: 1,
                      flexGrow: 0,
                      flexShrink: 0,
                      height: 126,
                      overflow: 'hidden',
                      position: 'relative',
                      width: 126,
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
                        onClick={() => handleDeleteOne(image)}
                      >
                        <SvgIcon fontSize="small">
                          <TrashIcon />
                        </SvgIcon>
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      <ImagesDialog
        onClose={dialog.handleClose}
        onSelect={handleSelectMany}
        open={dialog.open}
      />
    </>
  );
};
