import * as React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

const EventList = ({ data, children }) => {
  const columns = [
    {
      field: 'eventID',
      headerName: 'Event ID',
      flex: 1,
    },
    {
      field: 'type',
      headerName: 'Type',
      flex: 0.3,
    },
    {
      field: 'action',
      headerName: 'Action',
    },
    {
      field: 'bizStep',
      headerName: 'Biz Step',
    },
    {
      field: 'eventTime',
      headerName: 'Date',
      flex: 0.8,
    },
  ];
  return (
    <div style={{ width: '100%' }}>
      <DataGrid
        rows={data.map((event) => ({ ...event, id: event.eventID }))}
        columns={columns}
        slots={{ toolbar: GridToolbar }}
      />
    </div>
  );
};

export default EventList;
