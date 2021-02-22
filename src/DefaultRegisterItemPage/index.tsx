import React from 'react';
import { Helmet } from 'react-helmet';
import { navigate } from '@reach/router';
import { useRouteData } from 'react-static';
import { DefaultPageProps, RegisterItemPageRouteData } from '../types';
import Container from '../DefaultWidgets/Container';
import { BrowserCtx } from '@riboseinc/paneron-registry-kit/views/util';
import { useRegisterItemData, _getRelatedClass } from '../DefaultWidgets/helpers';


export default ({ itemClassConfiguration }: DefaultPageProps) => {
  const {
    register,
    item,
    itemClassID,
  }: RegisterItemPageRouteData = useRouteData();

  const itemClass = itemClassConfiguration[itemClassID];
  const DetailView: typeof itemClass.views.detailView = (
    itemClass.views.detailView ??
    itemClass.views.editView ??
    ((props) => <>{JSON.stringify(props?.itemData)}</>));

  const jumpToItem = (classID: string, itemID: string, subregisterID?: string) => {
    if (subregisterID) {
      navigate(`/${subregisterID}/${classID}/${itemID}`);
    } else {
      navigate(`/${classID}/${itemID}`);
    }
  }

  return (
    <BrowserCtx.Provider value={{ jumpToItem }}>
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
    </BrowserCtx.Provider>
  );
};
