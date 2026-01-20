import { useCallback } from 'react';
import Chip from '@mui/material/Chip';
import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

export function SalesInvoiceTableFiltersResult({ 
  filters, 
  onResetPage, 
  totalResults, 
  sx, 
  onClearSearch, 
  onClearAll 
}) {
  const handleRemoveSearchTerm = useCallback(() => {
    if (onClearSearch) {
      onClearSearch();
    } else {
      onResetPage();
      filters.setState({ searchTerm: '' });
    }
  }, [filters, onResetPage, onClearSearch]);

  const handleReset = useCallback(() => {
    if (onClearAll) {
      onClearAll();
    } else {
      onResetPage();
      filters.onResetState();
    }
  }, [filters, onResetPage, onClearAll]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="Search:" isShow={!!filters.state.searchTerm}>
        <Chip
          {...chipProps}
          label={filters.state.searchTerm}
          onDelete={handleRemoveSearchTerm}
        />
      </FiltersBlock>
    </FiltersResult>
  );
}

