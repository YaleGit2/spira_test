import React from 'react';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import { useTransaction } from '../../services/traceability';
import Tooltip from '@mui/material/Tooltip';
import TransactionDetailModal from '../TransactionDetailModal';

const TransactionData = ({ children, transactionId, event }) => {
  const transaction = useTransaction(transactionId);

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Tooltip title={`Transaction ID ${transactionId}`} onClick={handleOpen}>
        <PrivacyTipIcon fontSize="inherit" />
      </Tooltip>
      <TransactionDetailModal
        data={transaction.data}
        handleClose={handleClose}
        open={open}
        event={event}
      />
    </>
  );
};

export default TransactionData;
