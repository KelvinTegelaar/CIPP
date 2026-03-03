import PropTypes from 'prop-types';
import NextLink from 'next/link';
import { format } from 'date-fns';
import { Draggable } from 'react-beautiful-dnd';
import { Box, Card, Chip, IconButton, Link, Stack } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { PropertyList } from '../../../components/property-list';
import { PropertyListItem } from '../../../components/property-list-item';
import { paths } from '../../../paths';
import { OrdersTableMenu } from './orders-table-menu';

export const OrdersDndDraggable = (props) => {
  const { color, index, order, ...other } = props;

  const address = [order.address?.city, order.address?.country].join((', '));
  const createdAt = format(order.createdAt, 'dd MMM yyyy HH:mm');

  return (
    <Draggable
      draggableId={order.id.toString()}
      index={index}
      {...other}>
      {(provided) => (
        <Card
          ref={provided.innerRef}
          sx={{
            minWidth: 360,
            mb: 2
          }}
          {...provided.draggableProps}>
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            spacing={1}
            sx={{ p: 2 }}
          >
            <Stack
              alignItems="center"
              direction="row"
              spacing={1}
            >
              <IconButton
                size="small"
                {...provided.dragHandleProps}>
                <DragIndicatorIcon fontSize="small" />
              </IconButton>
              <Link
                href={paths.dashboard.orders.details}
                color="text.primary"
                component={NextLink}
                underline="none"
                variant="h5"
              >
                #{order.id}
              </Link>
              {color && (
                <Box
                  sx={{
                    backgroundColor: color,
                    borderRadius: '50%',
                    height: 8,
                    width: 8
                  }}
                />
              )}
            </Stack>
            <OrdersTableMenu />
          </Stack>
          <PropertyList>
            <PropertyListItem
              label="Courier"
              align="horizontal"
            >
              <Chip
                label={order.courier}
                size="small"
              />
            </PropertyListItem>
            <PropertyListItem
              align="horizontal"
              label="Address"
              value={address}
            />
            <PropertyListItem
              align="horizontal"
              label="Created"
              value={createdAt}
            />
          </PropertyList>
        </Card>
      )}
    </Draggable>
  );
};

OrdersDndDraggable.propTypes = {
  color: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  order: PropTypes.object.isRequired
};
