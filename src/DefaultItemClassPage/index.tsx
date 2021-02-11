import React from 'react';
import { Helmet } from 'react-helmet';
import { useRouteData } from 'react-static';
import { ItemClassPageRouteData } from '../types';
import Container from '../DefaultWidgets/Container';
import { useRegisterItemData, _getRelatedClass } from '../DefaultWidgets/helpers';


export default () => {
  const {
    register,
    itemClassConfiguration,
    items,
    itemClass,
    subregister,
  }: ItemClassPageRouteData = useRouteData();

  const ListItemView = itemClass.views.listItemView;

  return (
    <>
      <Helmet>
        <title>Item class {itemClass.meta.title}{subregister ? ` in subregister ${subregister.title}` : ''} — {register.name}</title>
      </Helmet>

      <Container>
        <h2>Item class {itemClass.meta.title}</h2>

        <div>
          {items.map(item =>
            <ListItemView
              itemID={item.id}
              itemData={item}
              useRegisterItemData={useRegisterItemData}
              getRelatedItemClassConfiguration={_getRelatedClass(itemClassConfiguration)}
            />
          )}
        </div>
      </Container>
    </>
  );
};
