import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import ChatBubbleBottomCenterIcon from '@heroicons/react/24/outline/ChatBubbleBottomCenterIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import ShoppingCartIcon from '@heroicons/react/24/outline/ShoppingCartIcon';
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  SvgIcon
} from '@mui/material';

export const List2 = () => (
  <List>
    <ListItem divider>
      <ListItemIcon>
        <SvgIcon fontSize="small">
          <ShoppingCartIcon />
        </SvgIcon>
      </ListItemIcon>
      <ListItemText primary="Orders" />
      <ListItemSecondaryAction>
        <IconButton size="small">
          <SvgIcon fontSize="small">
            <ArrowRightIcon />
          </SvgIcon>
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
    <ListItem divider>
      <ListItemIcon>
        <SvgIcon fontSize="small">
          <ChatBubbleBottomCenterIcon />
        </SvgIcon>
      </ListItemIcon>
      <ListItemText primary="Messages" />
      <ListItemSecondaryAction>
        <IconButton size="small">
          <SvgIcon fontSize="small">
            <ArrowRightIcon />
          </SvgIcon>
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
    <ListItem>
      <ListItemIcon>
        <SvgIcon fontSize="small">
          <CurrencyDollarIcon />
        </SvgIcon>
      </ListItemIcon>
      <ListItemText primary="Transactions" />
      <ListItemSecondaryAction>
        <IconButton size="small">
          <SvgIcon fontSize="small">
            <ArrowRightIcon />
          </SvgIcon>
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  </List>
);
