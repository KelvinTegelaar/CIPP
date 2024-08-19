import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { format, subDays, subHours, subMinutes } from 'date-fns';
import numeral from 'numeral';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import {
  Box,
  Collapse,
  IconButton,
  List,
  ListItem,
  Stack,
  SvgIcon,
  Typography
} from '@mui/material';

const now = new Date();

const transactions = [
  {
    id: '8b36426c6142a6e0c2fecd02',
    amount: 250,
    bankAccount: 'GB 0000 6499 7623 1100 11122',
    company: 'Material-UI SAS',
    createdAt: subDays(subHours(subMinutes(now, 15), 1), 3).getTime(),
    currency: '$',
    type: 'receive'
  },
  {
    id: 'b4f4e213f327fedce21e7c4c',
    amount: 100,
    bankAccount: 'GB 0000 6499 7623 1100 11122',
    company: 'Material-UI SAS',
    createdAt: subDays(subHours(subMinutes(now, 40), 6), 7).getTime(),
    currency: '$',
    type: 'send'
  }
];

const ExpandableListItem = (props) => {
  const { divider, transaction } = props;
  const [open, setOpen] = useState(false);

  const handleOpenChange = useCallback(() => {
    setOpen((prevState) => !prevState);
  }, []);

  const createdDay = format(transaction.createdAt, 'dd');
  const createdMonth = format(transaction.createdAt, 'MMM yy');
  const amount = numeral(transaction.amount).format(`${transaction.currency}0,0.00`);

  return (
    <ListItem
      divider={divider}
      disableGutters
      disablePadding
      sx={{
        alignItems: 'stretch',
        flexDirection: 'column'
      }}
    >
      <Stack
        alignItems="center"
        direction="row"
        spacing={2}
        sx={{ p: 2 }}
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
            {createdDay}
          </Typography>
          <Typography
            color="text.secondary"
            variant="caption"
          >
            {createdMonth}
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2">
            {transaction.company}
          </Typography>
          <Typography
            color="text.secondary"
            variant="body2"
          >
            {transaction.bankAccount}
          </Typography>
        </Box>
        <Typography
          sx={{ color: transaction.type === 'receive' ? 'text.primary' : 'success.main' }}
          variant="subtitle2"
        >
          {amount}
        </Typography>
        <IconButton onClick={handleOpenChange}>
          <SvgIcon fontSize="small">
            <ChevronDownIcon />
          </SvgIcon>
        </IconButton>
      </Stack>
      <Collapse in={open}>
        <Box sx={{ p: 2 }}>
          <Typography variant="body2">
            Content
          </Typography>
        </Box>
      </Collapse>
    </ListItem>
  );
};

ExpandableListItem.propTypes = {
  transaction: PropTypes.object.isRequired
};

export const List3 = () => (
  <List
    disablePadding
    sx={{ p: 3 }}
  >
    {transactions.map((transaction, index) => {
      const hasDivider = transactions.length > index + 1;

      return (
        <ExpandableListItem
          key={transaction.id}
          transaction={transaction}
          divider={hasDivider}
        />
      );
    })}
  </List>
);
