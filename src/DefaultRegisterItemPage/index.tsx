import React from 'react';
import { Helmet } from 'react-helmet';
import { useRouteData } from 'react-static';
import { DefaultPageProps, RegisterItemPageRouteData } from '../types';
import Container from '../DefaultWidgets/Container';
import { useRegisterItemData, _getRelatedClass } from '../DefaultWidgets/helpers';


export default ({ itemClassConfiguration }: DefaultPageProps) => {
  const {
    register,
    item,
    itemClassID,
  }: RegisterItemPageRouteData = useRouteData();

  const itemClass = itemClassConfiguration[itemClassID];
  const DetailView = (
    itemClass.views.detailView ??
    itemClass.views.editView ??
    ((props) => <>{JSON.stringify(props?.itemData)}</>));

  return (
    <>
      <Helmet>
        <title>Item {item.id} — {register.name}</title>
      </Helmet>

      <Container>
        <h2>{itemClass.meta.title} {item.id}</h2>

        <DetailView
          itemData={item.data}
          useRegisterItemData={useRegisterItemData}
          getRelatedItemClassConfiguration={_getRelatedClass(itemClassConfiguration)}
        />
      </Container>
    </>
  );
};
