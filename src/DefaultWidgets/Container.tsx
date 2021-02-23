import React from 'react';
import { useRouteData } from 'react-static';
import MathJax from 'react-mathjax2';
import styled from 'styled-components';
import { H2, Tag, Breadcrumbs, Classes, Colors, IBreadcrumbProps, Icon, Navbar, NavbarDivider, NavbarGroup, NavbarHeading, IconName } from '@blueprintjs/core';
import { Link } from './linksButtons';


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


const MetaBlockTitle = styled.header`
  background: ${Colors.GRAY1};
  text-transform: uppercase;
  font-size: 12px;
  padding: .2em 1em;
  color: white;
  flex-shrink: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;


const MetaBlockContent = styled.div`
  padding: 1em;
  padding-bottom: 0;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
  background-color: rgba(255, 255, 255, 0.6);
  font-size: 90%;
`;


const MetaBlockWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: hidden;

  &:first-child {
    min-height: 35%;
    flex: 1;
  }
  &:last-child {
    flex-shrink: 0;
  }
`;


const MetaBlock: React.FC<{ block: MetaBlock, className?: string }> = function ({ block, className }) {
  return (
    <MetaBlockWrapper className={`${className} ${Classes.ELEVATION_2}`}>
      <MetaBlockTitle>
        {block.icon
          ? <><Icon icon={block.icon} iconSize={Icon.SIZE_STANDARD} />&ensp;</>
          : null}
        {block.title}
      </MetaBlockTitle>
      <MetaBlockContent>
        {block.content}
      </MetaBlockContent>
    </MetaBlockWrapper>
  );
};


const MATHJAX_SCRIPT = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=AM_HTMLorMML";


interface MetaBlock {
  title: string | JSX.Element
  content: JSX.Element 
  icon?: IconName
}


export const Container: React.FC<{
  breadcrumbs?: IBreadcrumbProps[]
  title?: JSX.Element | string
  contentType?: { icon?: IconName, name: string }
  metaBlocks?: MetaBlock[]
}> =
function ({ children, breadcrumbs, title, contentType, metaBlocks }) {
  const { register } = useRouteData();

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
        <NavbarGroup>
          <Heading>
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
