import React from 'react';
import { Helmet } from 'react-helmet';
import { navigate } from '@reach/router';
import { useRouteData } from 'react-static';
import { Tag, Breadcrumbs, IBreadcrumbProps } from '@blueprintjs/core';
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
    navigate(`/${subregisterID}`);
  }

  const breadcrumbs: IBreadcrumbProps[] = [{
    icon: 'folder-open',
    current: true,
    text: <><Tag minimal>Item class</Tag>&nbsp;{itemClass.meta.title}</>,
  }];

  if (subregisterID) {
    breadcrumbs.splice(0, 0, {
      onClick: navigateToSubregister,
      icon: 'folder-open',
      current: false,
      text: <><Tag minimal>Subregister</Tag>&nbsp;{subregisters[subregisterID].title}</>,
    });
  }

  return (
    <>
      <Helmet>
        <title>Item class {itemClass.meta.title}{subregister ? ` in subregister ${subregister.title}` : ''} — {register.name}</title>
      </Helmet>

      <Container>
        <Breadcrumbs items={breadcrumbs} />

        <ul>
          {items.map((item, idx) =>
            <li key={idx}>
              <Link to={item.id} relative>
                <ItemView
                  itemID={item.id}
                  itemData={item.data}
                  useRegisterItemData={useRegisterItemData}
                  getRelatedItemClassConfiguration={_getRelatedClass(itemClassConfiguration)}
                />
              </Link>
            </li>
          )}
        </ul>
      </Container>
    </>
  );
};
