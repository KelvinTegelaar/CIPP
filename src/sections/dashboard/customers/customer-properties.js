import PropTypes from 'prop-types';
import { format } from 'date-fns';
import numeral from 'numeral';
import { Card, CardHeader, Divider } from '@mui/material';
import { PropertyList } from '../../../components/property-list';
import { PropertyListItem } from '../../../components/property-list-item';

export const CustomerProperties = (props) => {
  const { customer, ...other } = props;

  const storeCredit = numeral(customer.storeCredit).format('$0,0.00') + ' USD';
  const createdAt = format(customer.createdAt, 'dd/MM/yyyy HH:mm');

  return (
    <Card {...other}>
      <CardHeader title="Custom Properties" />
      <Divider />
      <PropertyList>
        <PropertyListItem
          divider
          label="Tax Exempt"
          value={customer.isTaxExempt ? 'Yes' : 'No'}
        />
        <PropertyListItem
          divider
          label="Store Credit"
          value={storeCredit}
        />
        <PropertyListItem
          divider
          label="Status"
          value={customer.status}
        />
        <PropertyListItem
          label="Signup"
          value={createdAt}
        />
      </PropertyList>
    </Card>
  );
};

CustomerProperties.propTypes = {
  customer: PropTypes.object.isRequired
};
