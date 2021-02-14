import React from 'react';
import { useRouteData } from 'react-static';
import styled from 'styled-components';
import Nav from './Nav';


const ContainerDiv = styled.div`
  display: flex;
  flex-flow: row nowrap;
  padding: 1rem;
`;


const Main = styled.div`
  flex: 1;
  margin-left: 4rem;
`;


const Container: React.FC<Record<never, never>> = function ({ children }) {
  const { register } = useRouteData();

  return (
    <>
      <h1>Register <em>{register.name}</em></h1>

      <ContainerDiv>
        <Nav />
        <Main>
          {children}
        </Main>
      </ContainerDiv>
    </>
  );
};


export default Container;
