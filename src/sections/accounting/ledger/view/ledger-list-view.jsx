
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
import { Autocomplete, Box as MuiBox, Stack, TextField, Typography } from '@mui/material';
import { applyFilter } from '../utils/filterUtils';
import { LedgerTableToolbar } from './ledger-table-toolbar';
import { useFetchData } from '../components/fetch-ledger';
import { LedgerTableFiltersResult } from './table/ledger-table-filters-result';
import { syncLedger } from 'src/store/action/accountingActions';
import {
    editSyncSetting,
    syncSettingList,
} from 'src/store/action/settingActions';
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
    const [syncStatus, setSyncStatus] = useState(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [savingDateRange, setSavingDateRange] = useState(false);

    const { fetchData, deleteAllItems } = useFetchData();
    const dispatch = useDispatch();
    const _ledger = useSelector((state) => state.accounting?.ledger || []);
    const syncSettings = useSelector((state) => state.setting?.syncData || []);
    const pagination = useSelector((state) => state.accounting?.ledgerPagination || { total: 0, page: 1, limit: 10, totalPages: 0 });
    const [tableData, setTableData] = useState(_ledger);
    const ledgerSyncSetting = syncSettings.find(
        (item) => item.moduleName === 'Ledger Statement'
    );
    const isDateRangePartial = (!!fromDate && !toDate) || (!fromDate && !!toDate);
    const canSaveDateRange = !!ledgerSyncSetting && !savingDateRange && !isDateRangePartial;

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

    useEffect(() => {
        dispatch(syncSettingList());
    }, [dispatch]);

    useEffect(() => {
        const formatDateForInput = (dateString) => {
            if (!dateString || dateString.length !== 8) return '';
            const year = dateString.substring(0, 4);
            const month = dateString.substring(4, 6);
            const day = dateString.substring(6, 8);
            return `${year}-${month}-${day}`;
        };

        if (ledgerSyncSetting) {
            setFromDate(formatDateForInput(ledgerSyncSetting.fromDate || ''));
            setToDate(formatDateForInput(ledgerSyncSetting.toDate || ''));
        }
    }, [ledgerSyncSetting]);

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

    const formatDateForAPI = useCallback((dateString) => {
        if (!dateString) return null;
        return dateString.replace(/-/g, '');
    }, []);

    const handleSaveDateRange = useCallback(async () => {
        if (!ledgerSyncSetting) return;
        setSavingDateRange(true);
        try {
            await dispatch(
                editSyncSetting(ledgerSyncSetting.id, {
                    moduleName: ledgerSyncSetting.moduleName,
                    isAutoSyncEnabled: ledgerSyncSetting.isAutoSyncEnabled,
                    isManualSyncEnabled: ledgerSyncSetting.isManualSyncEnabled,
                    fromDate: formatDateForAPI(fromDate),
                    toDate: formatDateForAPI(toDate),
                })
            );
            await dispatch(syncSettingList());
        } finally {
            setSavingDateRange(false);
        }
    }, [dispatch, formatDateForAPI, fromDate, toDate, ledgerSyncSetting]);

    const handleClearDateRange = useCallback(async () => {
        if (!ledgerSyncSetting) return;
        setSavingDateRange(true);
        try {
            setFromDate('');
            setToDate('');
            await dispatch(
                editSyncSetting(ledgerSyncSetting.id, {
                    moduleName: ledgerSyncSetting.moduleName,
                    isAutoSyncEnabled: ledgerSyncSetting.isAutoSyncEnabled,
                    isManualSyncEnabled: ledgerSyncSetting.isManualSyncEnabled,
                    fromDate: null,
                    toDate: null,
                })
            );
            await dispatch(syncSettingList());
        } finally {
            setSavingDateRange(false);
        }
    }, [dispatch, ledgerSyncSetting]);

    const handleSyncAPI = useCallback(async () => {
        setLoading(true);
        setSyncStatus(null);
        confirmSync.onFalse(); // Close dialog immediately

        try {
            // Pass status update callback and completion callback
            const result = await dispatch(
                syncLedger(
                    (status) => {
                        // Update sync status for UI display
                        setSyncStatus(status);

                        // If error status detected, stop loading immediately
                        if (status.status === 'error') {
                            setLoading(false);
                            setSyncStatus(null);
                        }
                    },
                    () => {
                        // Fetch data when sync completes (or fails)
                        fetchData(
                            table.page + 1,
                            table.rowsPerPage,
                            debouncedSearchTerm
                        );
                        setLoading(false);
                        setSyncStatus(null);

                        // If date range is saved/filled, auto clear after sync
                        const hasCustomRange =
                            !!ledgerSyncSetting?.fromDate ||
                            !!ledgerSyncSetting?.toDate ||
                            !!fromDate ||
                            !!toDate;
                        if (hasCustomRange) {
                            handleClearDateRange();
                        }
                    }
                )
            );

            // If sync returns false, it means there was an error
            if (result === false) {
                setLoading(false);
                setSyncStatus(null);
            }
        } catch (error) {
            console.error('Error syncing ledger:', error);
            setLoading(false);
            setSyncStatus(null);
        }
    }, [
        dispatch,
        fetchData,
        confirmSync,
        table.page,
        table.rowsPerPage,
        debouncedSearchTerm,
        ledgerSyncSetting,
        fromDate,
        toDate,
        handleClearDateRange,
    ]);

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
                />

                <Card>
                    {userRole === 'Admin' && (
                        <MuiBox sx={{ p: 2.5, pb: 1.5 }}>
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                spacing={1.25}
                                alignItems={{ xs: 'stretch', md: 'flex-end' }}
                            >
                                <MuiBox
                                    sx={{
                                        flex: 1,
                                        p: 1.5,
                                        borderRadius: 1.5,
                                        border: (theme) => `1px solid ${theme.palette.divider}`,
                                        bgcolor: 'background.paper',
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                                        Date Range (Optional)
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ display: 'block', mb: 1 }}
                                    >
                                        Leave blank to sync Financial Year (Apr–Mar). Saved range is used for next sync only and auto-cleared.
                                    </Typography>

                                    <Stack
                                        direction={{ xs: 'column', md: 'row' }}
                                        spacing={1}
                                        alignItems={{ xs: 'stretch', md: 'flex-end' }}
                                        sx={{ flexWrap: { md: 'nowrap' } }}
                                    >
                                        <TextField
                                            label="From"
                                            type="date"
                                            size="small"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                            sx={{ flex: 1, minWidth: { sm: 180 } }}
                                            error={isDateRangePartial}
                                        />
                                        <TextField
                                            label="To"
                                            type="date"
                                            size="small"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                            sx={{ flex: 1, minWidth: { sm: 180 } }}
                                            error={isDateRangePartial}
                                        />

                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                            justifyContent={{ xs: 'flex-end', md: 'flex-start' }}
                                            sx={{ flexShrink: 0, pt: { xs: 0.5, md: 0 } }}
                                        >
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={handleSaveDateRange}
                                                disabled={!canSaveDateRange}
                                                sx={{ height: 40, px: 2, whiteSpace: 'nowrap' }}
                                            >
                                                {savingDateRange ? 'Saving...' : 'Save'}
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="inherit"
                                                size="small"
                                                onClick={handleClearDateRange}
                                                disabled={savingDateRange || !ledgerSyncSetting}
                                                sx={{ height: 40, px: 2, whiteSpace: 'nowrap' }}
                                            >
                                                Clear
                                            </Button>
                                            <Button
                                                onClick={confirmSync.onTrue}
                                                variant="contained"
                                                startIcon={<Iconify icon="eva:sync-fill" />}
                                                disabled={loading}
                                                sx={{ height: 40, px: 2, whiteSpace: 'nowrap' }}
                                            >
                                                {loading
                                                    ? (syncStatus?.status === 'processing' && syncStatus?.totalRecords
                                                        ? `Syncing... ${syncStatus.processedRecords || 0}/${syncStatus.totalRecords}`
                                                        : 'Syncing...')
                                                    : 'Sync Data'}
                                            </Button>
                                        </Stack>
                                    </Stack>
                                    <Typography
                                        variant="caption"
                                        color={isDateRangePartial ? 'error.main' : 'text.secondary'}
                                        sx={{ display: 'block', mt: 0.75 }}
                                    >
                                        {isDateRangePartial
                                            ? 'Select both dates or press Clear.'
                                            : 'Tip: Save a range → Sync Data → range will auto-clear after sync.'}
                                    </Typography>
                                </MuiBox>
                            </Stack>
                        </MuiBox>
                    )}

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


