import React from 'react';
import { Helmet } from 'react-helmet';
import { useRouteData } from 'react-static';
import { MainRegistryPageRouteData } from '../types';
import Container from '../DefaultWidgets/Container';
import { Locale } from '@riboseinc/paneron-registry-kit/types';
import { IMetaBlock } from '../DefaultWidgets/MetaBlock';
import { Classes, FormGroup, H5 } from '@blueprintjs/core';
import ItemClassCard from '../DefaultWidgets/ItemClassCard';


export default () => {
  const {
    register,
    statistics,
    itemClassConfiguration,
    subregisters,
  }: MainRegistryPageRouteData = useRouteData();

  const metaBlocks: IMetaBlock[] = [{
    title: "Content summary",
    content: <>
      <p className={Classes.RUNNING_TEXT}>{register.contentSummary ?? 'N/A'}</p>
    </>,
  }, {
    title: "Operating language",
    content: <>
      <H5>
        {register.operatingLanguage
          ? <Locale locale={register.operatingLanguage} />
          : 'N/A'}
      </H5>
      <FormGroup label="Alternative languages:">
        {register.alternativeLanguages
          ? register.alternativeLanguages.map((l, idx) => <Locale key={idx} locale={l} />)
          : 'N/A'}
      </FormGroup>
    </>,
  }, {
    title: "Statistics",
    content: <>
      <FormGroup label="Total number of items:">
        <span style={{ fontSize: '140%' }}>
          {statistics.totalItemCount !== undefined
            ? statistics.totalItemCount
            : 'N/A'}
        </span>
      </FormGroup>
    </>,
  }];

  return (
    <>
      <Helmet>
        <title>{register.name}</title>
      </Helmet>

      <Container metaBlocks={metaBlocks}>
        {Object.entries(itemClassConfiguration).map(([classID, classData]) =>
          <ItemClassCard
            style={{ marginBottom: '1em' }}
            itemClass={classData}
            subregisters={Object.keys(subregisters).length > 0 ? subregisters : undefined}
            key={classID}
          />
        )}
      </Container>
    </>
  );
};


const Locale: React.FC<{ locale: Locale }> = function ({ locale }) {
  return (
    <>
      {locale.name} ({locale.languageCode})
    </>
  );
};
