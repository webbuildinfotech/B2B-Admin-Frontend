import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import { paths } from 'src/routes/paths';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { fIsAfter } from 'src/utils/format-time';
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

import { OrderTableRow } from './table/order-table-row';
import { OrderTableToolbar } from '../order-table-toolbar';
import { OrderTableFiltersResult } from './table/order-table-filters-result';
import { ORDER_STATUS_OPTIONS } from 'src/_mock/_order';
import { useDispatch, useSelector } from 'react-redux';
import { useFetchOrderData } from '../components/fetch-order';
import useUserRole from 'src/layouts/components/user-role';
import { syncOrder } from 'src/store/action/orderActions';
import { Typography } from '@mui/material';
import { TableLoaderOverlay } from 'src/components/loader/table-loader';
import { ORDER_LIST } from 'src/store/constants/actionTypes';
// ----------------------------------------------------------------------

export function OrderListView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlPage = parseInt(searchParams.get('page') || '1', 10) - 1;
  const urlLimit = parseInt(searchParams.get('limit') || '5', 10);
  const urlSearch = searchParams.get('search') || '';
  const urlStatus = searchParams.get('status') || 'all';
  const urlStartDate = searchParams.get('startDate') || null;
  const urlEndDate = searchParams.get('endDate') || null;

  const table = useTable({ defaultRowsPerPage: urlLimit, defaultCurrentPage: urlPage });
  const confirm = useBoolean();
  const confirmSync = useBoolean();
  const userRole = useUserRole();
  const [selectedRows, setSelectedRows] = useState([]);
  const { fetchData, fetchDeleteData, deleteAllItems, fetchStatusCounts } = useFetchOrderData();
  const dispatch = useDispatch();
  const [deleting, setDeleting] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(urlSearch);
  const isFetchingData = useRef(false);
  const [statusCounts, setStatusCounts] = useState({ all: 0, pending: 0, completed: 0, cancelled: 0 });

  // Handle both array (admin) and object (vendor) response structures
  const orderState = useSelector((state) => state.order?.order);
  const _orders = Array.isArray(orderState) 
    ? orderState 
    : (orderState?.orders || []);
  const pagination = useSelector((state) => state.order?.orderPagination || { total: 0, page: 1, limit: 5, totalPages: 0 });
  
  // For vendors, pagination is handled client-side since backend returns all orders
  const isVendor = userRole === 'Vendor';
  const totalOrders = isVendor ? _orders.length : pagination.total;
  
  // Slice data for vendor pagination (client-side)
  const paginatedData = useMemo(() => {
    if (isVendor) {
      const start = table.page * table.rowsPerPage;
      const end = start + table.rowsPerPage;
      return _orders.slice(start, end);
    }
    return _orders; // Admin gets paginated data from backend
  }, [isVendor, _orders, table.page, table.rowsPerPage]);
  
  const [tableData, setTableData] = useState(paginatedData);
  
  const filters = useSetState({
    name: urlSearch,
    status: urlStatus,
    startDate: urlStartDate ? new Date(urlStartDate) : null,
    endDate: urlEndDate ? new Date(urlEndDate) : null,
  });

  const dateError = fIsAfter(filters.state.startDate, filters.state.endDate);
  
  // Use status counts from backend instead of tableData
  const STATUS_OPTIONS = [
    { value: 'all', label: 'All', count: statusCounts.all },
    { value: 'pending', label: 'Pending', count: statusCounts.pending },
    { value: 'completed', label: 'Completed', count: statusCounts.completed },
    { value: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
  ];
  //-----------------------------------------------------------------------------------------------------

  const TABLE_HEAD = [
    { id: 'orderNo', label: 'Order No', align: 'center', width: 120 }, // Always present
    ...(userRole === "Admin"
      ? [
        { id: 'name', label: 'Customer' },
      ]
      : []),
    { id: 'stdPkg', label: 'Standard Packages', align: 'center' }, // New column for discount
    { id: 'noOfPkg', label: 'No Of Packages', align: 'center' }, // New column for discount
    { id: 'totalQuantity', label: 'Quantity', align: 'center' },
    { id: 'discount', label: 'Discount (%)', align: 'center' }, // New column for discount
    { id: 'finalAmount', label: 'Final Amount', align: 'center' }, // New column for amount after discount  
    { id: 'delivery', label: 'Delivery Type' },
    { id: 'createdAt', label: 'Order Date' },
    { id: 'status', label: 'Status' },
    { id: 'actions', label: 'Actions', align: 'center' },

  ];

  //----------------------------------------------------------------------------------------------------
  // Fetch status counts on mount
  useEffect(() => {
    fetchStatusCounts().then(setStatusCounts);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== debouncedSearchTerm) {
        setDebouncedSearchTerm(searchTerm);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  useEffect(() => {
    setTableData(paginatedData);
  }, [paginatedData]);

  // Unified effect for fetching data
  useEffect(() => {
    if (isFetchingData.current) return;

    // For vendors, don't send pagination params (they get all orders at once)
    // For admin, send pagination params
    const params = new URLSearchParams();
    if (!isVendor) {
      params.set('page', (table.page + 1).toString());
      params.set('limit', table.rowsPerPage.toString());
    }
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    if (filters.state.status !== 'all') params.set('status', filters.state.status);
    if (filters.state.startDate) params.set('startDate', filters.state.startDate.toISOString());
    if (filters.state.endDate) params.set('endDate', filters.state.endDate.toISOString());
    setSearchParams(params, { replace: true });

    isFetchingData.current = true;
    const startDate = filters.state.startDate ? filters.state.startDate.toISOString() : null;
    const endDate = filters.state.endDate ? filters.state.endDate.toISOString() : null;
    
    // For vendors, fetch without pagination (null/undefined for page/limit)
    // For admin, send pagination params
    const page = isVendor ? undefined : (table.page + 1);
    const limit = isVendor ? undefined : table.rowsPerPage;
    
    fetchData(page, limit, debouncedSearchTerm, filters.state.status, startDate, endDate)
      .finally(() => { isFetchingData.current = false; });
  }, [table.page, table.rowsPerPage, debouncedSearchTerm, filters.state.status, filters.state.startDate, filters.state.endDate, isVendor]); // eslint-disable-line react-hooks/exhaustive-deps
  //----------------------------------------------------------------------------------------------------

  const handleSelectRow = useCallback((id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    filters.setState({ name: value });
    table.onResetPage();
  }, [filters, table]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    filters.setState({ name: '' });
    table.onResetPage();
  }, [filters, table]);

  const handleClearAll = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    filters.setState({
      name: '',
      status: 'all',
      startDate: null,
      endDate: null,
    });
    table.onResetPage();
  }, [filters, table]);

  const handleDeleteSelectedRows = useCallback(async () => {
    setDeleting(true);
    try {
      const success = await deleteAllItems(selectedRows);
      if (success) {
        setSelectedRows([]);
        const startDate = filters.state.startDate ? filters.state.startDate.toISOString() : null;
        const endDate = filters.state.endDate ? filters.state.endDate.toISOString() : null;
        await fetchData(table.page + 1, table.rowsPerPage, debouncedSearchTerm, filters.state.status, startDate, endDate);
        confirm.onFalse();
      }
    } catch (error) {
      console.error("Error deleting selected rows:", error);
    } finally {
      setDeleting(false);
    }
  }, [selectedRows, fetchData, deleteAllItems, confirm, table.page, table.rowsPerPage, debouncedSearchTerm, filters.state.status, filters.state.startDate, filters.state.endDate]);

  //----------------------------------------------------------------------------------------------------
  const canReset =
    !!debouncedSearchTerm ||
    filters.state.status !== 'all' ||
    (!!filters.state.startDate && !!filters.state.endDate);

  const notFound = !tableData.length;
  //----------------------------------------------------
  const handleDeleteRow = useCallback(async (id) => {
    const success = await fetchDeleteData(id);
    if (success) {
      const startDate = filters.state.startDate ? filters.state.startDate.toISOString() : null;
      const endDate = filters.state.endDate ? filters.state.endDate.toISOString() : null;
      await fetchData(table.page + 1, table.rowsPerPage, debouncedSearchTerm, filters.state.status, startDate, endDate);
    }
  }, [fetchDeleteData, fetchData, table.page, table.rowsPerPage, debouncedSearchTerm, filters.state.status, filters.state.startDate, filters.state.endDate]);

  const handleViewRow = useCallback((id) => id, []);

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      filters.setState({ status: newValue });
    },
    [filters, table]
  );

  const handleSyncAPI = async () => {
    setSyncLoading(true);
    try {
      await dispatch(syncOrder());
      const startDate = filters.state.startDate ? filters.state.startDate.toISOString() : null;
      const endDate = filters.state.endDate ? filters.state.endDate.toISOString() : null;
      await fetchData(table.page + 1, table.rowsPerPage, debouncedSearchTerm, filters.state.status, startDate, endDate);
    } catch (error) {
      console.error('Error syncing orders:', error);
    } finally {
      setSyncLoading(false);
      confirmSync.onFalse();
    }
  };

  // Refresh callback to maintain current pagination and filters after status update
  const handleRefreshAfterStatusUpdate = useCallback(async () => {
    const startDate = filters.state.startDate ? filters.state.startDate.toISOString() : null;
    const endDate = filters.state.endDate ? filters.state.endDate.toISOString() : null;
    await fetchData(table.page + 1, table.rowsPerPage, debouncedSearchTerm, filters.state.status, startDate, endDate);
    // Also refresh status counts
    const counts = await fetchStatusCounts();
    if (counts) setStatusCounts(counts);
  }, [fetchData, fetchStatusCounts, table.page, table.rowsPerPage, debouncedSearchTerm, filters.state.status, filters.state.startDate, filters.state.endDate]);

  //--------------------------------------------------
  return (
    <div>
      <DashboardContent maxWidth="2xl">
        <CustomBreadcrumbs
          heading="Order Reports"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Orders', href: paths?.orders.root },
            { name: 'List' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
          action={
            userRole === 'Admin' && (
              <Button
                onClick={confirmSync.onTrue}
                variant="contained"
                startIcon={<Iconify icon="eva:sync-fill" />}
                disabled={syncLoading}
              >
                {syncLoading ? 'Syncing...' : 'Sync Orders'}
              </Button>
            )
          }
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
                    variant={
                      ((tab.value === 'all' || tab.value === filters.state.status) && 'filled') ||
                      'soft'
                    }
                    color={
                      (tab.value === 'completed' && 'success') ||
                      (tab.value === 'pending' && 'warning') ||
                      (tab.value === 'cancelled' && 'error') ||
                      'default'
                    }
                  >
                    {tab.count || 0}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <OrderTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            dateError={dateError}
            data={tableData}
            onSearchChange={handleSearchChange}
            searchTerm={searchTerm}
          />

          {canReset && (
            <OrderTableFiltersResult
              filters={filters}
              totalResults={pagination.total}
              onResetPage={table.onResetPage}
              onClearSearch={handleClearSearch}
              onClearAll={handleClearAll}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <Box sx={{ position: 'relative' }}>
            <TableLoaderOverlay actionType={ORDER_LIST} />
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

            <Scrollbar sx={{ minHeight: 444 }}>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={selectedRows.length}

                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    setSelectedRows(checked ? tableData.map((row) => row.id) : [])
                  }
                />

                <TableBody>
                  {tableData.map((row) => (
                    <OrderTableRow
                      key={row.id}
                      row={row}
                      selected={selectedRows.includes(row.id)}
                      onSelectRow={() => handleSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onViewRow={() => handleViewRow(row.id)}
                      onStatusUpdate={handleRefreshAfterStatusUpdate}
                    />
                  ))}

                  <TableEmptyRows
                    height={table.dense ? 56 : 56 + 20}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, totalOrders)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={totalOrders}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </DashboardContent>

      <ConfirmDialog
        open={confirmSync.value}
        onClose={confirmSync.onFalse}
        content={
          <Box>
            <Typography gutterBottom>Are you sure you want to sync orders with Tally?</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              This will post pending invoices to Tally. It may take a few moments.
            </Typography>
          </Box>
        }
        action={
          <Button
            onClick={handleSyncAPI}
            variant="contained"
            color="primary"
            disabled={syncLoading}
          >
            {syncLoading ? 'Syncing...' : 'Confirm Sync'}
          </Button>
        }
      />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Orders?"
        content={
          <Box>
            <Typography gutterBottom>Are you sure you want to delete the selected Orders?</Typography>
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
    </div>
  );
}


