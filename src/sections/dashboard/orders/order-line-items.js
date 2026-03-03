import PropTypes from 'prop-types';
import numeral from 'numeral';
import {
  Avatar,
  Card,
  CardHeader,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { Scrollbar } from '../../../components/scrollbar';

export const OrderLineItems = (props) => {
  const { order, ...other } = props;

  const lineItems = order.lineItems || [];
  const subtotalAmount = numeral(order.subtotalAmount).format(`${order.currency}0,0.00`);
  const discount = numeral(order.discount).format(`${order.currency}0,0.00`);
  const taxAmount = numeral(order.taxAmount).format(`${order.currency}0,0.00`);
  const totalAmount = numeral(order.totalAmount).format(`${order.currency}0,0.00`);

  return (
    <Card {...other}>
      <CardHeader title="Line Items" />
      <Divider />
      <Scrollbar>
        <Table
          sx={{ minWidth: 500 }}
          {...other}>
          <TableHead>
            <TableRow>
              <TableCell>
                Name
              </TableCell>
              <TableCell>
                Cost
              </TableCell>
              <TableCell>
                Qty
              </TableCell>
              <TableCell>
                Total
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lineItems.map((lineItem, index) => {
              const unitAmount = numeral(lineItem.unitAmount).format(`${lineItem.currency}0,0.00`);
              const totalAmount = numeral(lineItem.totalAmount).format(`${lineItem.currency}0,0.00`);

              return (
                <TableRow key={index}>
                  <TableCell>
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={2}
                    >
                      <Avatar
                        src={lineItem.image}
                        sx={{
                          height: 48,
                          width: 48
                        }}
                        variant="rounded"
                      />
                      <div>
                        <Typography variant="body2">
                          {lineItem.name}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          variant="body2"
                        >
                          SKU: {lineItem.sku}
                        </Typography>
                      </div>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {unitAmount}
                  </TableCell>
                  <TableCell>
                    {lineItem.quantity}
                  </TableCell>
                  <TableCell>
                    {totalAmount}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow>
              <TableCell>
                Subtotal
              </TableCell>
              <TableCell />
              <TableCell />
              <TableCell>
                {subtotalAmount}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                Discount
              </TableCell>
              <TableCell />
              <TableCell />
              <TableCell>
                {discount}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                VAT (25%)
              </TableCell>
              <TableCell />
              <TableCell />
              <TableCell>
                {taxAmount}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2">
                  Total
                </Typography>
              </TableCell>
              <TableCell />
              <TableCell />
              <TableCell>
                <Typography variant="subtitle2">
                  {totalAmount}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Scrollbar>
    </Card>
  );
};

OrderLineItems.propTypes = {
  order: PropTypes.object
};
