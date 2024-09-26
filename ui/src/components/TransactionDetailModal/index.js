import React, { useState } from 'react';
import { Buffer } from 'buffer';
import * as x509 from '@peculiar/x509';
import { Box, Typography, Modal } from '../../mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  overflowWrap: 'break-word',
  overflowX: 'scroll',
  p: 4,
};

const TransactionDetailModal = ({ children, data, open, handleClose, event }) => {
  const [showPre, setShowPre] = useState(false);
  if (!data) return '';

  const header = data.transactionEnvelope.payload.header;
  const cert = new x509.X509Certificate(
    Buffer.from(header.signature_header.creator.id_bytes.data, 'base64')
  );
  const dateTime = new Date(header.channel_header.timestamp);
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Transaction Details
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          Channel ID: {header.channel_header.channel_id} <br />
          Transaction ID: {header.channel_header.tx_id} <br />
          Transaction Date Time:{' '}
          {dateTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true,
          })}{' '}
          <br />
          Creator Organization: {header.signature_header.creator.mspid} <br />
          Creator ID: {cert.subject}
        </Typography>
        <span onClick={() => setShowPre(!showPre)} style={{color: '#5385ab'}}>Event data { showPre ? '▼' : '▶︎' }</span>
        { showPre ? <pre>{JSON.stringify(event, null, 2) }</pre> : '' }
      </Box>
    </Modal>
  );
};

export default TransactionDetailModal;
