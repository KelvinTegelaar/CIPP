import { Button, Card, CardHeader, Divider, useMediaQuery } from '@mui/material';
import { PropertyList } from '../../../components/property-list';
import { PropertyListItem } from '../../../components/property-list-item';

export const OrganizationBillingDetails = () => {
  const mdDown = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const align = mdDown ? 'vertical' : 'horizontal';

  return (
    <Card>
      <CardHeader
        action={(
          <Button
            color="inherit"
            size="small"
          >
            Edit
          </Button>
        )}
        title="Billing Details"
      />
      <Divider />
      <PropertyList>
        <PropertyListItem
          align={align}
          divider
          label="Name/Company"
          value="Devias IO"
        />
        <PropertyListItem
          align={align}
          divider
          label="Country"
          value="Germany"
        />
        <PropertyListItem
          align={align}
          divider
          label="Zip Code"
          value="6753454"
        />
        <PropertyListItem
          align={align}
          label="City"
          value="Berlin"
        />
      </PropertyList>
    </Card>
  );
};
