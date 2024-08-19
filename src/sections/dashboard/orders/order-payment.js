import PropTypes from 'prop-types';
import { Button, Card, CardHeader, Divider, Stack } from '@mui/material';
import { PropertyList } from '../../../components/property-list';
import { PropertyListItem } from '../../../components/property-list-item';

const paymentStatusMap = {
  paid: 'Paid',
  pending: 'Pending'
};

const paymentMethodMap = {
  creditCard: 'Credit Card',
  debit: 'Direct Debit',
  paypal: 'Paypal',
  stripe: 'Stripe'
};

export const OrderPayment = (props) => {
  const { onEdit, order, ...other } = props;

  const paymentStatus = order.paymentStatus ? paymentStatusMap[order.paymentStatus] : 'Not Paid';
  const paymentMethod = order.paymentMethod ? paymentMethodMap[order.paymentMethod] : '';

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
        title="Payment &amp; Courier Details"
      />
      <Divider />
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
            label="Stripe Payment ID"
            value={order.paymentId}
          />
          <PropertyListItem
            label="Payment Status"
            value={paymentStatus}
          />
          <PropertyListItem
            label="Payment Method"
            value={paymentMethod}
          />
        </PropertyList>
        <PropertyList>
          <PropertyListItem
            label="Courier"
            value={order.courier}
          />
          <PropertyListItem
            label="Tracking ID"
            value={order.trackingCode}
          />
        </PropertyList>
      </Stack>
    </Card>
  );
};

OrderPayment.propTypes = {
  onEdit: PropTypes.func,
  order: PropTypes.object.isRequired
};
