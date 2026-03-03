import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import numeral from 'numeral';
import CubeIcon from '@heroicons/react/24/outline/CubeIcon';
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  Divider,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { ConfirmationDialog } from '../../../components/confirmation-dialog';
import { ResourceUnavailable } from '../../../components/resource-unavailable';
import { Scrollbar } from '../../../components/scrollbar';
import { useDialog } from '../../../hooks/use-dialog';
import { ProductVariantDialog } from './product-variant-dialog';

export const ProductVariants = (props) => {
  const { onVariantCreated, onVariantDeleted, onVariantUpdated, variants = [], ...other } = props;
  const createDialog = useDialog();
  const deleteDialog = useDialog();
  const updateDialog = useDialog();

  const handleVariantCreated = useCallback((variant) => {
    createDialog.handleClose();
    onVariantCreated?.(variant);
  }, [createDialog, onVariantCreated]);

  const handleVariantDelete = useCallback((variantId) => {
    // Do API call here to behave the same as created and updated actions
    onVariantDeleted?.(variantId);
    deleteDialog.handleClose();
  }, [deleteDialog, onVariantDeleted]);

  const handleVariantUpdated = useCallback((variant) => {
    updateDialog.handleClose();
    onVariantUpdated?.(variant);
  }, [updateDialog, onVariantUpdated]);

  const hasVariants = variants.length > 0;

  const updatingVariant = updateDialog.open
    ? variants.find((variant) => variant.id === updateDialog.data)
    : undefined;

  return (
    <>
      <Card {...other}>
        <CardHeader
          action={(
            <Button
              color="inherit"
              onClick={() => createDialog.handleOpen()}
            >
              Add
            </Button>
          )}
          title="Variants"
        />
        <Divider />
        <Scrollbar>
          <Table sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  Name
                </TableCell>
                <TableCell>
                  SKU
                </TableCell>
                <TableCell>
                  Created
                </TableCell>
                <TableCell>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {variants.map((variant) => {
                const createdAt = format(variant.createdAt, 'MMM dd yyyy');
                const price = numeral(variant.price).format(`${variant.currency}0,0.00`);

                return (
                  <TableRow key={variant.id}>
                    <TableCell>
                      <Stack
                        alignItems="center"
                        direction="row"
                        spacing={2}
                      >
                        <Avatar
                          src={variant.image}
                          sx={{
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                            height: 48,
                            width: 48
                          }}
                          variant="rounded"
                        >
                          <SvgIcon fontSize="small">
                            <CubeIcon />
                          </SvgIcon>
                        </Avatar>
                        <div>
                          <Typography variant="body2">
                            {variant.name}
                          </Typography>
                          <Typography
                            color="text.secondary"
                            variant="body2"
                          >
                            {price}
                          </Typography>
                        </div>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {variant.sku}
                    </TableCell>
                    <TableCell>
                      {createdAt}
                    </TableCell>
                    <TableCell sx={{ width: 135 }}>
                      <Stack
                        alignItems="center"
                        direction="row"
                        divider={(
                          <Divider
                            flexItem
                            orientation="vertical"
                          />
                        )}
                        spacing={2}
                      >
                        <Button
                          onClick={() => updateDialog.handleOpen(variant.id)}
                          size="small"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => deleteDialog.handleOpen(variant.id)}
                          size="small"
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Scrollbar>
        {!hasVariants && (
          <ResourceUnavailable
            message="Product does not have variants"
            onCreate={createDialog.handleOpen}
            sx={{ m: 2 }}
          />
        )}
      </Card>
      <ProductVariantDialog
        action="create"
        onClose={createDialog.handleClose}
        onVariantCreated={handleVariantCreated}
        open={createDialog.open}
      />
      <ProductVariantDialog
        action="update"
        onClose={updateDialog.handleClose}
        onVariantUpdated={handleVariantUpdated}
        open={updateDialog.open}
        variant={updatingVariant}
      />
      <ConfirmationDialog
        message="Are you sure you want to delete this variant? This can't be undone."
        onCancel={deleteDialog.handleClose}
        onConfirm={() => handleVariantDelete(deleteDialog.data)}
        open={deleteDialog.open}
        title="Delete variant"
        variant="error"
      />
    </>
  );
};

ProductVariants.propTypes = {
  onVariantCreated: PropTypes.func,
  onVariantDeleted: PropTypes.func,
  onVariantUpdated: PropTypes.func,
  variants: PropTypes.array
};
