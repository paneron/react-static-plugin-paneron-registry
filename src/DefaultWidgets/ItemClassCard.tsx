import React from 'react';
import { ButtonGroup, H5, Icon } from '@blueprintjs/core';
import { ItemClassConfiguration, Subregisters } from '@riboseinc/paneron-registry-kit/types';
import { ButtonLink } from './linksButtons';
import Card from './Card';


export const BaseItemClassCard: React.FC<{
  itemClass: ItemClassConfiguration<any>
  className?: string
  style?: React.CSSProperties
}> =
function ({ itemClass, className, style, children }) {
  return (
    <Card elevation={3} className={className} style={style}>
      <H5><Icon icon="cube" />&ensp;{itemClass.meta.title}</H5>
      <p>{itemClass.meta.description}</p>
      {children}
    </Card>
  );
};


export const ItemClassCard: React.FC<{
  itemClass: ItemClassConfiguration<any>
  subregisters?: Subregisters
  className?: string
  style?: React.CSSProperties
}> = function ({ itemClass, subregisters, className, style }) {
  if (subregisters !== undefined) {
    const containingSubregisters = Object.entries(subregisters).
      filter(([_, subregData]) => subregData.itemClasses.indexOf(itemClass.meta.id) >= 0);

    return (
      <BaseItemClassCard itemClass={itemClass} className={className} style={style}>
        <ButtonGroup style={{ overflowX: 'auto', width: '100%' }}>
          {containingSubregisters.map(([subregID, subregData]) =>
            <ButtonLink
                key={subregID}
                relative
                to={`./${subregID}/${itemClass.meta.id}`}>
              Browse&nbsp;{containingSubregisters.length > 1 ? subregData.title : "items"}
            </ButtonLink>
          )}
        </ButtonGroup>
      </BaseItemClassCard>
    );

  } else {
    return (
      <BaseItemClassCard itemClass={itemClass} className={className} style={style}>
        <ButtonLink relative to={`./${itemClass.meta.id}`}>Browse items</ButtonLink>
      </BaseItemClassCard>
    );
  }
};


export default ItemClassCard;
