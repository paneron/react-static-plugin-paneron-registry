import React from 'react';
import { Helmet } from 'react-helmet';
import { navigate } from '@reach/router';
import { useRouteData } from 'react-static';
import { Text, IBreadcrumbProps, Classes } from '@blueprintjs/core';
import { DefaultPageProps, RegisterItemPageRouteData } from '../types';
import Container from '../DefaultWidgets/Container';
import { BrowserCtx } from '@riboseinc/paneron-registry-kit/views/util';
import { useRegisterItemData, _getRelatedClass } from '../DefaultWidgets/helpers';


export default ({ itemClassConfiguration }: DefaultPageProps) => {
  const {
    register,
    subregisters,
    item,
    itemClassID,
    subregisterID,
  }: RegisterItemPageRouteData = useRouteData();

  const itemClass = itemClassConfiguration[itemClassID];

  const ItemView = itemClass.views.listItemView ?? ((props) => <>{props?.itemID}</>);

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

  function navigateToClass() {
    if (subregisterID) {
      navigate(`/${subregisterID}/${itemClassID}`);
    } else {
      navigate(`/${itemClassID}`);
    }
  }

  function navigateToSubregister() {
    navigate(`/${subregisterID}`);
  }

  const breadcrumbs: IBreadcrumbProps[] = [{
    onClick: navigateToClass,
    icon: 'cube',
    current: false,
    text: <>&nbsp;{itemClass.meta.title}</>,
  }, {
    current: true,
    icon: 'document',
    text: <>
      <ItemView
        itemData={item.data}
        itemID={item.id} 
        useRegisterItemData={useRegisterItemData}
        subregisterID={subregisterID}
        getRelatedItemClassConfiguration={_getRelatedClass(itemClassConfiguration)} />
      &nbsp;
      <small className={Classes.TEXT_MUTED}><Text ellipsize>{item.id}</Text></small>
    </>,
  }];

  if (subregisterID) {
    breadcrumbs.splice(0, 0, {
      onClick: navigateToSubregister,
      icon: 'folder-open',
      current: false,
      text: <>{subregisters[subregisterID].title}</>,
    });
  }

  return (
    <BrowserCtx.Provider value={{ jumpToItem }}>
      <Helmet>
        <title>Item {item.id} — {register.name}</title>
      </Helmet>

      <Container breadcrumbs={breadcrumbs}>
        <DetailView
          itemData={item.data}
          useRegisterItemData={useRegisterItemData}
          getRelatedItemClassConfiguration={_getRelatedClass(itemClassConfiguration)}
          subregisterID={subregisterID}
        />
      </Container>
    </BrowserCtx.Provider>
  );
};
