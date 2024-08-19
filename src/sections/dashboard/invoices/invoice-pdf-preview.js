import PropTypes from 'prop-types';
import { format } from 'date-fns';
import numeral from 'numeral';
import {
  Box,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { Scrollbar } from '../../../components/scrollbar';

export const InvoicePdfPreview = (props) => {
  const { invoice } = props;

  const lineItems = invoice.lineItems || [];
  const issueDate = format(invoice.issueDate, 'dd MMM yyyy');
  const dueDate = format(invoice.dueDate, 'dd MMM yyyy');
  const taxAmount = numeral(invoice.taxAmount).format(`${invoice.currency}0,0.00`);
  const totalAmount = numeral(invoice.totalAmount).format(`${invoice.currency}0,0.00`);

  return (
    <Paper
      elevation={24}
      sx={{ p: 3 }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h4">
          {invoice.ref}
        </Typography>
        <Typography
          align="right"
          color="error.main"
          sx={{ textTransform: 'uppercase' }}
          variant="h4"
        >
          {invoice.status}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: {
            xs: 'flex-start',
            md: 'space-between'
          },
          flexDirection: {
            xs: 'column',
            md: 'row'
          },
          mt: 1.5
        }}
      >
        <div>
          <Typography
            gutterBottom
            variant="subtitle2"
          >
            Invoice to
          </Typography>
          <Typography
            color="text.secondary"
            variant="body2"
          >
            Acme LTD GB54423345
            <br />
            340 Lemon St. #5554
            <br />
            Spring Valley, California
            <br />
            United States
          </Typography>
        </div>
        <Box
          sx={{
            textAlign: {
              xs: 'left',
              md: 'right'
            }
          }}
        >
          <Typography
            gutterBottom
            variant="subtitle2"
          >
            Invoice for
          </Typography>
          <Typography
            color="text.secondary"
            variant="body2"
          >
            Natalie Rusell
            <br />
            3845 Salty Street
            <br />
            Salt Lake City
            <br />
            United States
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 6
        }}
      >
        <div>
          <Typography
            gutterBottom
            variant="subtitle2"
          >
            Invoice Date
          </Typography>
          <Typography
            color="text.secondary"
            variant="body2"
          >
            {issueDate}
          </Typography>
        </div>
        <div>
          <Typography
            align="right"
            gutterBottom
            variant="subtitle2"
          >
            Due Date
          </Typography>
          <Typography
            align="right"
            color="text.secondary"
            variant="body2"
          >
            {dueDate}
          </Typography>
        </div>
      </Box>
      <Box
        sx={{
          borderColor: 'divider',
          borderRadius: 2,
          borderStyle: 'solid',
          borderWidth: 1,
          my: 5
        }}
      >
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
      </Box>
      <Typography
        gutterBottom
        variant="subtitle2"
      >
        Notes
      </Typography>
      <Typography
        color="text.secondary"
        variant="body2"
      >
        &quot;{invoice.note}&quot;
      </Typography>
    </Paper>
  );
};

InvoicePdfPreview.propTypes = {
  invoice: PropTypes.object.isRequired
};
