import PropTypes from 'prop-types';
import { format } from 'date-fns';
import numeral from 'numeral';
import { Card, CardHeader, Divider, Stack } from '@mui/material';
import { PropertyList } from '../../../components/property-list';
import { PropertyListItem } from '../../../components/property-list-item';

export const InvoicePayment = (props) => {
  const { invoice } = props;

  const paidAt = invoice.paidAt ? format(invoice.paidAt, 'dd MMM yyyy') : '';
  const totalAmount = numeral(invoice.totalAmount).format(`${invoice.currency}0,0.00`);
  const transactionFees = numeral(invoice.transactionFees).format(`${invoice.currency}0,0.00`);

  return (
    <Card>
      <CardHeader title="Payment" />
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
            label="Date of Payment"
            value={paidAt}
          />
          <PropertyListItem
            label="Payment Method"
            value={invoice.paymentMethod}
          />
          <PropertyListItem
            label="Transaction ID"
            value={invoice.transactionId}
          />
        </PropertyList>
        <PropertyList>
          <PropertyListItem
            label="Amount"
            value={totalAmount}
          />
          <PropertyListItem
            label="Transaction Fees"
            value={transactionFees}
          />
          <PropertyListItem
            label="Status"
            value={invoice.paymentStatus}
          />
        </PropertyList>
      </Stack>
    </Card>
  );
};

InvoicePayment.propTypes = {
  invoice: PropTypes.object.isRequired
};
