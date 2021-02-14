import React from 'react';
import { Helmet } from 'react-helmet';
import { useRouteData } from 'react-static';
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

  return (
    <>
      <Helmet>
        <title>Subregister {subregister?.title ?? "<unnamed>"} — {register.name}</title>
      </Helmet>

      <Container>
        <h2>{subregister?.title ?? "<unnamed>"}</h2>

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
