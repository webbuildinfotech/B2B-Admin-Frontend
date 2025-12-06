import { useCallback } from 'react';
import Stack from '@mui/material/Stack';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

export function PaymentTableToolbar({ filters, onResetPage, onSearchChange, searchTerm }) {
    const popover = usePopover();

    // Handle filter by search term
    const handleFilterName = useCallback(
        (event) => {
            const { value } = event.target;
            if (onSearchChange) {
                onSearchChange(value);
            } else {
                onResetPage();
                filters.setState({ searchTerm: value });
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
                        value={searchTerm !== undefined ? searchTerm : filters.state.searchTerm}
                        onChange={handleFilterName}
                        placeholder="Search by Account Name, Account Number, IFSC, UPI ID, PayPal Email..."
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
