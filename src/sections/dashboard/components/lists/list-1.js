import ArchiveBoxIcon from '@heroicons/react/24/outline/ArchiveBoxIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import DocumentDuplicateIcon from '@heroicons/react/24/outline/DocumentDuplicateIcon';
import ReceiptPercentIcon from '@heroicons/react/24/outline/ReceiptPercentIcon';
import { List, ListItemButton, ListItemIcon, ListItemText, SvgIcon } from '@mui/material';

export const List1 = () => (
  <List
    dense
    sx={{
      p: 3,
      maxWidth: 300
    }}
  >
    <ListItemButton>
      <ListItemIcon>
        <SvgIcon fontSize="small">
          <CheckCircleIcon />
        </SvgIcon>
      </ListItemIcon>
      <ListItemText primary="Check" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <SvgIcon fontSize="small">
          <DocumentDuplicateIcon />
        </SvgIcon>
      </ListItemIcon>
      <ListItemText primary="Copy" />
    </ListItemButton>
    <ListItemButton disabled>
      <ListItemIcon>
        <SvgIcon fontSize="small">
          <ReceiptPercentIcon />
        </SvgIcon>
      </ListItemIcon>
      <ListItemText primary="Send" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <SvgIcon fontSize="small">
          <ArchiveBoxIcon />
        </SvgIcon>
      </ListItemIcon>
      <ListItemText primary="Archive" />
    </ListItemButton>
  </List>
);
