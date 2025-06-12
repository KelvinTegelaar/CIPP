import { useCallback, useState } from 'react';
import NextLink from 'next/link';
import numeral from 'numeral';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import {
  Avatar,
  Box,
  Card,
  Collapse,
  Divider,
  IconButton,
  Link,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { ResourceUnavailable } from '../../../components/resource-unavailable';
import { Scrollbar } from '../../../components/scrollbar';
import { paths } from '../../../paths';

const statusMap = {
  complete: {
    color: 'success.main',
    label: 'Complete'
  },
  created: {
    color: 'neutral.500',
    label: 'Created'
  },
  delivered: {
    color: 'warning.main',
    label: 'Delivered'
  },
  placed: {
    color: 'info.main',
    label: 'Placed'
  },
  processed: {
    color: 'error.main',
    label: 'Processed'
  }
};

export const CustomerLatestOrders = (props) => {
  const { orders = [], ...other } = props;
  const [expanded, setExpanded] = useState(null);

  const handleExpand = useCallback((orderId) => {
    setExpanded((prevState) => {
      return prevState === orderId ? null : orderId;
    });
  }, []);

  const hasOrders = orders.length > 0;

  return (
    <Stack
      spacing={3}
      {...other}>
      <Typography variant="h6">
        Latest Orders
      </Typography>
      {!hasOrders
        ? <ResourceUnavailable message="There are no orders" />
        : (
          <Card>
            <Stack
              component="ul"
              divider={<Divider />}
              sx={{
                listStyle: 'none',
                m: 0,
                p: 0
              }}
            >
              {orders.map((order) => {
                const isExpanded = expanded === order.id;
                const status = statusMap[order.status];
                const lineItems = order.lineItems || [];
                const createdDate = format(order.createdAt, 'dd');
                const createdMonth = format(order.createdAt, 'MMM yy');

                return (
                  <li key={order.id}>
                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      justifyContent="space-between"
                      sx={{ p: 3 }}
                    >
                      <Stack
                        alignItems="center"
                        direction="row"
                        spacing={3}
                      >
                        <Box
                          sx={{
                            alignItems: 'center',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          <Typography
                            color="text.secondary"
                            variant="h5"
                          >
                            {createdDate}
                          </Typography>
                          <Typography
                            color="text.secondary"
                            variant="caption"
                          >
                            {createdMonth}
                          </Typography>
                        </Box>
                        <Box
                          href={paths.dashboard.orders.details}
                          component={NextLink}
                          sx={{ textDecoration: 'none' }}
                        >
                          <Typography
                            color="text.primary"
                            variant="h6"
                          >
                            Order
                          </Typography>
                          <Link
                            color="text.secondary"
                            underline="none"
                            variant="body2"
                          >
                            #{order.id}
                          </Link>
                        </Box>
                      </Stack>
                      <Stack
                        alignItems="center"
                        direction="row"
                        spacing={3}
                      >
                        <Stack
                          alignItems="center"
                          direction="row"
                          spacing={1}
                        >
                          <Box
                            sx={{
                              backgroundColor: status.color,
                              borderRadius: '50%',
                              height: 8,
                              width: 8
                            }}
                          />
                          <Typography variant="body2">
                            {status.label}
                          </Typography>
                        </Stack>
                        <IconButton onClick={() => handleExpand(order.id)}>
                          <SvgIcon
                            fontSize="small"
                            sx={{
                              transition: 'transform 150ms',
                              transform: isExpanded ? 'rotate(180deg)' : 'none'
                            }}
                          >
                            <ChevronDownIcon />
                          </SvgIcon>
                        </IconButton>
                      </Stack>
                    </Stack>
                    <Collapse in={isExpanded}>
                      <Divider />
                      <Scrollbar>
                        <Table sx={{ minWidth: 400 }}>
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
                          </TableBody>
                        </Table>
                      </Scrollbar>
                    </Collapse>
                  </li>
                );
              })}
            </Stack>
          </Card>
        )}
    </Stack>
  );
};

CustomerLatestOrders.propTypes = {
  orders: PropTypes.array
};
