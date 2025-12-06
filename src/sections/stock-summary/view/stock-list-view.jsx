import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import { paths } from 'src/routes/paths';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
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
import { getProductStatusOptions, TABLE_STOCK_HEAD } from '../../../components/constants';
import { applyFilter } from '../utils';
import { useFetchStockData } from '../components/fetch-stock';
import { StockTableFiltersResult } from './table/stock-table-filters-result';
import { StockTableRow } from './table/stock-table-row';
import { StockTableToolbar } from './table/stock-table-toolbar';
import { syncStock } from 'src/store/action/stockSummaryActions';
import { TableLoaderOverlay } from 'src/components/loader/table-loader';
import { STOCK_LIST } from 'src/store/constants/actionTypes';

// ----------------------------------------------------------------------
export function StockListView() {
    // Read from URL params
    const [searchParams, setSearchParams] = useSearchParams();
    const urlPage = parseInt(searchParams.get('page') || '1', 10) - 1;
    const urlLimit = parseInt(searchParams.get('limit') || '5', 10);
    const urlSearch = searchParams.get('search') || '';

    const table = useTable({ 
        defaultRowsPerPage: urlLimit, 
        defaultCurrentPage: urlPage 
    });
    
    const [searchTerm, setSearchTerm] = useState(urlSearch);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(urlSearch);
    const isFetchingData = useRef(false);

    const filters = useSetState({ searchTerm: urlSearch });

    const confirm = useBoolean();
    const confirmSync = useBoolean();
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [deleting, setDeleting] = useState(false);

    const { fetchData, deleteAllItems } = useFetchStockData();
    const dispatch = useDispatch();
    const _stock = useSelector((state) => state.stock?.stock || []);
    const pagination = useSelector((state) => state.stock?.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 });
    const [tableData, setTableData] = useState(_stock);

    //----------------------------------------------------------------------------------------------------
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
        setTableData(_stock);
    }, [_stock]);

    // Fetch data and update URL
    useEffect(() => {
        if (isFetchingData.current) return;

        // Update URL
        const params = new URLSearchParams();
        params.set('page', (table.page + 1).toString());
        params.set('limit', table.rowsPerPage.toString());
        if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
        setSearchParams(params, { replace: true });

        // Fetch data
        isFetchingData.current = true;
        fetchData(table.page + 1, table.rowsPerPage, debouncedSearchTerm)
            .finally(() => { isFetchingData.current = false; });
            
    }, [table.page, table.rowsPerPage, debouncedSearchTerm]); // eslint-disable-line react-hooks/exhaustive-deps
    //----------------------------------------------------------------------------------------------------

    const handleSelectRow = useCallback((id) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    }, []);



    const handleDeleteSelectedRows = useCallback(async () => {
        setDeleting(true);
        try {
            await deleteAllItems(selectedRows, table.page + 1, table.rowsPerPage, debouncedSearchTerm);
            setSelectedRows([]);
            confirm.onFalse();
        } catch (error) {
            console.error("Error deleting selected rows:", error);
        } finally {
            setDeleting(false);
        }
    }, [selectedRows, deleteAllItems, confirm, table.page, table.rowsPerPage, debouncedSearchTerm]);


    //----------------------------------------------------------------------------------------------------
    const canReset = !!searchTerm;
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

    //----------------------------------------------------------------------------------------------------
    const handleSyncAPI = useCallback(async () => {
        setLoading(true);
        try {
            const res = await dispatch(syncStock());
            if (res) {
                await fetchData(table.page + 1, table.rowsPerPage, debouncedSearchTerm);
            }
        } catch (error) {
            console.error("Failed to sync Stocks", error);
        } finally {
            setLoading(false);
            confirmSync.onFalse();
        }
    }, [dispatch, fetchData, confirmSync, table.page, table.rowsPerPage, debouncedSearchTerm]);

    //----------------------------------------------------------------------------------------------------

    return (
        <>
            <DashboardContent maxWidth="2xl">
                <CustomBreadcrumbs
                    heading="List"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Stocks', href: paths?.dashboard?.stocks?.root },
                        { name: 'List' },
                    ]}
                    action={
                        <Button
                            // href={paths?.dashboard?.user?.new}
                            onClick={confirmSync.onTrue} // Open the sync confirmation dialog
                            variant="contained"
                            startIcon={<Iconify icon="eva:sync-fill" />}
                            disabled={loading}
                        >
                            {loading ? 'Syncing...' : 'Sync Stocks'}
                        </Button>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <Card>
                    <StockTableToolbar
                        filters={filters}
                        onResetPage={table.onResetPage}
                        onSearchChange={handleSearchChange}
                    />
                    {canReset && (
                        <StockTableFiltersResult
                            filters={filters}
                            totalResults={pagination.total}
                            onResetPage={table.onResetPage}
                            onClearSearch={handleClearSearch}
                            sx={{ p: 2.5, pt: 0 }}
                        />
                    )}

                    <Box sx={{ position: 'relative' }}>
                        <TableLoaderOverlay actionType={STOCK_LIST} />
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
                                    headLabel={TABLE_STOCK_HEAD}
                                    rowCount={pagination.total}
                                    numSelected={selectedRows.length}
                                    onSort={table.onSort}
                                    onSelectAllRows={(checked) =>
                                        setSelectedRows(checked ? tableData.map((row) => row.id) : [])
                                    }
                                />

                                <TableBody>
                                    {tableData.map((row) => (
                                            <StockTableRow
                                                key={row.id}
                                                row={row}
                                                selected={selectedRows.includes(row.id)}
                                                onSelectRow={() => handleSelectRow(row.id)}


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
                onClose={confirmSync.onFalse}
                content={
                    <Box>
                        <Typography gutterBottom>Are you sure you want to sync the Stocks?</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            This action will update the stocks data and may take a few moments.
                        </Typography>
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
                title="Delete Stocks?"
                content={
                    <Box>
                        <Typography gutterBottom>Are you sure you want to delete the selected Stocks?</Typography>
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

