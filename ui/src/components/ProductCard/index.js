import { Typography } from '@mui/material';

const ProductCard = ({ id }) => {
  return (
    <div
      style={{
        width: '100vw',
        backgroundColor: 'rgb(83, 133, 171)',
        color: 'white',
        marginLeft: 'calc((100% - 100vw) / 2)',
        padding: '10px',
      }}
    >
      <Typography variant="caption">Product</Typography>
      <Typography variant="h6">Battery</Typography>
      <Typography variant="caption">Model</Typography>
      <Typography variant="h6">ABC123</Typography>
    </div>
  );
};

export default ProductCard;
