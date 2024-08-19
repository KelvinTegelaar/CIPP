import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import EllipsisVerticalIcon from '@heroicons/react/24/outline/EllipsisVerticalIcon';
import { IconButton, Menu, MenuItem, SvgIcon } from '@mui/material';
import { usePopover } from '../../../hooks/use-popover';
import { paths } from '../../../paths';

export const ProductsTableMenu = () => {
  const router = useRouter();
  const popover = usePopover();

  const handleEdit = useCallback(() => {
    popover.handleClose();
    router.push(paths.dashboard.products.details.index);
  }, [popover, router]);

  const handleArchive = useCallback(() => {
    popover.handleClose();
    toast.error('This action is not available on demo');
  }, [popover]);

  const handleDelete = useCallback(() => {
    popover.handleClose();
    toast.error('This action is not available on demo');
  }, [popover]);

  return (
    <>
      <IconButton
        onClick={popover.handleOpen}
        ref={popover.anchorRef}
      >
        <SvgIcon fontSize="small">
          <EllipsisVerticalIcon />
        </SvgIcon>
      </IconButton>
      <Menu
        anchorEl={popover.anchorRef.current}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom'
        }}
        disableScrollLock
        open={popover.open}
        onClose={popover.handleClose}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <MenuItem onClick={handleEdit}>
          Edit
        </MenuItem>
        <MenuItem onClick={handleArchive}>
          Archive
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};
