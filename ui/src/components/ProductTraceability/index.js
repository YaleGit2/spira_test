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
import InputIcon from '@mui/icons-material/Input';
import GradeIcon from '@mui/icons-material/Grade';
import OutputIcon from '@mui/icons-material/Output';
import BatteryCharging80Icon from '@mui/icons-material/BatteryCharging80';
import RedeemIcon from '@mui/icons-material/Redeem';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import AutorenewIcon from '@mui/icons-material/Autorenew';

export default function OppositeContentTimeline({ product, eventList }) {
  const typeIcon = {
    commissioning: <GradeIcon />,
    loading: <InputIcon />,
    unloading: <OutputIcon />,
    "DPP:charging": <BatteryCharging80Icon />,
    packing: <RedeemIcon />,
    unpacking: <RedeemIcon />,
    arriving: <DeliveryDiningIcon />,
    departing: <DeliveryDiningIcon />,
    retail_selling: <PointOfSaleIcon />,
    collecting: <RestoreFromTrashIcon />,
    "DPP:recycling": <AutorenewIcon />
  }
  const timelineData = product?.eventList?.map((event) => {
    const dateFormat = new Date(event.eventTime.substring(0, 10));
    const creationDateFormat = new Date(event.createTime);
    return {
      ...event,
      dateFormat,
      eventTimeFormat: dateFormat.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      creationDateFormat,
      originalEvent: eventList.find(e => e.eventID === event.eventID)
    };
  });
  const timelineItems = timelineData?.sort( (eventA, eventB) => eventA.dateFormat.getTime() - eventB.dateFormat.getTime()).map((event, index) => (
    <TimelineItem
      key={index}
      style={{ width: '100%', margin: '0px', padding: '0px' }}
    >
      <TimelineOppositeContent
        color="text.secondary"
        style={{ fontSize: '10pt' }}
      >
        {event.eventTimeFormat} <br />
        <TimeAgo date={event.eventTimeFormat} style={{ fontSize: '7pt' }} />
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot style={{color: 'black'}}>
          { typeIcon[event.originalEvent?.bizStep] || '' }
        </TimelineDot>
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent style={{ fontSize: '10pt' }}>
        {event.originalEvent?.bizStep}{' '}({event.type})
        <TransactionData transactionId={event.transactionId} event={event.originalEvent}/> <br />
        <span style={{ fontSize: '9pt' }}>
          {event.creator.mspid}
        </span>
      </TimelineContent>
    </TimelineItem>
  ));
  return (
    <>
      <Timeline position="alternate">{timelineItems}</Timeline>
      
    </>
  );
}
