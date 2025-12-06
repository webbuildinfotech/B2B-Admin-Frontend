import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

export function LedgerTableFiltersResult({ filters, totalResults, onResetPage, onClearSearch, sx }) {
  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    filters.setState({ searchTerm: '' });
    if (onClearSearch) {
      onClearSearch();
    }
  }, [filters, onResetPage, onClearSearch]);

  const handleReset = useCallback(() => {
    onResetPage();
    filters.setState({ searchTerm: '' });
    if (onClearSearch) {
      onClearSearch();
    }
  }, [filters, onResetPage, onClearSearch]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="Search:" isShow={!!filters.state.searchTerm}>
        <Chip {...chipProps} label={filters.state.searchTerm} onDelete={handleRemoveKeyword} />
      </FiltersBlock>
    </FiltersResult>
  );
}
