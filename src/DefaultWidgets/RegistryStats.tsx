import React from 'react';
import styled from 'styled-components';
import { RegistryStatistics } from '../types';


const StatisticsDiv = styled.div`
`;


const RegistryStats: React.FC<{ stats: RegistryStatistics }> = function ({ stats }) {
  return (
    <StatisticsDiv>
      <h3>Statistics</h3>

      <dl>
        <dt>Total number of items</dt>
        <dd>
          {stats.totalItemCount !== undefined
            ? stats.totalItemCount
            : 'N/A'}
        </dd>
      </dl>
    </StatisticsDiv>
  );
}


export default RegistryStats;
