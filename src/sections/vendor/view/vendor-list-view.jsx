import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';
import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
    useTable,
    emptyRows,
    rowInPage,
    TableNoData,
    getComparator,
    TableEmptyRows,
    TableHeadCustom,
    TableSelectedAction,
    TablePaginationCustom,
} from 'src/components/table';
import { useDispatch, useSelector } from 'react-redux';
import { Typography } from '@mui/material';
import { getVendorStatusOptions, TABLE_VENDOR_HEAD } from '../../../components/constants';

import { applyFilter } from '../utils';
import { useFetchVendorData } from '../components';
import { syncVendor, deleteVendor } from 'src/store/action/vendorActions';
import { VendorTableToolbar } from './table/vendor-table-toolbar';
import { VendorTableFiltersResult } from './table/vendor-table-filters-result';
import { VendorTableRow } from './table/vendor-table-row';
import { TableLoaderOverlay } from 'src/components/loader/table-loader';
import { VENDOR_LIST } from 'src/store/constants/actionTypes';

// ----------------------------------------------------------------------
export function VendorListView() {
    // Read from URL params
    const [searchParams, setSearchParams] = useSearchParams();
    const urlPage = parseInt(searchParams.get('page') || '1', 10) - 1;
    const urlLimit = parseInt(searchParams.get('limit') || '5', 10);
    const urlSearch = searchParams.get('search') || '';
    const urlStatus = searchParams.get('status') || 'all';

    const table = useTable({ 
        defaultRowsPerPage: urlLimit, 
        defaultCurrentPage: urlPage 
    });
    
    const [searchTerm, setSearchTerm] = useState(urlSearch);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(urlSearch);
    const isFetchingData = useRef(false);

    const filters = useSetState({ 
        searchTerm: urlSearch,
        name: '', 
        email: '', 
        status: urlStatus
    });

    const confirm = useBoolean();
    const confirmSync = useBoolean();
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [deleting, setDeleting] = useState(false);
    const [statusCounts, setStatusCounts] = useState({ all: 0, active: 0, inactive: 0 });

    const { fetchData, fetchDeleteData, deleteAllItems, fetchStatusCounts } = useFetchVendorData();
    const dispatch = useDispatch();
    const _vendorList = useSelector((state) => state.vendor?.vendor || []);
    const pagination = useSelector((state) => state.vendor?.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 });
    const prevPaginationTotal = useRef(pagination.total);
    const [tableData, setTableData] = useState(_vendorList);

    // Use status counts from backend instead of tableData
    const STATUS_OPTIONS = [
        { value: 'all', label: 'All', count: statusCounts.all },
        { value: 'Active', label: 'Active', count: statusCounts.active },
        { value: 'Inactive', label: 'Inactive', count: statusCounts.inactive },
    ];

    //----------------------------------------------------------------------------------------------------
    // Fetch status counts on mount only
    useEffect(() => {
        fetchStatusCounts().then(setStatusCounts);
        prevPaginationTotal.current = pagination.total; // Initialize ref
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== debouncedSearchTerm) {
                setDebouncedSearchTerm(searchTerm);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, debouncedSearchTerm]);

    // Update table data
    useEffect(() => {
        setTableData(_vendorList);
    }, [_vendorList]);

    // Refresh status counts only when pagination total changes (after delete/update)
    useEffect(() => {
        // Only refresh if total actually changed (not on initial mount or same value)
        if (prevPaginationTotal.current !== pagination.total && pagination.total > 0) {
            fetchStatusCounts().then(setStatusCounts);
            prevPaginationTotal.current = pagination.total;
        }
    }, [pagination.total]); // eslint-disable-line react-hooks/exhaustive-deps

    // Fetch data and update URL
    useEffect(() => {
        if (isFetchingData.current) return;

        // Update URL
        const params = new URLSearchParams();
        params.set('page', (table.page + 1).toString());
        params.set('limit', table.rowsPerPage.toString());
        if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
        if (filters.state.status !== 'all') params.set('status', filters.state.status);
        setSearchParams(params, { replace: true });

        // Fetch data
        isFetchingData.current = true;
        fetchData(table.page + 1, table.rowsPerPage, debouncedSearchTerm, filters.state.status)
            .finally(() => { isFetchingData.current = false; });
            
    }, [table.page, table.rowsPerPage, debouncedSearchTerm, filters.state.status]); // eslint-disable-line react-hooks/exhaustive-deps
    //----------------------------------------------------------------------------------------------------


    const handleSelectRow = useCallback((id) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    }, []);

    const handleDeleteSelectedRows = useCallback(async () => {
        setDeleting(true);
        try {
            const deletedCount = selectedRows.length;
            await Promise.all(selectedRows.map((id) => dispatch(deleteVendor(id))));
            
            setSelectedRows([]);
            
            // Check if current page will be empty after deletion
            const currentPage = table.page + 1;
            const itemsOnCurrentPage = tableData.length;
            
            // If all items on current page are deleted and not page 1, go to previous page
            let targetPage = currentPage;
            if (deletedCount >= itemsOnCurrentPage && currentPage > 1) {
                targetPage = currentPage - 1;
            }
            
            // Prevent main useEffect from interfering
            isFetchingData.current = true;
            
            // Fetch data with correct pagination
            await fetchData(targetPage, table.rowsPerPage, debouncedSearchTerm, filters.state.status);
            
            // Update table page after fetch (if page changed)
            if (targetPage !== currentPage) {
                table.onChangePage(null, targetPage - 1); // Update table page (0-indexed)
            }
            
            isFetchingData.current = false;
            confirm.onFalse();
            // Status counts will be refreshed automatically via useEffect when pagination.total changes
        } catch (error) {
            console.error("Error deleting selected rows:", error);
            isFetchingData.current = false;
        } finally {
            setDeleting(false);
        }
    }, [selectedRows, confirm, table.page, table.rowsPerPage, table.onChangePage, debouncedSearchTerm, filters.state.status, tableData.length, fetchData, dispatch]);

    //----------------------------------------------------------------------------------------------------
    const canReset = !!searchTerm || filters.state.status !== 'all';
    const notFound = !tableData.length;

    const handleSearchChange = useCallback((value) => {
        setSearchTerm(value);
        filters.setState({ searchTerm: value });
    }, [filters]);

    const handleClearSearch = useCallback(() => {
        setSearchTerm('');
        setDebouncedSearchTerm('');
        filters.setState({ searchTerm: '' });
        table.onResetPage();
    }, [filters, table]);

    const handleClearAll = useCallback(() => {
        setSearchTerm('');
        setDebouncedSearchTerm('');
        filters.setState({
            searchTerm: '',
            status: 'all'
        });
        table.onResetPage();
    }, [filters, table]);

    //----------------------------------------------------------------------------------------------------
    const handleDeleteRow = useCallback(async (id) => {
        const success = await dispatch(deleteVendor(id));
        if (success) {
            // Check if current page will be empty after deletion
            const currentPage = table.page + 1;
            const itemsOnCurrentPage = tableData.length;
            
            // If this is the last item on the page and not page 1, go to previous page
            let targetPage = currentPage;
            if (itemsOnCurrentPage === 1 && currentPage > 1) {
                targetPage = currentPage - 1;
            }
            
            // Prevent main useEffect from interfering
            isFetchingData.current = true;
            
            // Fetch data with correct pagination
            await fetchData(targetPage, table.rowsPerPage, debouncedSearchTerm, filters.state.status);
            
            // Update table page after fetch (if page changed)
            if (targetPage !== currentPage) {
                table.onChangePage(null, targetPage - 1); // Update table page (0-indexed)
            }
            
            isFetchingData.current = false;
            // Status counts will be refreshed automatically via useEffect when pagination.total changes
        }
    }, [dispatch, fetchData, table.page, table.rowsPerPage, table.onChangePage, debouncedSearchTerm, filters.state.status, tableData.length]);

    const handleEditRow = useCallback((id) => id, []);

    const handleViewRow = useCallback((id) => id, []);

    const handleFilterStatus = useCallback(
        (event, newValue) => {
            table.onResetPage();
            filters.setState({ status: newValue });
        },
        [filters, table]
    );

    const handleSyncAPI = async () => {
        setLoading(true);
        try {
            await dispatch(syncVendor());
            await fetchData(table.page + 1, table.rowsPerPage, debouncedSearchTerm, filters.state.status);
            // Status counts will be refreshed automatically via useEffect when pagination.total changes
        } catch (error) {
            console.error('Error syncing vendor:', error);
        } finally {
            setLoading(false);
            confirmSync.onFalse();
        }
    };

    //----------------------------------------------------------------------------------------------------

    return (
        <>
            <DashboardContent maxWidth="2xl">
                <CustomBreadcrumbs
                    heading="List"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Vendors', href: paths?.vendors?.root },
                        { name: 'List' },
                    ]}
                    action={
                        <Button

                            onClick={confirmSync.onTrue} // Open the sync confirmation dialog
                            variant="contained"
                            startIcon={<Iconify icon="eva:sync-fill" />} // Changed icon
                            disabled={loading} // Disable button while loading
                        >
                            {loading ? 'Syncing...' : 'Sync Vendors'}
                        </Button>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <Card>
                    <Tabs value={filters.state.status} onChange={handleFilterStatus}
                        sx={{
                            px: 2.5,
                            boxShadow: (theme) =>
                                `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
                        }}
                    >
                        {STATUS_OPTIONS.map((tab) => (
                            <Tab
                                key={tab.value}
                                iconPosition="end"
                                value={tab.value}
                                label={tab.label}
                                icon={
                                    <Label
                                        variant={tab.value === filters.state.status ? 'filled' : 'soft'}
                                        color={
                                            (tab.value === 'Active' && 'success') ||
                                            (tab.value === 'Inactive' && 'error') ||
                                            (tab.value === 'all' && 'default') || 'default'
                                        }
                                    >
                                        {tab.count} {/* Display the count for each status */}
                                    </Label>
                                }
                            />
                        ))}
                    </Tabs>
                    <VendorTableToolbar 
                        filters={filters} 
                        onResetPage={table.onResetPage}
                        onSearchChange={handleSearchChange}
                    />
                    {canReset && (
                        <VendorTableFiltersResult
                            filters={filters}
                            totalResults={pagination.total}
                            onResetPage={table.onResetPage}
                            onClearSearch={handleClearSearch}
                            onClearAll={handleClearAll}
                            sx={{ p: 2.5, pt: 0 }}
                        />
                    )}

                    <Box sx={{ position: 'relative' }}>
                        <TableLoaderOverlay actionType={VENDOR_LIST} />
                        <TableSelectedAction
                            dense={table.dense}
                            numSelected={selectedRows.length}
                            rowCount={tableData.length}
                            onSelectAllRows={(checked) => setSelectedRows(checked ? tableData.map(row => row.id) : [])}

                            action={
                                <Tooltip title="Delete">
                                    <IconButton color="primary" onClick={confirm.onTrue}>
                                        <Iconify icon="solar:trash-bin-trash-bold" />
                                    </IconButton>
                                </Tooltip>
                            }
                        />
                        <Scrollbar>
                            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                                <TableHeadCustom
                                    order={table.order}
                                    orderBy={table.orderBy}
                                    headLabel={TABLE_VENDOR_HEAD}
                                    rowCount={pagination.total}
                                    numSelected={selectedRows.length}
                                    onSort={table.onSort}
                                    onSelectAllRows={(checked) =>
                                        setSelectedRows(checked ? tableData.map((row) => row.id) : [])
                                    }
                                />

                                <TableBody>
                                    {tableData.map((row) => (
                                        <VendorTableRow
                                            key={row.id}
                                            row={row}
                                            selected={selectedRows.includes(row.id)}
                                            onSelectRow={() => handleSelectRow(row.id)}
                                            onDeleteRow={() => handleDeleteRow(row.id)}
                                            onEditRow={() => handleEditRow(row.id)}
                                            onViewRow={() => handleViewRow(row.id)}

                                        />
                                    ))}

                                    <TableEmptyRows
                                        height={table.dense ? 56 : 56 + 20}
                                        emptyRows={emptyRows(table.page, table.rowsPerPage, pagination.total)}
                                    />

                                    <TableNoData notFound={notFound} />
                                </TableBody>
                            </Table>
                        </Scrollbar>

                    </Box>

                    <TablePaginationCustom
                        page={table.page}
                        dense={table.dense}
                        count={pagination.total}
                        rowsPerPage={table.rowsPerPage}
                        onPageChange={table.onChangePage}
                        onChangeDense={table.onChangeDense}
                        onRowsPerPageChange={table.onChangeRowsPerPage}
                    />
                </Card>
            </DashboardContent>

            {/* Sync Confirmation Dialog */}
            <ConfirmDialog
                open={confirmSync.value}
                onClose={loading ? !confirmSync.onFalse : confirmSync.onFalse}
                content={
                    <Box>
                        <Typography gutterBottom>Are you sure you want to sync the Vendors?</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            This action will update the vendors data and may take a few moments.
                        </Typography>
                        {loading && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1 }}>
                                Please wait, the sync is in progress... This may take a few minutes. Do not close this dialog.
                            </Typography>
                        )}
                    </Box>
                }
                action={
                    <Button
                        onClick={handleSyncAPI} // Trigger sync API call on confirmation
                        variant="contained"
                        color="primary"
                        disabled={loading} // Disable button while loading
                    >
                        {loading ? 'Syncing...' : 'Confirm Sync'}
                    </Button>
                }
            />

            <ConfirmDialog
                open={confirm.value}
                onClose={confirm.onFalse}
                title="Delete vendors?"
                content={
                    <Box>
                        <Typography gutterBottom>Are you sure you want to delete the selected vendors?</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            This action cannot be undone.
                        </Typography>
                    </Box>
                }
                action={
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteSelectedRows}
                        disabled={deleting} // Disable while deleting
                    >
                        {deleting ? 'Deleting...' : 'Delete'}
                    </Button>
                }
            />
        </>
    );
}

