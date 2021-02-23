import React from 'react';
import { Helmet } from 'react-helmet';
import { navigate } from '@reach/router';
import { useRouteData } from 'react-static';
import { IBreadcrumbProps } from '@blueprintjs/core';
import { DefaultPageProps, ItemClassPageRouteData } from '../types';
import Container from '../DefaultWidgets/Container';
import { useRegisterItemData, _getRelatedClass } from '../DefaultWidgets/helpers';
import { Link } from '../DefaultWidgets/linksButtons';


export default ({ itemClassConfiguration }: DefaultPageProps) => {
  const {
    register,
    items,
    itemClassID,
    subregisterID,
    subregisters,
  }: ItemClassPageRouteData = useRouteData();

  const itemClass = itemClassConfiguration[itemClassID];
  const ItemView = itemClass.views.listItemView ?? ((props) => <>{props?.itemID}</>);
  const subregister = subregisterID ? subregisters[subregisterID] : undefined;

  function navigateToSubregister() {
    navigate(`/${subregisterID}/`);
  }

  const breadcrumbs: IBreadcrumbProps[] = [{
    icon: 'cube',
    current: true,
    text: <>{itemClass.meta.title}</>,
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
    <>
      <Helmet>
        <title>{itemClass.meta.title}{subregister ? ` in ${subregister.title}` : ''} — {register.name}</title>
      </Helmet>

      <Container breadcrumbs={breadcrumbs}>
        <ul>
          {items.map((item, idx) =>
            <li key={idx}>
              <Link to={item.id} relative>
                <ItemView
                  itemID={item.id}
                  itemData={item.data}
                  useRegisterItemData={useRegisterItemData}
                  getRelatedItemClassConfiguration={_getRelatedClass(itemClassConfiguration)}
                  subregisterID={subregisterID}
                />
              </Link>
            </li>
          )}
        </ul>
      </Container>
    </>
  );
};
