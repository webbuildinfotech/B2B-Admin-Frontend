import { useCallback, useState, useEffect, useMemo } from 'react';
import { Stack, Checkbox, FormControl, Autocomplete, TextField } from '@mui/material';

export function ProductToolbar({ options, filters, clearFilters }) {
    const [selectedSubGroup1, setSelectedSubGroup1] = useState(filters.state.subGroup1 || []);
    const [selectedSubGroup2, setSelectedSubGroup2] = useState(filters.state.subGroup2 || []);

    // Filter available SubGroup1 and SubGroup2 based on selected SubGroup1
    const [availableSubGroup1, availableSubGroup2] = useMemo(() => {
        const subGroup1Set = new Set();
        const subGroup2Set = new Set();

        options.forEach(option => {
            subGroup1Set.add(option.subGroup1);
            if (selectedSubGroup1.includes(option.subGroup1)) {
                subGroup2Set.add(option.subGroup2);
            }
        });

        return [
            Array.from(subGroup1Set).sort((a, b) => a.localeCompare(b)), // Sort SubGroup1 in ascending order
            Array.from(subGroup2Set).sort((a, b) => a.localeCompare(b)), // Sort SubGroup2 in ascending order
        ];
    }, [options, selectedSubGroup1]);

    // Ensure filters are updated when available options change
    useEffect(() => {
        filters.setState(prev => ({
            ...prev,
            subGroup1: prev.subGroup1.filter(sub => availableSubGroup1.includes(sub)),
            subGroup2: prev.subGroup2.filter(sub => availableSubGroup2.includes(sub)),
        }));
    }, [ ]);

    // Clear all filters
    useEffect(() => {
        clearFilters.current = () => {
            setSelectedSubGroup1([]);
            setSelectedSubGroup2([]);
            filters.setState({ subGroup1: [], subGroup2: [] });
        };
    }, [clearFilters, filters]);

    // Handlers for filter changes
    const handleFilterSubGroup1 = useCallback(
        (event, newValue) => {
            setSelectedSubGroup1(newValue);
            filters.setState({ subGroup1: newValue });
            setSelectedSubGroup2([]); // Reset SubGroup2 on SubGroup1 change
        },
        [filters]
    );

    const handleFilterSubGroup2 = useCallback(
        (event, newValue) => {
            setSelectedSubGroup2(newValue);
            filters.setState({ subGroup2: newValue });
        },
        [filters]
    );

    return (
        <Stack
            spacing={2}
            direction="row"
            sx={{
                width: '100%',
                flexWrap: 'wrap',
                gap: 2,
            }}
        >
            {/* SubGroup1 Filter */}
            <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <Autocomplete
                    multiple
                    options={availableSubGroup1}
                    value={selectedSubGroup1}
                    onChange={handleFilterSubGroup1}
                    disableCloseOnSelect
                    getOptionLabel={(option) => option}
                    renderOption={(props, option, { selected }) => (
                        <li {...props}>
                            <Checkbox
                                disableRipple
                                size="small"
                                style={{ marginRight: 8 }}
                                checked={selected}
                            />
                            {option}
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Sub-Group 1"
                            placeholder="Select sub-groups"
                            variant="outlined"
                        />
                    )}
                    isOptionEqualToValue={(option, value) => option === value}
                />
            </FormControl>

            {/* SubGroup2 Filter */}
            <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <Autocomplete
                    multiple
                    options={availableSubGroup2}
                    value={selectedSubGroup2}
                    onChange={handleFilterSubGroup2}
                    disableCloseOnSelect
                    getOptionLabel={(option) => option}
                    renderOption={(props, option, { selected }) => (
                        <li {...props}>
                            <Checkbox
                                disableRipple
                                size="small"
                                style={{ marginRight: 8 }}
                                checked={selected}
                            />
                            {option}
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Sub-Group 2"
                            placeholder="Select sub-groups"
                            variant="outlined"
                        />
                    )}
                    isOptionEqualToValue={(option, value) => option === value}
                />
            </FormControl>
        </Stack>
    );
}
