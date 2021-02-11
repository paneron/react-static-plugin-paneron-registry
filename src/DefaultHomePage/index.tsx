import React from 'react';
import { Helmet } from 'react-helmet';
import { useRouteData } from 'react-static';
import { MainRegistryPageRouteData } from '../types';
import Container from '../DefaultWidgets/Container';
import { Locale } from '@riboseinc/paneron-registry-kit/types';


export default () => {
  const {
    register,
    statistics,
  }: MainRegistryPageRouteData = useRouteData();

  return (
    <>
      <Helmet>
        <title>{register.name}</title>
      </Helmet>

      <Container>
        <h2>Register <em>{register.name}</em></h2>

        <dl>
          <dt>Content summary</dt>
          <dd>
            {register.contentSummary ?? 'N/A'}
          </dd>
          <dt>Operating language</dt>
          <dd>
            {register.operatingLanguage
              ? <Locale locale={register.operatingLanguage} />
              : 'N/A'}
          </dd>
          <dt>Alternative languages</dt>
          <dd>
            {register.alternativeLanguages
              ? register.alternativeLanguages.map((l, idx) => <Locale key={idx} locale={l} />)
              : 'N/A'}
          </dd>
        </dl>

        <h3>Statistics</h3>

        <dl>
          <dt>Total number of items</dt>
          <dd>
            {statistics.totalItemCount !== undefined
              ? statistics.totalItemCount
              : 'N/A'}
          </dd>
        </dl>
      </Container>
    </>
  );
};


const Locale: React.FC<{ locale: Locale }> = function ({ locale }) {
  return (
    <>
      {locale.name} • {locale.country} • {locale.languageCode}
    </>
  );
};
