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
import { ProductTableFiltersResult } from './table/product-table-filters-result';
import { useDispatch, useSelector } from 'react-redux';
import { syncProduct, deleteItem, deleteAllItem } from 'src/store/action/productActions';
import { Typography } from '@mui/material';
import { TABLE_PRODUCT_HEAD } from '../../../components/constants';
import { applyFilter } from '../utils';
import { ProductTableRow } from './table/product-table-row';
import { ProductTableToolbar } from './table/product-table-toolbar';
import { useFetchProductData } from '../components/fetch-product';
import { TableLoaderOverlay } from 'src/components/loader/table-loader';
import { PRODUCT_LIST } from 'src/store/constants/actionTypes';
// ----------------------------------------------------------------------


export function ProductListView() {
    // Read from URL params
    const [searchParams, setSearchParams] = useSearchParams();
    const urlPage = parseInt(searchParams.get('page') || '1', 10) - 1;
    const urlLimit = parseInt(searchParams.get('limit') || '5', 10);
    const urlSearch = searchParams.get('search') || '';
    const urlSubGroup1 = searchParams.getAll('subGroup1');
    const urlSubGroup2 = searchParams.getAll('subGroup2');

    const table = useTable({ 
        defaultRowsPerPage: urlLimit, 
        defaultCurrentPage: urlPage 
    });
    
    const [searchTerm, setSearchTerm] = useState(urlSearch);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(urlSearch);
    const isFetchingData = useRef(false);

    
    const filters = useSetState({ 
        searchTerm: urlSearch,
        subGroup1: urlSubGroup1, 
        subGroup2: urlSubGroup2, 
        status: 'all' 
    });

    const confirm = useBoolean();
    const confirmSync = useBoolean();
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [deleting, setDeleting] = useState(false);
    const [subGroup1Options, setSubGroup1Options] = useState([]);
    const [subGroup2Options, setSubGroup2Options] = useState([]);

    const { fetchData, fetchAllSubGroup1Options, fetchSubGroup2Options, fetchDeleteItem, deleteAllItems } = useFetchProductData();
    const dispatch = useDispatch();
    const _productList = useSelector((state) => state.product?.product || []);
    const pagination = useSelector((state) => state.product?.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 });
    const [tableData, setTableData] = useState(_productList);

    //----------------------------------------------------------------------------------------------------
    // Fetch options on mount only
    useEffect(() => {
        fetchAllSubGroup1Options().then(setSubGroup1Options);
        if (urlSubGroup1.length > 0) {
            fetchSubGroup2Options(urlSubGroup1).then(setSubGroup2Options);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Update subGroup2 when subGroup1 changes
    useEffect(() => {
        const subGroup1 = filters.state.subGroup1 || [];
        if (subGroup1.length > 0) {
            fetchSubGroup2Options(subGroup1).then(setSubGroup2Options);
        } else {
            setSubGroup2Options([]);
        }
    }, [filters.state.subGroup1]); // eslint-disable-line react-hooks/exhaustive-deps

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
        setTableData(_productList);
    }, [_productList]);

    // Single effect to fetch data and update URL
    useEffect(() => {
        if (isFetchingData.current) return;

        const subGroup1 = filters.state.subGroup1 || [];
        const subGroup2 = filters.state.subGroup2 || [];

        // Update URL
        const params = new URLSearchParams();
        params.set('page', (table.page + 1).toString());
        params.set('limit', table.rowsPerPage.toString());
        if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
        subGroup1.forEach(item => params.append('subGroup1', item));
        subGroup2.forEach(item => params.append('subGroup2', item));
        setSearchParams(params, { replace: true });

        // Fetch data
        isFetchingData.current = true;
        fetchData(table.page + 1, table.rowsPerPage, debouncedSearchTerm, subGroup1, subGroup2)
            .finally(() => { isFetchingData.current = false; });
            
    }, [table.page, table.rowsPerPage, debouncedSearchTerm, filters.state.subGroup1, filters.state.subGroup2]); // eslint-disable-line react-hooks/exhaustive-deps
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
            await Promise.all(selectedRows.map((id) => dispatch(deleteItem(id))));
            
            setSelectedRows([]);
            
            // Check if current page will be empty after deletion
            const currentPage = table.page + 1;
            const itemsOnCurrentPage = tableData.length;
            
            // If all items on current page are deleted and not page 1, go to previous page
            let targetPage = currentPage;
            if (deletedCount >= itemsOnCurrentPage && currentPage > 1) {
                targetPage = currentPage - 1;
            }
            
            const subGroup1 = Array.isArray(filters.state.subGroup1) ? filters.state.subGroup1 : [];
            const subGroup2 = Array.isArray(filters.state.subGroup2) ? filters.state.subGroup2 : [];
            
            // Prevent main useEffect from interfering
            isFetchingData.current = true;
            
            // Fetch data with correct pagination
            await fetchData(targetPage, table.rowsPerPage, debouncedSearchTerm, subGroup1, subGroup2);
            
            // Update table page after fetch (if page changed)
            if (targetPage !== currentPage) {
                table.onChangePage(null, targetPage - 1); // Update table page (0-indexed)
            }
            
            isFetchingData.current = false;
            confirm.onFalse();
        } catch (error) {
            console.error("Error deleting selected rows:", error);
            isFetchingData.current = false;
        } finally {
            setDeleting(false);
        }
    }, [selectedRows, confirm, table.page, table.rowsPerPage, table.onChangePage, debouncedSearchTerm, filters.state.subGroup1, filters.state.subGroup2, tableData.length, fetchData, dispatch]);
    //----------------------------------------------------------------------------------------------------
    // Clear specific filter handlers
    const onClearSubGroup1 = useCallback((subGroup1Value) => {
        const updated = filters.state.subGroup1.filter((sub1) => sub1 !== subGroup1Value);
        filters.setState({ subGroup1: updated });
    }, [filters]);

    const onClearSubGroup2 = useCallback((subGroup2Value) => {
        const updated = filters.state.subGroup2.filter((sub2) => sub2 !== subGroup2Value);
        filters.setState({ subGroup2: updated });
    }, [filters]);





    //-----------------------------------------------------------------
    // Check if any filters/search active (with safe checks)
    const canReset = !!searchTerm || 
                     !!(filters.state.subGroup1 && filters.state.subGroup1.length > 0) || 
                     !!(filters.state.subGroup2 && filters.state.subGroup2.length > 0) || 
                     filters.state.status !== 'all';
    
    const notFound = !tableData.length;

    // Clear handlers - use hook's functions + product-specific cleanup
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
            subGroup1: [],
            subGroup2: [],
            status: 'all'
        });
        setSubGroup2Options([]);
        table.onResetPage();
    }, [filters, table]);

    //----------------------------------------------------------------------------------------------------


    const handleDeleteRow = useCallback(async (id) => {
        const success = await dispatch(deleteItem(id));
        if (success) {
            // Check if current page will be empty after deletion
            const currentPage = table.page + 1;
            const itemsOnCurrentPage = tableData.length;
            
            // If this is the last item on the page and not page 1, go to previous page
            let targetPage = currentPage;
            if (itemsOnCurrentPage === 1 && currentPage > 1) {
                targetPage = currentPage - 1;
            }
            
            const subGroup1 = Array.isArray(filters.state.subGroup1) ? filters.state.subGroup1 : [];
            const subGroup2 = Array.isArray(filters.state.subGroup2) ? filters.state.subGroup2 : [];
            
            // Prevent main useEffect from interfering
            isFetchingData.current = true;
            
            // Fetch data with correct pagination
            await fetchData(targetPage, table.rowsPerPage, debouncedSearchTerm, subGroup1, subGroup2);
            
            // Update table page after fetch (if page changed)
            if (targetPage !== currentPage) {
                table.onChangePage(null, targetPage - 1); // Update table page (0-indexed)
            }
            
            isFetchingData.current = false;
        }
    }, [dispatch, fetchData, table.page, table.rowsPerPage, table.onChangePage, debouncedSearchTerm, filters.state.subGroup1, filters.state.subGroup2, tableData.length]);

    const handleEditRow = useCallback((id) => id, []);

    const handleViewRow = useCallback((id) => id, []);

    const handleFilterStatus = useCallback(
        (event, newValue) => {
            table.onResetPage();
            filters.setState({ status: newValue });
        },
        [filters, table]
    );

    // Function to trigger sync API after confirmation
    const handleSyncAPI = useCallback(async () => {
        setLoading(true); // Set loading to true while syncing
        try {
            const res = await dispatch(syncProduct()); // Call the sync API
            if (res) {
                const subGroup1 = Array.isArray(filters.state.subGroup1) ? filters.state.subGroup1 : [];
                const subGroup2 = Array.isArray(filters.state.subGroup2) ? filters.state.subGroup2 : [];
                fetchData(table.page + 1, table.rowsPerPage, debouncedSearchTerm, subGroup1, subGroup2); // Fetch paginated data after syncing
            }
        } catch (error) {
            setLoading(false); // Reset loading state
            console.error("Failed to sync products", error);
        } finally {
            setLoading(false); // Reset loading state
            confirmSync.onFalse(); // Close the confirmation dialog
        }
    }, [dispatch, fetchData, confirmSync, table.page, table.rowsPerPage, debouncedSearchTerm, filters.state.subGroup1, filters.state.subGroup2]);

    //----------------------------------------------------------------------------------------------------

    return (
        <>

            <DashboardContent maxWidth="2xl">
                <CustomBreadcrumbs
                    heading="List"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Products', href: paths?.dashboard?.product?.root },
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
                            {loading ? 'Syncing...' : 'Sync Products'}
                        </Button>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <Card>
                    <ProductTableToolbar
                        filters={filters}
                        onResetPage={table.onResetPage}
                        onSearchChange={handleSearchChange}
                        subGroup1Options={subGroup1Options}
                        subGroup2Options={subGroup2Options}
                    />
                    {canReset && (
                        <ProductTableFiltersResult
                            filters={filters}
                            totalResults={pagination.total}
                            onResetPage={table.onResetPage}
                            onClearAll={handleClearAll}
                            onClearSearch={handleClearSearch}
                            onClearSubGroup1={onClearSubGroup1} // Pass clear subGroup1 callback
                            onClearSubGroup2={onClearSubGroup2} // Pass clear subGroup2 callback
                            sx={{ p: 2.5, pt: 0 }}
                        />
                    )}
               
                        <Box sx={{ position: 'relative' }}>
                            <TableLoaderOverlay actionType={PRODUCT_LIST} />
                            <TableSelectedAction
                                dense={table.dense}
                                numSelected={selectedRows.length}
                                rowCount={tableData.length}
                                onSelectAllRows={(checked) => setSelectedRows(checked ? tableData.map(row => row.id) : [])}
                                action={
                                    <Tooltip title="Delete Selected">
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
                                        headLabel={TABLE_PRODUCT_HEAD}
                                        rowCount={pagination.total}
                                        numSelected={selectedRows.length}
                                        onSort={table.onSort}
                                        onSelectAllRows={(checked) =>
                                            setSelectedRows(checked ? tableData.map((row) => row.id) : [])
                                        }
                                    />

                                    <TableBody>
                                        {tableData.map((row) => (
                                            <ProductTableRow
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
                        <Typography gutterBottom>Are you sure you want to sync the products?</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            This action will update the product data and may take a few moments.
                        </Typography>
                        {loading && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1 }}>
                                Please wait, the sync is in progress... (may take up to 20 seconds)
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
                title="Delete products?"
                content={
                    <Box>
                        <Typography gutterBottom>Are you sure you want to delete the selected products?</Typography>
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

