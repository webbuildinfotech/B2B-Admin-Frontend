import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import { paths } from 'src/routes/paths';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';
import { Label } from 'src/components/label';
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

import { LogTableRow } from './table/log-table-row';
import { LogTableToolbar } from './table/log-table-toolbar';
import { LogTableFiltersResult } from './table/log-table-filters-result';
import { useDispatch, useSelector } from 'react-redux';
import { useFetchOrderData } from '../components/fetch-logs';
import useUserRole from 'src/layouts/components/user-role';
import { syncOrder } from 'src/store/action/orderActions';
import { Typography } from '@mui/material';
import { TableLoaderOverlay } from 'src/components/loader/table-loader';
import { LOGS_LIST } from 'src/store/constants/actionTypes';

// ----------------------------------------------------------------------
const TABLE_HEAD = [
    { id: 'sync_type', label: 'SyncType' },
    { id: 'created_at', label: 'Log Sync Date' },
    { id: 'status', label: 'Status' }
];

const STATUS_COLORS = {
    success: 'success',
    fail: 'error',
    stocks: 'warning',
    items: 'info',
    orders: 'info',
    vendors: 'primary',
    ledger: 'secondary',
    receivable: 'default',
    all: 'default',
    default: 'default',
};

export const LOGS_STATUS_OPTIONS = [
    { value: 'stocks', label: 'Stocks' },
    { value: 'items', label: 'Products' },
    { value: 'orders', label: 'Orders' },
    { value: 'vendors', label: 'Vendors' },
    { value: 'ledger', label: 'Ledger' },
    { value: 'receivable', label: 'Receivable' },
    { value: 'success', label: 'Success' },
    { value: 'fail', label: 'Fails' },
];

// ----------------------------------------------------------------------

export function LogListView() {
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
        status: urlStatus
    });

    const confirm = useBoolean();
    const confirmSync = useBoolean();
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [statusCounts, setStatusCounts] = useState({ 
        all: 0, 
        stocks: 0, 
        items: 0, 
        orders: 0, 
        vendors: 0, 
        ledger: 0, 
        receivable: 0, 
        success: 0, 
        fail: 0 
    });

    const { fetchData, fetchStatusCounts } = useFetchOrderData();
    const dispatch = useDispatch();
    const _logs = useSelector((state) => state.logs?.logs || []);
    const pagination = useSelector((state) => state.logs?.logsPagination || { 
        total: 0, 
        page: 1, 
        limit: 10, 
        totalPages: 0 
    });
    // Use _logs directly instead of separate state to prevent blank screen
    const tableData = Array.isArray(_logs) ? _logs : [];

    // Use status counts from backend for tabs
    const STATUS_OPTIONS = [
        { value: 'all', label: 'All', count: statusCounts.all },
        { value: 'stocks', label: 'Stocks', count: statusCounts.stocks },
        { value: 'items', label: 'Products', count: statusCounts.items },
        { value: 'orders', label: 'Orders', count: statusCounts.orders },
        { value: 'vendors', label: 'Vendors', count: statusCounts.vendors },
        { value: 'ledger', label: 'Ledger', count: statusCounts.ledger },
        { value: 'receivable', label: 'Receivable', count: statusCounts.receivable },
        { value: 'success', label: 'Success', count: statusCounts.success },
        { value: 'fail', label: 'Fails', count: statusCounts.fail },
    ];

    //----------------------------------------------------------------------------------------------------
    // Fetch status counts on mount
    useEffect(() => {
        fetchStatusCounts().then(setStatusCounts);
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

    // Apply sorting only (no client-side filtering or pagination)
    const dataFiltered = [...tableData].sort(getComparator(table.order, table.orderBy));

    //----------------------------------------------------------------------------------------------------

    const canReset = !!filters.state.searchTerm || filters.state.status !== 'all';

    const notFound = !tableData.length;
    //----------------------------------------------------

    const handleFilterStatus = useCallback(
        (event, newValue) => {
            table.onResetPage();
            filters.setState({ status: newValue });
        },
        [filters, table]
    );

    const handleSearchChange = useCallback((value) => {
        setSearchTerm(value);
        filters.setState({ searchTerm: value });
        table.onResetPage();
    }, [filters, table]);

    const handleClearSearch = useCallback(() => {
        setSearchTerm('');
        setDebouncedSearchTerm('');
        filters.setState({ searchTerm: '' });
        table.onResetPage();
    }, [filters, table]);

    const handleClearAll = useCallback(() => {
        setSearchTerm('');
        setDebouncedSearchTerm('');
        filters.setState({ searchTerm: '', status: 'all' });
        table.onResetPage();
    }, [filters, table]);

    const handleSyncAPI = async () => {
        setLoading(true);
        try {
            await dispatch(syncOrder());
            // Refresh data after sync
            await fetchData(table.page + 1, table.rowsPerPage, debouncedSearchTerm, filters.state.status);
            // Refresh status counts after sync
            fetchStatusCounts().then(setStatusCounts);
        } catch (error) {
            console.error('Error syncing order invoice:', error);
        } finally {
            setLoading(false);
            confirmSync.onFalse();
        }
    };

    //--------------------------------------------------
    return (
        <div>
            <DashboardContent maxWidth="2xl">
                <CustomBreadcrumbs
                    heading="List"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Logs', href: paths?.dashboard?.root },
                        { name: 'List' },
                    ]}
                    sx={{ mb: { xs: 3, md: 5 } }}
                />
                <Card>
                    <Tabs
                        value={filters.state.status}
                        onChange={handleFilterStatus}
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
                                        color={STATUS_COLORS[tab.value] || STATUS_COLORS.default}
                                    >
                                        {tab.count}
                                    </Label>
                                }
                            />
                        ))}
                    </Tabs>

                    <LogTableToolbar 
                        filters={filters} 
                        onResetPage={table.onResetPage}
                        onSearchChange={handleSearchChange}
                    />

                    {canReset && (
                        <LogTableFiltersResult
                            filters={filters}
                            totalResults={pagination.total}
                            onResetPage={table.onResetPage}
                            onClearSearch={handleClearSearch}
                            onClearAll={handleClearAll}
                            sx={{ p: 2.5, pt: 0 }}
                        />
                    )}

                    <Box sx={{ position: 'relative' }} mt={3}>
                        <TableLoaderOverlay actionType={LOGS_LIST} />
                        <TableSelectedAction
                            dense={table.dense}
                            numSelected={selectedRows.length}
                            rowCount={tableData.length}
                            onSelectAllRows={(checked) => setSelectedRows(checked ? tableData.map(row => row.id) : [])}
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
                                    {dataFiltered.map((row) => (
                                        <LogTableRow
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
                        count={pagination.total || 0}
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
                        <Typography gutterBottom>Are you sure you want to sync the Invoices?</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            This action will update the Invoices data and may take a few moments.
                        </Typography>
                    </Box>
                }
                action={
                    <Button
                        onClick={handleSyncAPI}
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? 'Syncing...' : 'Confirm Sync'}
                    </Button>
                }
            />
        </div>
    );
}
