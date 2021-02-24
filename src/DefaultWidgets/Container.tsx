import React from 'react';
import { useRouteData } from 'react-static';
import MathJax from 'react-mathjax2';
import styled from 'styled-components';
import { H2, Tag, Breadcrumbs, Classes, Colors, IBreadcrumbProps, Icon, Navbar, NavbarDivider, NavbarGroup, NavbarHeading, IconName } from '@blueprintjs/core';
import { Link } from './linksButtons';
import MetaBlock, { IMetaBlock } from './MetaBlock';
import Card from './Card';


const HeaderLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  border: none;

  &:hover {
    color: inherit;
    text-decoration: none;
    border: none;
  }
`;


const ContainerWrapperDiv = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;

  padding-top: 50px;

  background-color: ${Colors.GRAY5};

  display: flex;
  flex-flow: column nowrap;
  overflow: hidden;
`;


const ContainerDiv = styled.div`
  flex: 1;

  display: flex;
  flex-flow: row nowrap;
  overflow: hidden;
`;


const Main = styled.div`
  flex: 1;
  padding: 1.5em 4rem 2em 2em;
  margin: 0;
  overflow-y: auto;
`;


const BreadcrumbsStyled = styled(Breadcrumbs)`
  transform: scale(0.8);
  transform-origin: left center;
  margin-left: 1rem;
  white-space: nowrap;
`;


const Heading = styled(NavbarHeading)`
  white-space: nowrap;
  display: flex;
  align-items: center;
`;


const StyledNavbar = styled(Navbar)`
  background-color: rgba(255, 255, 255, 0.8);

  @supports (backdrop-filter: saturate(180%) blur(20px)) or (-webkit-backdrop-filter: saturate(180%) blur(20px)) {
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    backdrop-filter: saturate(180%) blur(20px);
    background-color: rgba(255, 255, 255, 0.6);
  }
`;


const PageHeader = styled.header`
  opacity: .7;
  text-shadow: .1em .1em .5em rgba(0, 0, 0, 0.2);
  margin-bottom: 1.5em;
`;


const PageHeaderWithTitle = styled(PageHeader)`
  margin-left: 1.2rem;
`;


const MetaSidebar = styled.aside`
  flex-shrink: 0;
  flex-basis: 24em;
  display: flex;
  flex-flow: column nowrap;
  overflow: hidden;
  padding-left: 1rem;
`;


const MATHJAX_SCRIPT = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=AM_HTMLorMML";


export const Container: React.FC<{
  breadcrumbs?: IBreadcrumbProps[]
  title?: JSX.Element | string
  contentType?: { icon?: IconName, name: string }
  metaBlocks?: IMetaBlock[]
}> =
function ({ children, breadcrumbs, title, contentType, metaBlocks }) {
  const { register, iconURL } = useRouteData();

  const pageHeaderContents = <H2>
    {title}
    {title && contentType ? <>&ensp;</> : null}
    {contentType
      ? <Tag large round minimal icon={contentType.icon}>{contentType.name}</Tag>
      : null}
  </H2>;

  return (
    <ContainerWrapperDiv>
      <StyledNavbar fixedToTop>
        <NavbarGroup style={{ marginLeft: '20px' }}>
          <Heading>
            {iconURL
              ? <img src={iconURL} style={{ width: '24px', height: '24px', marginRight: '.25em' }} />
              : null}
            {register.name}
          </Heading>
          <NavbarDivider />
          <HeaderLink to="/" className={`${Classes.BUTTON} ${Classes.MINIMAL} ${Classes.ICON}`}><Icon icon="home" /><span className={Classes.BUTTON_TEXT}>Home</span></HeaderLink>
          {(breadcrumbs ?? []).length > 0
            ? <>
                <BreadcrumbsStyled items={breadcrumbs} minVisibleItems={3} />
              </>
            : null} 
        </NavbarGroup>
      </StyledNavbar>

      <MathJax.Context
          script={MATHJAX_SCRIPT}
          options={{
            asciimath2jax: {
              useMathMLspacing: true,
              delimiters: [["`","`"]],
              preview: "none",
            },
          }}>
        <ContainerDiv>
          <Main>
            {title || contentType
              ? title
                ? <PageHeaderWithTitle>{pageHeaderContents}</PageHeaderWithTitle>
                : <PageHeader>{pageHeaderContents}</PageHeader>
              : null}
            {children}
          </Main>
          {(metaBlocks ?? []).length > 0
            ? <MetaSidebar>
                {(metaBlocks ?? []).map(block =>
                  <MetaBlock block={block} className={Classes.ELEVATION_1} />
                )}
              </MetaSidebar>
            : null}
        </ContainerDiv>
      </MathJax.Context>
    </ContainerWrapperDiv>
  );
};


export default Container;


export const ContainerSkeleton: React.FC<Record<never, never>> = function () {
  const loading = "Loading…";
  const loadingEl = <span className={Classes.SKELETON}>{loading}</span>;

  return (
    <ContainerWrapperDiv>
      <StyledNavbar fixedToTop>
        <NavbarGroup style={{ marginLeft: '20px' }}>
          <Heading>
            {loadingEl}
          </Heading>
        </NavbarGroup>
      </StyledNavbar>
      <ContainerDiv>
        <Main>
          <PageHeaderWithTitle className={Classes.SKELETON}>{loading}</PageHeaderWithTitle>
          <Card>{loadingEl}</Card>
        </Main>
        <MetaSidebar>
          <MetaBlock block={{ title: loadingEl, content: loadingEl }} className={Classes.ELEVATION_1} />
          <MetaBlock block={{ title: loadingEl, content: loadingEl }} className={Classes.ELEVATION_1} />
        </MetaSidebar>
      </ContainerDiv>
    </ContainerWrapperDiv>
  );
};
