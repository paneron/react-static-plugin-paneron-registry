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
        <title>Subregister {subregister.title} — {register.name}</title>
      </Helmet>

      <Container>
        <h2>{subregister.title}</h2>

        <h3>Item classes</h3>

        {subregister.itemClasses.map(itemClassID =>
          <Link to={itemClassConfiguration[itemClassID].meta.id} relative>
            {itemClassConfiguration[itemClassID].meta.title}
          </Link>
        )}

        {statistics
          ? <RegistryStats stats={statistics} />
          : null}
      </Container>
    </>
  );
};
