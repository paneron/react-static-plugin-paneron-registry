import styled from 'styled-components';
import { Card as BaseCard } from '@blueprintjs/core';


export const Card = styled(BaseCard)`
  border-radius: .75rem;
`;


export const ItemCard = styled(Card)`
  padding: 30px 40px;
  padding-bottom: 1px;
`;


export default Card;
