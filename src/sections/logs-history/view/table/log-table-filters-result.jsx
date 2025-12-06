import { useCallback } from 'react';
import Chip from '@mui/material/Chip';
import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

export function LogTableFiltersResult({ filters, totalResults, onResetPage, sx, onClearSearch, onClearAll }) {
  const handleRemoveSearchTerm = useCallback(() => {
    if (onClearSearch) {
      onClearSearch();
    } else {
      onResetPage();
      filters.setState({ searchTerm: '' });
    }
  }, [filters, onResetPage, onClearSearch]);

  const handleRemoveStatus = useCallback(() => {
    onResetPage();
    filters.setState({ status: 'all' });
  }, [filters, onResetPage]);

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

      <FiltersBlock label="Status:" isShow={filters.state.status !== 'all'}>
        <Chip
          {...chipProps}
          label={filters.state.status}
          onDelete={handleRemoveStatus}
          sx={{ textTransform: 'capitalize' }}
        />
      </FiltersBlock>
    </FiltersResult>
  );
}
