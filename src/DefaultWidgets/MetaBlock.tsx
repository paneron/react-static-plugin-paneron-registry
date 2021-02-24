import React from 'react';
import styled from 'styled-components';
import { Classes, Colors, Icon, IconName } from '@blueprintjs/core';


export interface IMetaBlock {
  title: string | JSX.Element;
  content: JSX.Element;
  icon?: IconName;
}


export const MetaBlock: React.FC<{ block: IMetaBlock; className?: string; }> = function ({ block, className }) {
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


export default MetaBlock;


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
    min-height: 25%;
    flex: 1;
  }
  &:last-child {
    flex-shrink: 0;
  }
`;
