import * as React from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimeAgo from 'react-timeago';
import TransactionData from '../../components/TransactionData';

export default function OppositeContentTimeline({ product }) {
  const timelineData = product?.eventList?.map((event) => {
    const dateFormat = new Date(event.eventTime.substring(0, 10));
    const creationDateFormat = new Date(event.createTime);
    return {
      ...event,
      dateFormat,
      eventTimeFormat: dateFormat.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }),
      creationDateFormat,
    };
  });
  const timelineItems = timelineData?.sort( (eventA, eventB) => eventA.dateFormat.getTime() - eventB.dateFormat.getTime()).map((event, index) => (
    <TimelineItem
      key={index}
      style={{ width: '100%', margin: '0px', padding: '0px' }}
    >
      <TimelineOppositeContent
        color="text.secondary"
        style={{ fontSize: '9pt' }}
      >
        {event.eventTimeFormat} <br />
        <TimeAgo date={event.eventTime} style={{ fontSize: '6pt' }} />
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot />
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent style={{ fontSize: '9pt' }}>
        {event.type} ({event.action}){' '}
        <TransactionData transactionId={event.transactionId} /> <br />
        <span style={{ fontSize: '8pt' }}>
          Created by {event.creator.mspid}
        </span>
      </TimelineContent>
    </TimelineItem>
  ));
  return <Timeline position="alternate">{timelineItems}</Timeline>;
}
