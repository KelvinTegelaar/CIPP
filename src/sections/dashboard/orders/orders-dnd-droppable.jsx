import PropTypes from 'prop-types';
import { Droppable } from 'react-beautiful-dnd';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { OrdersDndDraggable } from './orders-dnd-draggable';

export const OrdersDndDroppable = (props) => {
  const { color, id, orders = [], title, ...other } = props;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        maxWidth: '100%',
        minWidth: 400,
        '& + &': {
          borderLeft: (theme) => `1px solid ${theme.palette.divider}`
        }
      }}
      {...other}>
      <Stack
        alignItems="center"
        direction="row"
        spacing={2}
        sx={{
          px: 3,
          py: 2.5
        }}
      >
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
        <Typography
          color="text.secondary"
          variant="overline"
          whiteSpace="nowrap"
        >
          {title}
        </Typography>
      </Stack>
      <Divider />
      <Droppable droppableId={id}>
        {(provided) => (
          <Box
            ref={provided.innerRef}
            sx={{
              flexGrow: 1,
              p: 2
            }}
            {...provided.droppableProps}>
            {orders.map((order, index) => (
              <OrdersDndDraggable
                color={color}
                index={index}
                key={order.id}
                order={order}
              />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Box>
  );
};

OrdersDndDroppable.propTypes = {
  color: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  orders: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired
};
