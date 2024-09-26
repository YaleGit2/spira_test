import * as React from 'react';
import EventList from '../../components/EventList';
import { useEventList } from '../../services/event';
import Title from '../../components/Title';
import { Box, Button, Typography } from '../../mui/material';

const Query = () => {
  const eventList = useEventList();

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Title>Query Interface</Title>
        <Box sx={{ textAlign: 'right' }}>
          <Button
            variant="contained"
            onClick={eventList.get}
            sx={{ width: '200px' }}
          >
            Get all events
          </Button>
        </Box>
      </Box>
      <Typography variant="body1">
        {eventList.loading ? 'Loading...' : ''}
      </Typography>
      <EventList
        data={
          eventList.data
            ? eventList.data
            : []
        }
      />
    </>
  );
};

export default Query;
