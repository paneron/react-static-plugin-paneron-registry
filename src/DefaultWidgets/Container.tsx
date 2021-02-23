import React from 'react';
import { useRouteData } from 'react-static';
import MathJax from 'react-mathjax2';
import styled from 'styled-components';
import { Breadcrumbs, Classes, IBreadcrumbProps, Icon, Navbar, NavbarDivider, NavbarGroup, NavbarHeading } from '@blueprintjs/core';
import Nav from './Nav';
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
  overfow-y: auto;
  padding-top: 60px;
`;


const ContainerDiv = styled.div`
  display: flex;
  flex-flow: row nowrap;
  padding: 1rem;
`;


const Main = styled.div`
  flex: 1;
  margin-left: 4rem;
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


const MATHJAX_SCRIPT = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=AM_HTMLorMML";


export const Container: React.FC<{ breadcrumbs?: IBreadcrumbProps[] }> =
function ({ children, breadcrumbs }) {
  const { register } = useRouteData();

  return (
    <ContainerWrapperDiv>
      <Navbar fixedToTop>
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
      </Navbar>

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
          <Nav />
          <Main>
            {children}
          </Main>
        </ContainerDiv>
      </MathJax.Context>
    </ContainerWrapperDiv>
  );
};


export default Container;
