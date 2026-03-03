import PropTypes from 'prop-types';
import { Avatar, Box, Button, Card, CardHeader, Divider, Stack } from '@mui/material';
import { PropertyList } from '../../../components/property-list';
import { PropertyListItem } from '../../../components/property-list-item';
import { getInitials } from '../../../utils/get-initials';

const statusMap = {
  complete: 'Complete',
  created: 'Created',
  delivered: 'Delivered',
  placed: 'Placed',
  processed: 'Processed'
};

export const OrderDetails = (props) => {
  const { order, onEdit, ...other } = props;
  const status = statusMap[order.status];

  return (
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
        title="Order Details"
      />
      <Divider />
      <Box
        sx={{
          px: 3,
          py: 1.5
        }}
      >
        <Avatar
          src={order.customer?.avatar}
          sx={{
            height: 64,
            width: 64
          }}
          variant="rounded"
        >
          {getInitials(order.customer?.name)}
        </Avatar>
      </Box>
      <Stack
        direction={{
          xs: 'column',
          md: 'row'
        }}
        sx={{
          '& > *': {
            width: {
              md: '50%'
            }
          }
        }}
      >
        <PropertyList>
          <PropertyListItem
            label="Customer"
            value={order.customer?.name}
          />
          <PropertyListItem
            label="Email Address"
            value={order.customer?.email}
          />
          <PropertyListItem
            label="Phone Number"
            value={order.customer?.phone}
          />
        </PropertyList>
        <PropertyList>
          <PropertyListItem
            label="Status"
            value={status}
          />
          <PropertyListItem
            label="Street"
            value={order.address?.street}
          />
          <PropertyListItem
            label="Country"
            value={order.address?.country}
          />
        </PropertyList>
      </Stack>
    </Card>
  );
};

OrderDetails.propTypes = {
  onEdit: PropTypes.func,
  order: PropTypes.object.isRequired
};
