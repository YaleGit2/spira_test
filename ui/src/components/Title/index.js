import { Typography } from '../../mui/material';
import styled from 'styled-components';

const PageTitle = styled(Typography)`
  && {
    font-size: 1.6em;
    font-weight: 250;
    color: #5385ab;

    @media screen and (min-width: 768px) {
      margin-top: -0.2em;
    }
  }
`;

const Title = ({ children }) => {
  return (
    <PageTitle variant="h2" noWrap component="div">
      {children}
    </PageTitle>
  );
};

export default Title;
