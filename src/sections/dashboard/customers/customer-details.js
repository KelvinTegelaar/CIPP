import { useCallback } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon';
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  Divider,
  IconButton,
  Stack,
  SvgIcon
} from '@mui/material';
import { ActionList } from '../../../components/action-list';
import { ActionListItem } from '../../../components/action-list-item';
import { ConfirmationDialog } from '../../../components/confirmation-dialog';
import { PropertyList } from '../../../components/property-list';
import { PropertyListItem } from '../../../components/property-list-item';
import { useDialog } from '../../../hooks/use-dialog';

export const CustomerDetails = (props) => {
  const { customer, onEdit, ...other } = props;
  const deleteDialog = useDialog();

  const handlePreview = useCallback(() => {
    toast.error('This action is not available on demo');
  }, []);

  const handleDelete = useCallback(() => {
    deleteDialog.handleClose();
    toast.success('Deletion scheduled');
  }, [deleteDialog]);

  return (
    <>
      <Card {...other}>
        <CardHeader
          action={(
            <Button
              color="inherit"
              onClick={onEdit}
            >
              Edit
            </Button>
          )}
          title="Contact Details"
        />
        <Divider />
        <Stack
          alignItems="center"
          direction="row"
          spacing={1}
          sx={{
            px: 3,
            py: 1.5
          }}
        >
          <Avatar
            src={customer.avatar}
            sx={{
              height: 64,
              width: 64
            }}
            variant="rounded"
          />
          <IconButton>
            <SvgIcon fontSize="small">
              <ArrowTopRightOnSquareIcon />
            </SvgIcon>
          </IconButton>
        </Stack>
        <PropertyList>
          <PropertyListItem
            divider
            label="Name"
            value={customer.name}
          />
          <PropertyListItem
            divider
            label="Email address"
            value={customer.email}
          />
          <PropertyListItem
            divider
            label="Phone"
            value={customer.phone}
          />
          <PropertyListItem
            label="Country"
            value={customer.country}
          />
          <PropertyListItem
            divider
            label="Street"
            value={customer.street}
          />
        </PropertyList>
        <Divider />
        <ActionList>
          <ActionListItem
            icon={(
              <SvgIcon fontSize="small">
                <EyeIcon />
              </SvgIcon>
            )}
            onClick={handlePreview}
            label="Preview"
          />
          <ActionListItem
            icon={(
              <SvgIcon fontSize="small">
                <TrashIcon />
              </SvgIcon>
            )}
            label="Delete User Data"
            onClick={deleteDialog.handleOpen}
          />
        </ActionList>
      </Card>
      <ConfirmationDialog
        message="Are you sure you want to delete the user data? This can't be undone."
        onCancel={deleteDialog.handleClose}
        onConfirm={handleDelete}
        open={deleteDialog.open}
        title="Delete user data"
        variant="error"
      />
    </>
  );
};

CustomerDetails.propTypes = {
  customer: PropTypes.object.isRequired,
  onEdit: PropTypes.func
};
