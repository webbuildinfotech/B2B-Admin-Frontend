
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
    TableNoData,
    getComparator,
    TableEmptyRows,
    TableHeadCustom,
    TableSelectedAction,
    TablePaginationCustom,
} from 'src/components/table';

import { LedgerTableRow } from './table/ledger-table-row';
import { useDispatch, useSelector } from 'react-redux';
import useUserRole from 'src/layouts/components/user-role';
import { Autocomplete, TextField, Typography } from '@mui/material';
import { applyFilter } from '../utils/filterUtils';
import { LedgerTableToolbar } from './ledger-table-toolbar';
import { useFetchData } from '../components/fetch-ledger';
import { LedgerTableFiltersResult } from './table/ledger-table-filters-result';
import { syncLedger } from 'src/store/action/accountingActions';
import { TableLoaderOverlay } from 'src/components/loader/table-loader';
import { LEDGER_LIST } from 'src/store/constants/actionTypes';
// ----------------------------------------------------------------------

export function LedgerListView() {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlPage = parseInt(searchParams.get('page') || '1', 10) - 1;
    const urlLimit = parseInt(searchParams.get('limit') || '5', 10);
    const urlSearch = searchParams.get('search') || '';

    const table = useTable({ defaultRowsPerPage: urlLimit, defaultCurrentPage: urlPage });
    const [searchTerm, setSearchTerm] = useState(urlSearch);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(urlSearch);
    const isFetchingData = useRef(false);
    
    const filters = useSetState({ searchTerm: urlSearch });
    const confirm = useBoolean();
    const confirmSync = useBoolean();
    const userRole = useUserRole();
    const [selectedRows, setSelectedRows] = useState([]);
    const [loading, setLoading] = useState(false);

    const { fetchData, deleteAllItems } = useFetchData();
    const dispatch = useDispatch();
    const _ledger = useSelector((state) => state.accounting?.ledger || []);
    const pagination = useSelector((state) => state.accounting?.ledgerPagination || { total: 0, page: 1, limit: 10, totalPages: 0 });
    const [tableData, setTableData] = useState(_ledger);

    const TABLE_HEAD = [
        { id: 'party', label: 'Party' },
        { id: 'alias', label: 'Alias', align: 'center' },
        { id: 'openingBalance', label: 'Opening Balance', align: 'center' },
        { id: 'closingBalance', label: 'Closing Balance', align: 'center' },
        { id: 'totalDebitAmount', label: 'Total Debit Amount', align: 'center' },
        { id: 'totalCreditAmount', label: 'Total Credit Amount', align: 'center' },
        { id: 'actions', label: 'Actions' }
    ];

    //----------------------------------------------------------------------------------------------------
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== debouncedSearchTerm) {
                setDebouncedSearchTerm(searchTerm);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, debouncedSearchTerm]);

    useEffect(() => {
        setTableData(_ledger);
    }, [_ledger]);

    useEffect(() => {
        if (isFetchingData.current) return;

        const params = new URLSearchParams();
        params.set('page', (table.page + 1).toString());
        params.set('limit', table.rowsPerPage.toString());
        if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
        setSearchParams(params, { replace: true });

        isFetchingData.current = true;
        fetchData(table.page + 1, table.rowsPerPage, debouncedSearchTerm)
            .finally(() => { isFetchingData.current = false; });
    }, [table.page, table.rowsPerPage, debouncedSearchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSelectRow = useCallback((id) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    }, []);
    //----------------------------------------------------------------------------------------------------

    const canReset = !!searchTerm;
    const notFound = !tableData.length;
    //----------------------------------------------------

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

    const handleViewRow = useCallback((id) => id, []);

    const handleSyncAPI = async () => {
        setLoading(true);
        try {
            const result = await dispatch(syncLedger());
            // If sync was successful or timed out (but still processing), wait a bit before refreshing
            if (result) {
                // Wait 2 seconds before refreshing to allow backend to process
                await new Promise(resolve => setTimeout(resolve, 2000));
                await fetchData(table.page + 1, table.rowsPerPage, debouncedSearchTerm);
            } else {
                // If sync failed, still try to refresh data in case it was partially processed
                setTimeout(async () => {
                    await fetchData(table.page + 1, table.rowsPerPage, debouncedSearchTerm);
                }, 3000);
            }
        } catch (error) {
            console.error('Error syncing ledger:', error);
            // Even on error, try to refresh data after a delay
            setTimeout(async () => {
                await fetchData(table.page + 1, table.rowsPerPage, debouncedSearchTerm);
            }, 3000);
        } finally {
            setLoading(false);
            confirmSync.onFalse();
        }
    };

    //---------------------------------------------------------
    return (
        <div>
            <DashboardContent maxWidth="2xl">
                <CustomBreadcrumbs
                    heading="List"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Orders', href: paths?.dashboard?.order?.root },
                        { name: 'List' },
                    ]}
                    sx={{ mb: { xs: 3, md: 5 } }}

                    action={
                        userRole === 'Admin' && ( // Only show the button for Vendor role
                            <Button
                                onClick={confirmSync.onTrue} // Open the sync confirmation dialog
                                variant="contained"
                                startIcon={<Iconify icon="eva:sync-fill" />}
                                disabled={loading}
                            >
                                {loading ? 'Syncing...' : 'Sync Data'}
                            </Button>
                        )
                    }
                />

                <Card>

                    <LedgerTableToolbar
                        filters={filters}
                        onResetPage={table.onResetPage}
                        onSearchChange={handleSearchChange}
                        data={tableData}
                    />


                    {canReset && (
                        <LedgerTableFiltersResult
                            filters={filters}
                            totalResults={pagination.total}
                            onResetPage={table.onResetPage}
                            onClearSearch={handleClearSearch}
                            sx={{ p: 2.5, pt: 0 }}
                        />
                    )}
                    <Box sx={{ position: 'relative' }}>
                        <TableLoaderOverlay actionType={LEDGER_LIST} />
                        <TableSelectedAction
                            dense={table.dense}
                            numSelected={selectedRows.length}
                            rowCount={tableData.length}
                            onSelectAllRows={(checked) => setSelectedRows(checked ? tableData.map(row => row.id) : [])}

                            // action={
                            //     <Tooltip title="Delete">
                            //         <IconButton color="primary" onClick={confirm.onTrue}>
                            //             <Iconify icon="solar:trash-bin-trash-bold" />
                            //         </IconButton>
                            //     </Tooltip>
                            // }
                        />

                        <Scrollbar sx={{ minHeight: 444 }}>
                            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                                <TableHeadCustom
                                    order={table.order}
                                    orderBy={table.orderBy}
                                    headLabel={TABLE_HEAD}
                                    rowCount={pagination.total}
                                    numSelected={selectedRows.length}
                                    onSort={table.onSort}
                                    onSelectAllRows={(checked) =>
                                        setSelectedRows(checked ? tableData.map((row) => row.id) : [])
                                    }
                                />

                                <TableBody>
                                    {tableData.map((row) => (
                                            <LedgerTableRow
                                                key={row.id}
                                                row={row}
                                                selected={selectedRows.includes(row.id)}
                                                onSelectRow={() => handleSelectRow(row.id)}
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
                onClose={confirmSync.onFalse}
                content={
                    <Box>
                        <Typography gutterBottom>Are you sure you want to sync?</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            This action will update the data and may take a few moments.
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

        </div>
    );
}


