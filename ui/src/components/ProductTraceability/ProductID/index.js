import { Typography } from '../../../mui/material';
import styled from 'styled-components';

const ID = styled(Typography)`
  && {
    font-size: 1.2em;
    font-weight: 250;
    color: white;
    background-color: #25455E;
    width: 90vw;
    overflow: hidden;
    margin: 4;
    padding: 8px;

    @media screen and (min-width: 768px) {
      margin-top: -0.2em;
    }
  }
`;

export default function ProductID({name, id}) {
  return(
    <ID>
      {name} ID <br />
      <span style={{fontSize:'12pt'}}>{id}</span>
    </ID>
  )
};