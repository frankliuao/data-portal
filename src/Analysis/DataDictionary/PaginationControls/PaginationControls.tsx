import React, { useState } from 'react';
import { Text, Pagination, SimpleGrid } from '@mantine/core';
import EntriesQuanitySelector from './EntriesQuantitySelector';

const PaginationControls: React.FC = ({
  activePage,
  setActivePage,
}): JSX.Element => {
  interface Data {
    id: number;
    name: string;
  }

  return (
    <div className='pagination-wrapper'>
      <SimpleGrid cols={2}>
        <EntriesQuanitySelector />
        <div className='pagination-container'>
          <Pagination
            align='right'
            total={53}
            value={activePage}
            onChange={setActivePage}
          />
        </div>
      </SimpleGrid>
    </div>
  );
};
export default PaginationControls;
