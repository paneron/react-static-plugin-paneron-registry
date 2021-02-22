import React from 'react';
import { Helmet } from 'react-helmet';
import { useRouteData } from 'react-static';
import { Tag, Breadcrumbs, IBreadcrumbProps } from '@blueprintjs/core';
import Container from '../DefaultWidgets/Container';
import { _getRelatedClass } from '../DefaultWidgets/helpers';
import { SubregisterPageRouteData } from '../types';
import RegistryStats from '../DefaultWidgets/RegistryStats';
import { Link } from '../DefaultWidgets/linksButtons';


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
      text: <><Tag minimal>Subregister</Tag>&nbsp;{subregister.title}</>,
    }];

  return (
    <>
      <Helmet>
        <title>Subregister {subregister?.title ?? "<unnamed>"} — {register.name}</title>
      </Helmet>

      <Container>
        <Breadcrumbs items={breadcrumbs} />

        <h3>Item classes</h3>

        <ul>
          {subregister.itemClasses.map(itemClassID =>
            <li key={itemClassID}>
              <Link to={itemClassConfiguration[itemClassID]?.meta?.id} relative>
                {itemClassConfiguration[itemClassID]?.meta?.title}
              </Link>
            </li>
          )}
        </ul>

        {statistics
          ? <RegistryStats stats={statistics} />
          : null}
      </Container>
    </>
  );
};
