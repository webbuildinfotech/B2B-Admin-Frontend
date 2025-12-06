import { useCallback } from 'react';
import Chip from '@mui/material/Chip';
import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

export function StockTableFiltersResult({ filters, onResetPage, totalResults, sx, onClearSearch }) {

  const handleRemoveSearchTerm = useCallback(() => {
    if (onClearSearch) {
      onClearSearch();
    } else {
      onResetPage();
      filters.setState({ searchTerm: '' });
    }
  }, [filters, onResetPage, onClearSearch]);

  const handleReset = useCallback(() => {
    if (onClearSearch) {
      onClearSearch();
    } else {
      onResetPage();
      filters.setState({ searchTerm: '' });
    }
  }, [filters, onResetPage, onClearSearch]);

  const hasFilters = !!filters.state.searchTerm;

  if (!hasFilters) return null;

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="Keyword:" isShow={!!filters.state.searchTerm}>
        <Chip
          {...chipProps}
          label={filters.state.searchTerm}
          onDelete={handleRemoveSearchTerm}
        />
      </FiltersBlock>
    </FiltersResult>
  );
}
