import React from 'react';
import { H5, Icon } from '@blueprintjs/core';
import { ItemClassConfiguration } from '@riboseinc/paneron-registry-kit/types';
import { ButtonLink } from './linksButtons';
import Card from './Card';


export const ItemClassCard: React.FC<{ itemClass: ItemClassConfiguration<any> }> = function ({ itemClass }) {
  return (
    <Card elevation={3}>
      <H5><Icon icon="cube" />&ensp;{itemClass.meta.title}</H5>
      <p>{itemClass.meta.description}</p>
      <ButtonLink relative to={`./${itemClass.meta.id}`}>View</ButtonLink>
    </Card>
  );
};


export default ItemClassCard;
