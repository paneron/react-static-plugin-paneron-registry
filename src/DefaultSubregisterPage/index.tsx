import React from 'react';
import { Helmet } from 'react-helmet';
import { useRouteData } from 'react-static';
import { IBreadcrumbProps } from '@blueprintjs/core';
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
    text: <>{subregister.title}</>,
  }];

  return (
    <>
      <Helmet>
        <title>{subregister?.title ?? "<unnamed subregister>"} — {register.name}</title>
      </Helmet>

      <Container breadcrumbs={breadcrumbs}>
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
