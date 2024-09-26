import { Typography } from '../../mui/material';
import styled from 'styled-components';

const PageSubtitle = styled(Typography)`
  && {
    font-size: 1.2em;
    font-weight: bold;
    color: #5D5E2A;

    @media screen and (min-width: 768px) {
      margin-top: -0.2em;
    }
  }
`;

const Subtitle = ({ children }) => {
  return (
    <PageSubtitle variant="h5" noWrap component="div">
      {children}
    </PageSubtitle>
  );
};

export default Subtitle;
