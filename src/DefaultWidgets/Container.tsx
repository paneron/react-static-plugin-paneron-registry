import React from 'react';
import styled from 'styled-components';
import Nav from './Nav';


const ContainerDiv = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;


const Main = styled.div`
  flex: 1;
`;


const Container: React.FC<Record<never, never>> = function ({ children }) {
  return (
    <ContainerDiv>
      <Nav />
      <Main>
        {children}
      </Main>
    </ContainerDiv>
  );
};


export default Container;
