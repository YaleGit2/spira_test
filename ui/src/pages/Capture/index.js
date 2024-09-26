import { useEffect, useState } from 'react';
import { useEvent } from '../../services/event';
import { useEventTraceability } from '../../services/traceability';
import Title from '../../components/Title';
import { Box, Button, TextField, Typography } from '../../mui/material';
import CustomSnackbar, { Severity } from 'src/shared/components/snackbar';

const Capture = () => {
  const event = useEvent();
  const traceability = useEventTraceability();

  const example = {
    '@context': 'https://gs1.github.io/EPCIS/epcis-context.jsonld',
    eventID:
      'ni:///sha-256;df7bb3c352fef055578554f09f5e2aa41782150ced7bd0b8af24dd3ccb30ba69?ver=CBV2.0',
    type: 'ObjectEvent',
    action: 'OBSERVE',
    bizStep: 'shipping',
    disposition: 'in_transit',
    epcList: [
      'urn:epc:id:sgtin:0614141.107346.2017',
      'urn:epc:id:sgtin:0614141.107346.2018',
    ],
    eventTime: '2005-04-03T20:33:31.116000-06:00',
    eventTimeZoneOffset: '-06:00',
    readPoint: { id: 'urn:epc:id:sgln:0614141.07346.1234' },
    bizTransactionList: [
      { type: 'po', bizTransaction: 'http://transaction.acme.com/po/12345678' },
    ],
  };
  const [data, setData] = useState(example);

  // snackbar
  const [isOpen, setIsOpen] = useState(false);
  const [severity, setSeverity] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (event.result) {
      setData('');
      handleSnackbar(Severity.SUCCESS, 'Captured successfully');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.result]);

  useEffect(() => {
    if (event.error) {
      handleSnackbar(
        Severity.ERROR,
        `An error occurred: ${event.error.message}`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.error]);

  const capture = () => {
    try {
      if (data?.length > 0) {
        const obj = JSON.parse(data);
        event.capture(data);
        traceability.addEvent(obj);
      } else {
        handleSnackbar(Severity.WARNING, 'Input new capture data');
      }
    } catch (error) {
      console.error(error);
      handleSnackbar(Severity.ERROR, 'Data format is not valid');
    }
  };

  const handleSnackbar = (severity, description) => {
    setIsOpen(true);
    setSeverity(severity);
    setDescription(description);
  };

  return (
    <>
      <Title>Capture Interface</Title>
      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          '& > *': {
            m: 1,
          },
          width: '100%',
        }}
        noValidate
        autoComplete="off"
      >
        <TextField
          id="filled-basic"
          placeholder={JSON.stringify(example, null, 2)}
          variant="filled"
          multiline
          rows={25}
          sx={{ flex: 1 }}
          onChange={(e) => setData(e.target.value)}
        />
        <Box sx={{ width: '100%' }}>
          <Button
            sx={{ width: '100%', ml: '-0.5em' }}
            variant="contained"
            onClick={capture}
          >
            Capture
          </Button>
        </Box>
      </Box>

      <Typography variant="body1">
        {event.loading ? 'Loading...' : ''}
      </Typography>
      <CustomSnackbar
        open={isOpen}
        severity={severity}
        action={'CAPTURE'}
        description={description}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default Capture;
