import { Fragment } from 'react';
import { formatDistanceToNow, subMinutes } from 'date-fns';
import { Card, CardContent, CardHeader, Divider, Typography } from '@mui/material';
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem } from '@mui/lab';

const now = new Date();

const logs = [
  {
    id: '2aa78a34a87c148865744f62',
    chargeId: 'th_2JCleBj4vHz',
    createdAt: subMinutes(now, 15).getTime(),
    type: 'chargeComplete'
  },
  {
    id: 'cca161770fa1ae35541abab7',
    createdAt: subMinutes(now, 53).getTime(),
    currentStatus: 'complete',
    previousStatus: 'pending',
    type: 'statusChanged'
  }
];

const getContent = (log) => {
  switch (log.type) {
    case 'chargeComplete':
      return (
        <>
          <Typography variant="body2">
            Stripe charge complete
          </Typography>
          <Typography variant="body2">
            Charge ID: {log.chargeId}
          </Typography>
        </>
      );

    case 'statusChanged':
      return (
        <Typography variant="body2">
          Status changed from <strong>{log.previousStatus}</strong> payment to <strong>{log.currentStatus}</strong>.
        </Typography>
      );

    default:
      return null;
  }
};

export const InvoicePaymentHistory = () => (
  <Card>
    <CardHeader title="Payment History" />
    <Divider />
    <CardContent>
      <Timeline
        sx={{
          my: 0,
          p: 0
        }}
      >
        {logs.map((log, index) => {
          const hasConnector = logs.length > index + 1;
          const ago = formatDistanceToNow(log.createdAt);

          return (
            <Fragment key={log.id}>
              <TimelineItem
                sx={{
                  alignItems: 'center',
                  minHeight: 'auto',
                  '&::before': {
                    display: 'none'
                  }
                }}
              >
                <TimelineDot
                  sx={{
                    alignSelf: 'center',
                    boxShadow: 'none',
                    flexShrink: 0,
                    m: 0
                  }}
                  variant="outlined"
                />
                <TimelineContent sx={{ pr: 0 }}>
                  {getContent(log)}
                  <Typography
                    component="p"
                    color="text.secondary"
                    sx={{ whiteSpace: 'nowrap' }}
                    variant="caption"
                  >
                    {ago} ago
                  </Typography>
                </TimelineContent>
              </TimelineItem>
              {hasConnector && (
                <TimelineConnector
                  sx={{
                    backgroundColor: (theme) => theme.palette.mode === 'dark'
                      ? 'neutral.800'
                      : 'neutral.200',
                    height: 22,
                    ml: '5px',
                    my: 1
                  }}
                />
              )}
            </Fragment>
          );
        })}
      </Timeline>
    </CardContent>
  </Card>
);
