import React from 'react';
import { Helmet } from 'react-helmet';
import { useRouteData } from 'react-static';
import { RegisterItemPageRouteData } from '../types';
import Container from '../DefaultWidgets/Container';
import { useRegisterItemData, _getRelatedClass } from '../DefaultWidgets/helpers';


export default () => {
  const {
    register,
    itemClassConfiguration,
    item,
    itemClassID,
  }: RegisterItemPageRouteData = useRouteData();

  const itemClass = itemClassConfiguration[itemClassID];
  const DetailView = itemClass.views.detailView;

  return (
    <>
      <Helmet>
        <title>Item {item.id} — {register.name}</title>
      </Helmet>

      <Container>
        <DetailView
          itemData={item}
          useRegisterItemData={useRegisterItemData}
          getRelatedItemClassConfiguration={_getRelatedClass(itemClassConfiguration)}
        />
      </Container>
    </>
  );
};
