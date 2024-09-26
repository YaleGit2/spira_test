import React, { useEffect, useMemo, useState} from 'react';
import { useProduct } from '../../services/traceability';
import Title from '../../components/Title';
import ProductTraceability from '../../components/ProductTraceability';
import { Box, Typography } from '../../mui/material';
import { useSearchParams } from 'react-router-dom';
import { useEventList } from '../../services/event';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import Subtitle from '../../components/Subtitle';
import { Grid } from '@mui/material';
import ProductInfoCard from '../../components/ProductTraceability/ProductInfoCard';
import ProductID from '../../components/ProductTraceability/ProductID';
import { ProductData } from '../../utils/consts';

const Product = () => {
  const { product, searchProduct, loading, error } = useProduct();
  const [ productData, setProductDAta] = useState(null);
  const [ objectEvent, setObjectEvent ] = useState(null);

  const events = useEventList();
  let [searchParams] = useSearchParams();

  console.log("product", product)
  console.log("events", events)

  useMemo(() => {
    if (searchParams.get('id')) {
      searchProduct(searchParams.get('id'));
    }
    if (searchParams.get('type')) {
      setProductDAta(ProductData[searchParams.get('type')])
    }
    // eslint-disable-next-line
  }, [searchParams]);

  useEffect(() => {
    if (product) {
      events.get(product.eventList.map((event) => event.eventID));
    }
    // eslint-disable-next-line
  }, [product]);

  useEffect(() => {
    if (events) {
      setObjectEvent(events.data.find(event => event.type === 'ObjectEvent' && event.action === 'ADD'))
    }
  }, [events]);

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
        <Title>{productData?.title}</Title>
        <ProductID name={productData?.name} id={product?.productId}>
          <FingerprintIcon />
          
        </ProductID>
        <Subtitle variant="h6">Traceability Information</Subtitle>
      </Box>
      <Typography variant="body1">{loading ? 'Loading...' : ''}</Typography>
      <Typography variant="body1">
        {error ? `An error occurred: ${error.message}` : ''}
      </Typography>
      <ProductTraceability
        product={product}
        eventList={events?.data}
      />
      <Subtitle variant="h6">Product Information</Subtitle>
      <Grid container spacing={2}>
        { productData?.attributes.map( feature => 
          objectEvent && 'ilmd' in objectEvent && feature.id in objectEvent?.ilmd ? 
            <ProductInfoCard key={feature} title={feature.title} description={feature.description} value={objectEvent.ilmd[feature.id]} /> :
            ''
        )}
      </Grid>
    </>
  );
};

export default Product;
