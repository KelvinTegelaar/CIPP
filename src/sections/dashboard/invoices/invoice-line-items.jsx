import PropTypes from 'prop-types';
import numeral from 'numeral';
import {
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

export const InvoiceLineItems = (props) => {
  const { invoice } = props;

  const lineItems = invoice.lineItems || [];
  const taxAmount = numeral(invoice.taxAmount).format(`${invoice.currency}0,0.00`);
  const totalAmount = numeral(invoice.totalAmount).format(`${invoice.currency}0,0.00`);

  return (
    <Card>
      <CardHeader title="Line Items" />
      <Divider />
      <Scrollbar>
        <Table sx={{ minWidth: 500 }}>
          <TableHead>
            <TableRow>
              <TableCell>
                Item
              </TableCell>
              <TableCell>
                Qty
              </TableCell>
              <TableCell>
                Subtotal
              </TableCell>
              <TableCell>
                Total
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lineItems.map((lineItem, index) => {
              const unitAmount = numeral(lineItem.unitAmount).format(`${lineItem.currency}0,0.00`);
              const subtotalAmount = numeral(lineItem.subtotalAmount).format(`${lineItem.currency}0,0.00`);
              const totalAmount = numeral(lineItem.totalAmount).format(`${lineItem.currency}0,0.00`);

              return (
                <TableRow key={index}>
                  <TableCell>
                    <Typography
                      color="inherit"
                      variant="body2"
                    >
                      {lineItem.name}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      {unitAmount}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {lineItem.quantity}
                  </TableCell>
                  <TableCell>
                    {subtotalAmount}
                  </TableCell>
                  <TableCell sx={{ width: 150 }}>
                    {totalAmount}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow>
              <TableCell />
              <TableCell />
              <TableCell />
              <TableCell>
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={1}
                >
                  <Typography
                    color="text.secondary"
                    variant="subtitle2"
                  >
                    Tax
                  </Typography>
                  <Typography variant="subtitle2">
                    {taxAmount}
                  </Typography>
                </Stack>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell />
              <TableCell />
              <TableCell />
              <TableCell>
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={1}
                >
                  <Typography
                    color="text.secondary"
                    variant="subtitle2"
                  >
                    Total
                  </Typography>
                  <Typography variant="h6">
                    {totalAmount}
                  </Typography>
                </Stack>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Scrollbar>
    </Card>
  );
};

InvoiceLineItems.propTypes = {
  invoice: PropTypes.object.isRequired
};
