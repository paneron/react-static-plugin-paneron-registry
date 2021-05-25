import React from 'react';
import { Helmet } from 'react-helmet';
import { navigate } from '@reach/router';
import { useRouteData } from 'react-static';
import { ButtonGroup, FormGroup, H5, BreadcrumbProps } from '@blueprintjs/core';
import { BrowserCtx } from '@riboseinc/paneron-registry-kit/views/BrowserCtx';
import { GenericRelatedItemView } from '@riboseinc/paneron-registry-kit/views/util';
import { DefaultPageProps, RegisterItemPageRouteData } from '../types';
import Container from '../DefaultWidgets/Container';
import { useRegisterItemData, _getRelatedClass } from '../DefaultWidgets/helpers';
import { ButtonLink } from '../DefaultWidgets/linksButtons';
import { ItemCard } from '../DefaultWidgets/Card';
import type { IMetaBlock } from '../DefaultWidgets/MetaBlock';


export default ({ itemClassConfiguration }: DefaultPageProps) => {
  const {
    register,
    subregisters,
    item,
    itemClassID,
    subregisterID,
    reverseRelations,
  }: RegisterItemPageRouteData = useRouteData();

  const itemClass = itemClassConfiguration[itemClassID];

  const ItemView = itemClass.views.listItemView ?? ((props) => <>{props?.itemID}</>);

  const DetailView: typeof itemClass.views.detailView = (
    itemClass.views.detailView ??
    itemClass.views.editView ??
    ((props) => <>{JSON.stringify(props?.itemData)}</>));

  const jumpToItem = (classID: string, itemID: string, subregisterID?: string) => {
    if (subregisterID) {
      navigate(`/${subregisterID}/${classID}/${itemID}/`);
    } else {
      navigate(`/${classID}/${itemID}/`);
    }
  }

  function navigateToClass() {
    if (subregisterID) {
      navigate(`/${subregisterID}/${itemClassID}/`);
    } else {
      navigate(`/${itemClassID}/`);
    }
  }

  function navigateToSubregister() {
    navigate(`/${subregisterID}/`);
  }

  const jsonHref = './item.json';

  const getRelatedItemClassConfiguration = _getRelatedClass(itemClassConfiguration);

  const itemView = <ItemView
    itemData={item.data}
    itemID={item.id} 
    useRegisterItemData={useRegisterItemData}
    subregisterID={subregisterID}
    getRelatedItemClassConfiguration={getRelatedItemClassConfiguration} />;

  const breadcrumbs: BreadcrumbProps[] = [{
    onClick: navigateToClass,
    icon: 'cube',
    current: false,
    text: <>&nbsp;{itemClass.meta.title}</>,
  }, {
    current: true,
    intent: 'primary',
    icon: 'document',
    text: itemView,
  }];

  if (subregisterID) {
    breadcrumbs.splice(0, 0, {
      onClick: navigateToSubregister,
      icon: 'folder-open',
      current: false,
      text: <>{subregisters[subregisterID].title}</>,
    });
  }

  const metaBlocks: IMetaBlock[] = [{
    title: "Normative status",
    content: <>
      <H5>{item.status}</H5>
      <FormGroup label="Date accepted:">
        {item.dateAccepted}
      </FormGroup>
    </>,
  }, {
    title: "Classification",
    icon: 'cube',
    content: <>
      <H5>{itemClass.meta.title}</H5>
      <p>{itemClass.meta.description}</p>
    </>,
  }, {
    title: "Registration",
    content: <>
      {subregisterID
        ? <FormGroup label="Subregister:">
            {subregisters[subregisterID].title}
          </FormGroup>
        : null}
      <FormGroup label="Item ID:">
        {item.id}
      </FormGroup>
    </>,
  }, {
    title: "In other formats",
    content: <>
      <ButtonGroup vertical fill style={{ marginBottom: '1em', }}>
        <ButtonLink to={jsonHref} external>Get as JSON</ButtonLink>
      </ButtonGroup>
    </>,
  }];

  if (Object.keys(reverseRelations).length > 0) {
    metaBlocks.splice(1, 0, {
      title: "Inferred relationships",
      content: <div style={{ marginBottom: '1rem' }}>
        {Object.entries(reverseRelations).map(([fromItemID, meta]) =>
          <GenericRelatedItemView
            itemRef={{ itemID: fromItemID, classID: meta.classID, subregisterID: meta.subregisterID }}
            getRelatedItemClassConfiguration={getRelatedItemClassConfiguration}
            useRegisterItemData={useRegisterItemData} />
        )}
      </div>,
    });
  }

  return (
    <BrowserCtx.Provider
        value={{
          jumpToItem,
          useRegisterItemData,
          itemClasses: itemClassConfiguration,
          getRelatedItemClassConfiguration,
        }}>
      <Helmet>
        <title>Item {item.id} — {register.name}</title>
      </Helmet>

      <Container
          breadcrumbs={breadcrumbs}
          metaBlocks={metaBlocks}
          contentType={{ icon: 'document', name: "Item" }}>
        <ItemCard elevation={3} style={{ position: 'relative', overflowY: 'auto', minHeight: '75vh' }}>
          <DetailView
            itemData={item.data}
            useRegisterItemData={useRegisterItemData}
            getRelatedItemClassConfiguration={getRelatedItemClassConfiguration}
            subregisterID={subregisterID}
          />
        </ItemCard>
      </Container>
    </BrowserCtx.Provider>
  );
};
