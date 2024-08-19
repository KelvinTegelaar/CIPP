import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Button, Card, CardHeader, Divider, useMediaQuery } from '@mui/material';
import { PropertyList } from '../../../components/property-list';
import { PropertyListItem } from '../../../components/property-list-item';

export const ProductDetails = (props) => {
  const { onEdit, product, ...other } = props;
  const mdDown = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const align = mdDown ? 'vertical' : 'horizontal';

  const createdAt = format(product.createdAt, 'MMM dd, yyyy');
  const updatedAt = product.updatedAt ? format(product.updatedAt, 'MMM dd, yyyy') : '';
  const composition = product.composition?.join(', ');
  const tags = product.tags?.join(', ');

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
        title="General Details"
      />
      <Divider />
      <PropertyList>
        <PropertyListItem
          align={align}
          label="ID"
          value={product.id}
        />
        <PropertyListItem
          align={align}
          label="Brand Name"
          value={product.brand}
        />
        <PropertyListItem
          align={align}
          label="Display Name"
          value={product.name}
        />
        <PropertyListItem
          align={align}
          label="Description"
          value={product.description}
        />
        <PropertyListItem
          align={align}
          label="Created"
          value={createdAt}
        />
        <PropertyListItem
          align={align}
          label="Composition"
          value={composition}
        />
        <PropertyListItem
          align={align}
          label="Tags"
          value={tags}
        />
        <PropertyListItem
          align={align}
          label="Updated"
          value={updatedAt}
        />
      </PropertyList>
    </Card>
  );
};

ProductDetails.propTypes = {
  onEdit: PropTypes.func,
  product: PropTypes.object.isRequired
};
