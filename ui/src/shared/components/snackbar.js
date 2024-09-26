import * as React from 'react';
import { Stack, Snackbar, MuiAlert } from '../../mui/material';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function CustomSnackbar({
  open,
  action = null,
  severity,
  description = null,
  onClose, // Callback function for notifying parent
}) {
  const [isOpen, setIsOpen] = React.useState(open);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsOpen(false);

    if (onClose) {
      onClose(); // Notify parent component
    }
  };

  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  let message;
  if (description && action) {
    message = `${description} (${action})`;
  } else if (description) {
    message = description;
  } else if (action) {
    message = `${Message[severity]} (${action})`;
  } else {
    message = `${Message[severity]}`;
  }

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Snackbar
        open={isOpen}
        autoHideDuration={3000}
        onClose={handleClose}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100vw',
        }}
      >
        <Alert onClose={handleClose} severity={severity}>
          {message ? message : Message[severity]}
        </Alert>
      </Snackbar>
    </Stack>
  );
}

export const Severity = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  SUCCESS: 'success',
};

const Message = {
  [Severity.ERROR]: 'This is an error message!',
  [Severity.WARNING]: 'This is a warning message!',
  [Severity.INFO]: 'This is an information message!',
  [Severity.SUCCESS]: 'This is a success message!',
};
