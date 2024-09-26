import * as React from 'react';
import { useProduct } from '../../services/traceability';
import Title from '../../components/Title';
import TraceabilityTimeline from '../../components/TraceabilityTimeline';
import { Box, Button, TextField, Typography } from '../../mui/material';
import { useSearchParams } from 'react-router-dom';

const Traceability = () => {
  const [searchId, setSearchId] = React.useState('');
  const { product, searchProduct, loading, error } = useProduct(searchId);
  let [searchParams] = useSearchParams();

  React.useMemo(() => {
    if (searchParams.get('id')) {
      searchProduct(searchParams.get('id'));
    }
    // eslint-disable-next-line
  }, [searchParams]);

  const doSearchProduct = () => {
    console.log("searchId + "+searchId)
    searchProduct(searchId);
  };

  return (
    <>
      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          '& > :not(style)': {
            m: 1,
            width: '400px',
          },
        }}
        noValidate
        autoComplete="off"
      >
        <Title>Product Traceability</Title>
        {!searchParams.get('id') ? (
          <>
            <TextField
              id="filled-basic"
              label="Product ID"
              variant="filled"
              onChange={(e) => setSearchId(e.target.value)}
            />
            <Button variant="contained" onClick={doSearchProduct}>
              Search
            </Button>
          </>
        ) : (
          ''
        )}
      </Box>
      <Typography variant="body1">{loading ? 'Loading...' : ''}</Typography>
      <Typography variant="body1">
        {error ? `An error occurred: ${error.message}` : ''}
      </Typography>
      <TraceabilityTimeline product={product} />
    </>
  );
};

export default Traceability;
