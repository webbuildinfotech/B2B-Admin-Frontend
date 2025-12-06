import { useCallback } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Iconify } from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';

export function VendorTableToolbar({ filters, options, onResetPage, tableData, onSearchChange }) {

    // Filter by name (search term)
    const handleFilterName = useCallback(
        (event) => {
            const { value } = event.target;
            onResetPage();
            filters.setState({ searchTerm: value });
            if (onSearchChange) {
                onSearchChange(value);
            }
        },
        [filters, onResetPage, onSearchChange]
    );

    return (
            <Stack
                spacing={2}
                alignItems={{ xs: 'flex-end', md: 'center' }}
                direction={{ xs: 'column', md: 'row' }}
                sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
            >

                {/* Search Filter */}
                <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
                    <TextField
                        fullWidth
                        value={filters.state.searchTerm}
                        onChange={handleFilterName}
                        placeholder="Search..."
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Stack>
            </Stack>
    );
}
