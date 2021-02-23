import React from 'react';
import { Helmet } from 'react-helmet';
import { useRouteData } from 'react-static';
import { IBreadcrumbProps } from '@blueprintjs/core';
import Container from '../DefaultWidgets/Container';
import { _getRelatedClass } from '../DefaultWidgets/helpers';
import { SubregisterPageRouteData } from '../types';
import RegistryStats from '../DefaultWidgets/RegistryStats';
import ItemClassCard from '../DefaultWidgets/ItemClassCard';


export default () => {
  const {
    itemClassConfiguration,
    register,
    subregister,
    statistics,
  }: SubregisterPageRouteData = useRouteData();

  const breadcrumbs: IBreadcrumbProps[] = [{
    icon: 'folder-open',
    current: true,
    intent: 'primary',
    text: <>{subregister.title}</>,
  }];

  return (
    <>
      <Helmet>
        <title>{subregister?.title ?? "<unnamed subregister>"} — {register.name}</title>
      </Helmet>

      <Container
          breadcrumbs={breadcrumbs}
          title={subregister.title}
          contentType={{ icon: 'folder-open', name: 'Subregister' }}>
        {subregister.itemClasses.map(itemClassID =>
          <ItemClassCard key={itemClassID} itemClass={itemClassConfiguration[itemClassID]} />
        )}

        {statistics
          ? <RegistryStats stats={statistics} />
          : null}
      </Container>
    </>
  );
};
