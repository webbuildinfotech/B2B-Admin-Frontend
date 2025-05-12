import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';

import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export function OrderDetailsHistory({ orderDate, history }) {


  const renderSummary = (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        gap: 2,
        minWidth: 260,
        flexShrink: 0,
        borderRadius: 2,
        display: 'flex',
        typography: 'body2',
        borderStyle: 'dashed',
        flexDirection: 'column',
      }}
    >
      <Stack spacing={0.5}>
        <Box sx={{ color: 'text.disabled', fontWeight: 'bold' }}>Order time</Box>
        {fDateTime(orderDate.createdAt)}
      </Stack>

      <Stack spacing={0.5}>
        <Box sx={{ color: 'text.disabled', fontWeight: 'bold' }}>
          {orderDate?.status === 'completed'
            ? 'Completion time'
            : orderDate?.status === 'cancelled'
              ? 'Cancellation time'
              : 'Completion time'}
        </Box>

        <Box sx={{ color: 'text.disabled' }}>
          {orderDate?.status === 'completed'
            ? fDateTime(orderDate?.completedAt)
            : orderDate?.status === 'cancelled'
              ? fDateTime(orderDate?.cancelledAt)
              : 'Not completed yet'}
        </Box>
      </Stack>

    </Paper>
  );

  const renderTimeline = (
    <Timeline
      sx={{ p: 0, m: 0, [`& .${timelineItemClasses.root}:before`]: { flex: 0, padding: 0 } }}
    >
      {history?.map((item, index) => {

        const firstTimeline = index === 0;

        const lastTimeline = index === history.length - 1;

        return (
          <TimelineItem key={item.title}>
            <TimelineSeparator>
              <TimelineDot
                color={
                  item.title === 'Order Cancelled'
                    ? 'error'
                    : item.active
                      ? 'primary'
                      : 'grey'
                }
              />


              {lastTimeline ? null : <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent>
              <Typography variant="subtitle2">{item.title}</Typography>

              <Box sx={{ color: 'text.disabled', typography: 'caption', mt: 0.5 }}>
                {fDateTime(item.time)}
              </Box>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );

  return (
    <Card>
      <CardHeader title="History" />
      <Stack
        spacing={3}
        alignItems={{ md: 'flex-start' }}
        direction={{ xs: 'column-reverse', md: 'row' }}
        sx={{ p: 3 }}
      >
        {renderTimeline}

        {renderSummary}
      </Stack>
    </Card>
  );
}
