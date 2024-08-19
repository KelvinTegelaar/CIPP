import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import ArchiveBoxIcon from '@heroicons/react/24/outline/ArchiveBoxIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import CheckIcon from '@heroicons/react/24/outline/CheckIcon';
import DocumentDuplicateIcon from '@heroicons/react/24/outline/DocumentDuplicateIcon';
import ReceiptRefundIcon from '@heroicons/react/24/outline/ReceiptRefundIcon';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  MenuItem,
  Select,
  Stack,
  SvgIcon,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  timelineItemClasses,
  TimelineSeparator
} from '@mui/lab';
import { ActionList } from '../../../components/action-list';
import { ActionListItem } from '../../../components/action-list-item';
import { ConfirmationDialog } from '../../../components/confirmation-dialog';
import { useDialog } from '../../../hooks/use-dialog';

const statusOptions = [
  {
    color: 'info.main',
    label: 'Placed',
    value: 'placed'
  },
  {
    color: 'error.main',
    label: 'Processed',
    value: 'processed'
  },
  {
    color: 'warning.main',
    label: 'Delivered',
    value: 'delivered'
  },
  {
    color: 'success.main',
    label: 'Complete',
    value: 'complete'
  }
];

const StyledTimelineDot = (props) => {
  const { complete } = props;

  return (
    <TimelineDot
      sx={{
        alignSelf: 'center',
        boxShadow: 'none',
        flexShrink: 0,
        height: 36,
        justifyContent: 'center',
        width: 36,
        backgroundColor: (theme) => theme.palette.mode === 'dark'
          ? 'neutral.800'
          : 'neutral.200',
        borderColor: (theme) => theme.palette.mode === 'dark'
          ? 'neutral.800'
          : 'neutral.200',
        color: 'text.secondary',
        ...(complete && {
          backgroundColor: 'success.main',
          borderColor: 'success.main',
          color: 'success.contrastText'
        })
      }}
    >
      <SvgIcon fontSize="small">
        <CheckIcon />
      </SvgIcon>
    </TimelineDot>
  );
};

const StyledTimelineConnector = styled(TimelineConnector)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark'
    ? theme.palette.neutral[800]
    : theme.palette.neutral[200],
  height: 24
}));

const StyledTimelineContent = styled(TimelineContent)(({ theme }) => ({
  padding: '14px 16px',
  ...theme.typography.overline
}));

export const OrderQuickActions = (props) => {
  const { order, ...other } = props;
  const markDialog = useDialog();
  const duplicateDialog = useDialog();
  const archiveDialog = useDialog();
  const [status, setStatus] = useState(order?.status || '');

  const handleStatusChange = useCallback((event) => {
    setStatus(event.target.value);
  }, []);

  const handleSave = useCallback(() => {
    toast.success('Changes saved');
  }, []);

  const handleMark = useCallback(() => {
    markDialog.handleClose();
    toast.error('This action is not available on demo');
  }, [markDialog]);

  const handleDuplicate = useCallback(() => {
    duplicateDialog.handleClose();
    toast.error('This action is not available on demo');
  }, [duplicateDialog]);

  const handleArchive = useCallback(() => {
    archiveDialog.handleClose();
    toast.error('This action is not available on demo');
  }, [archiveDialog]);

  const createdAt = format(order.createdAt, 'MMM/dd/yyyy HH:mm');
  const updatedAt = order.updatedAt && format(order.updatedAt, 'MMM/dd/yyyy HH:mm');

  return (
    <>
      <Card {...other}>
        <CardHeader title="Quick Actions" />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <Select
              fullWidth
              inputProps={{
                sx: {
                  alignItems: 'center',
                  display: 'flex'
                }
              }}
              onChange={handleStatusChange}
              value={status}
            >
              {statusOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  sx={{
                    alignItems: 'center',
                    display: 'flex'
                  }}
                  value={option.value}
                >
                  <Box
                    sx={{
                      backgroundColor: option.color,
                      borderRadius: '50%',
                      height: 8,
                      width: 8,
                      mr: 1
                    }}
                  />
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <div>
              <Button
                onClick={handleSave}
                variant="contained"
              >
                Save Changes
              </Button>
            </div>
            {updatedAt && (
              <Typography
                sx={{
                  color: 'text.secondary',
                  display: 'block'
                }}
                variant="caption"
              >
                Updated {updatedAt}
              </Typography>
            )}
            <Divider />
            <Timeline
              sx={{
                [`& .${timelineItemClasses.root}:before`]: {
                  flex: 0,
                  p: 0
                }
              }}
              {...other}>
              <TimelineItem>
                <TimelineSeparator>
                  <StyledTimelineDot complete />
                  <StyledTimelineConnector />
                </TimelineSeparator>
                <StyledTimelineContent>
                  Placed at {createdAt}
                </StyledTimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineSeparator>
                  <StyledTimelineDot complete={!!order.processedAt} />
                  <StyledTimelineConnector />
                </TimelineSeparator>
                <StyledTimelineContent>
                  Processed
                </StyledTimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineSeparator>
                  <StyledTimelineDot complete={!!order.deliveredAt} />
                  <StyledTimelineConnector />
                </TimelineSeparator>
                <StyledTimelineContent>
                  Delivered
                </StyledTimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineSeparator>
                  <StyledTimelineDot complete={!!order.completedAt} />
                </TimelineSeparator>
                <StyledTimelineContent>
                  Complete
                </StyledTimelineContent>
              </TimelineItem>
            </Timeline>
          </Stack>
        </CardContent>
        <Divider />
        <ActionList>
          <ActionListItem
            icon={(
              <SvgIcon fontSize="small">
                <CheckCircleIcon />
              </SvgIcon>
            )}
            label="Mark as Paid"
            onClick={markDialog.handleOpen}
          />
          <ActionListItem
            icon={(
              <SvgIcon fontSize="small">
                <DocumentDuplicateIcon />
              </SvgIcon>
            )}
            label="Duplicate Order"
            onClick={duplicateDialog.handleOpen}
          />
          <ActionListItem
            disabled
            icon={(
              <SvgIcon fontSize="small">
                <ReceiptRefundIcon />
              </SvgIcon>
            )}
            label="Request a Refund"
          />
          <ActionListItem
            icon={(
              <SvgIcon fontSize="small">
                <ArchiveBoxIcon />
              </SvgIcon>
            )}
            label="Archive Order"
            onClick={archiveDialog.handleOpen}
          />
        </ActionList>
      </Card>
      <ConfirmationDialog
        message="Are you sure you want to mark this order as paid? This can't be undone."
        onCancel={markDialog.handleClose}
        onConfirm={handleMark}
        open={markDialog.open}
        title="Mark Order as Paid"
        variant="info"
      />
      <ConfirmationDialog
        message="Are you sure you want to duplicate this order? This can't be undone."
        onCancel={duplicateDialog.handleClose}
        onConfirm={handleDuplicate}
        open={duplicateDialog.open}
        title="Duplicate Order"
        variant="warning"
      />
      <ConfirmationDialog
        message="Are you sure you want to archive this order? This can't be undone."
        onCancel={archiveDialog.handleClose}
        onConfirm={handleArchive}
        open={archiveDialog.open}
        title="Archive Order"
        variant="error"
      />
    </>
  );
};

OrderQuickActions.propTypes = {
  order: PropTypes.object
};
