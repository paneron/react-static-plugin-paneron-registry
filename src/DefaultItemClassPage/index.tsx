import React from 'react';
import { Helmet } from 'react-helmet';
import { useRouteData } from 'react-static';
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

  return (
    <>
      <Helmet>
        <title>Item class {itemClass.meta.title}{subregister ? ` in subregister ${subregister.title}` : ''} — {register.name}</title>
      </Helmet>

      <Container>
        <h2>Item class: {itemClass.meta.title}</h2>

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
