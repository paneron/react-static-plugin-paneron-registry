import React from 'react';
import { Helmet } from 'react-helmet';
import { useRouteData } from 'react-static';
import { MainRegistryPageRouteData } from '../types';
import Container from '../DefaultWidgets/Container';
import { Locale } from '@riboseinc/paneron-registry-kit/types';
import { IMetaBlock } from '../DefaultWidgets/MetaBlock';
import { Classes, FormGroup, H5, Icon, IconName } from '@blueprintjs/core';
import ItemClassCard from '../DefaultWidgets/ItemClassCard';
import ItemCard from '../DefaultWidgets/Card';


export default () => {
  const {
    register,
    statistics,
    itemClassConfiguration,
    subregisters,
    extraContent,
  }: MainRegistryPageRouteData = useRouteData();

  const {
    contentSummaryHTML,
    usageNoticeHTML,
    sponsorsSupportersHTML,
    contactNoticeHTML,
    registrationAuthorityNoticeHTML,
  } = extraContent;

  const contentSummaryBlockContents: JSX.Element =
    contentSummaryHTML
      ? <div className={Classes.RUNNING_TEXT} dangerouslySetInnerHTML={{ __html: contentSummaryHTML }} />
      : <p className={Classes.RUNNING_TEXT}>{register.contentSummary ?? 'N/A'}</p>;

  let metaBlocks: IMetaBlock[] = [{
    title: "Content summary",
    content: <>
      {contentSummaryBlockContents}
    </>,
  }] ;

  /*
  if (usageNoticeHTML) {
    metaBlocks.push({
      title: "Usage",
      content: <>
        <div dangerouslySetInnerHTML={{ __html: usageNoticeHTML }} />
      </>
    });
  }

  if (sponsorsSupportersHTML) {
    metaBlocks.push({
      title: "Sponsors & supporters",
      content: <>
        <div dangerouslySetInnerHTML={{ __html: sponsorsSupportersHTML }} />
      </>
    });
  }
  */
  
  metaBlocks = metaBlocks.concat([{
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
    title: "Version",
    content: <>
      <H5>
        {register.version?.id ?? 'N/A'}
      </H5>
      <FormGroup label="Date:">
        {register.version?.timestamp ?? 'N/A'}
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
  }]);

  return (
    <>
      <Helmet>
        <title>{register.name}</title>
      </Helmet>

      <Container metaBlocks={metaBlocks} title="Item classes">
        {Object.entries(itemClassConfiguration).map(([classID, classData]) =>
          <ItemClassCard
            style={{ marginBottom: '1em' }}
            itemClass={classData}
            subregisters={Object.keys(subregisters).length > 0 ? subregisters : undefined}
            key={classID}
          />
        )}
        {usageNoticeHTML
          ? <MetaCard title="Usage" __html={usageNoticeHTML} />
          : null}
        {sponsorsSupportersHTML
          ? <MetaCard title="Sponsors and Supporters" __html={sponsorsSupportersHTML} />
          : null}
        {contactNoticeHTML
          ? <MetaCard title="Contacting us" __html={contactNoticeHTML} />
          : null}
        {registrationAuthorityNoticeHTML
          ? <MetaCard title="Registration Authority" __html={registrationAuthorityNoticeHTML} />
          : null}
      </Container>
    </>
  );
};


const MetaCard: React.FC<{ icon?: IconName, title: JSX.Element | string, __html: string }> = function ({ icon, title, __html }) {
  return (
    <ItemCard style={{ marginBottom: '1em' }}>
      <H5><Icon icon={icon ?? "info-sign"} />&ensp;{title}</H5>
      <div dangerouslySetInnerHTML={{ __html }} />
    </ItemCard>
  );
};


const Locale: React.FC<{ locale: Locale }> = function ({ locale }) {
  return (
    <>
      {locale.name} ({locale.languageCode})
    </>
  );
};
