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
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import { toast } from 'src/components/snackbar';
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
import { useDispatch, useSelector } from 'react-redux';
import { Link, Typography } from '@mui/material';
import { applyFilter } from '../utils';

import { BannerTableToolbar } from './table/banner-table-toolbar';
import { BannerTableFiltersResult } from './table/banner-table-filter-result';
import { BannerTableRow } from './table/banner-table-row';
import { useFetchBannerData } from '../components/fetch-banner';
import { TABLE_BANNER_HEAD } from 'src/components/constants';
import { deleteMultipleBanner } from 'src/store/action/settingActions';

// ----------------------------------------------------------------------

export function BannerListView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlPage = parseInt(searchParams.get('page') || '1', 10) - 1;
  const urlLimit = parseInt(searchParams.get('limit') || '5', 10);
  const urlSearch = searchParams.get('search') || '';

  const table = useTable({ defaultRowsPerPage: urlLimit, defaultCurrentPage: urlPage });
  const router = useRouter();
  const confirm = useBoolean();
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [deleting, setDeleting] = useState(false);

  const { fetchBannerData, fetchDeleteBannerData } = useFetchBannerData();
  const dispatch = useDispatch();

  const bannerList = useSelector((state) => state.setting?.banner || []);
  const pagination = useSelector((state) => state.setting?.bannerPagination || { total: 0, page: 1, limit: 5, totalPages: 0 });
  const [tableData, setTableData] = useState(bannerList);
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(urlSearch);
  const isFetchingData = useRef(false);

  // Initialize filters state
  const filters = useSetState({ searchTerm: urlSearch, name: urlSearch });

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
    setTableData(bannerList);
  }, [bannerList]);

  // Unified effect for fetching data
  useEffect(() => {
    if (isFetchingData.current) return;

    const params = new URLSearchParams();
    params.set('page', (table.page + 1).toString());
    params.set('limit', table.rowsPerPage.toString());
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    setSearchParams(params, { replace: true });

    isFetchingData.current = true;
    fetchBannerData(table.page + 1, table.rowsPerPage, debouncedSearchTerm)
      .finally(() => { isFetchingData.current = false; });
  }, [table.page, table.rowsPerPage, debouncedSearchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  //----------------------------------------------------------------------------------------------------

  const handleSelectRow = useCallback((id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  }, []);

  // const handleDeleteSelectedRows = useCallback(() => {
  //     selectedRows.forEach((id) => fetchDeleteBannerData(id));
  //     setSelectedRows([]);
  //     fetchBannerData(); // Refresh data after deletion
  //     confirm.onFalse();
  // }, [selectedRows, fetchDeleteBannerData, fetchBannerData]);

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

  const handleDeleteSelectedRows = useCallback(async () => {
    setDeleting(true);
    try {
      await dispatch(deleteMultipleBanner(selectedRows));
      setSelectedRows([]);
      
      // Check if current page will be empty after deletion
      const currentPage = table.page + 1;
      const itemsOnCurrentPage = tableData.length;
      const deletedCount = selectedRows.length;
      
      // If all items on current page are deleted and not page 1, go to previous page
      let targetPage = currentPage;
      if (deletedCount >= itemsOnCurrentPage && currentPage > 1) {
        targetPage = currentPage - 1;
        table.onChangePage(null, targetPage - 1);
      }
      
      await fetchBannerData(targetPage, table.rowsPerPage, debouncedSearchTerm);
      confirm.onFalse();
    } catch (error) {
      console.error('Error deleting selected rows:', error);
    } finally {
      setDeleting(false);
    }
  }, [selectedRows, fetchBannerData, dispatch, confirm, table.page, table.rowsPerPage, table.onChangePage, debouncedSearchTerm, tableData.length]);

  //----------------------------------------------------------------------------------------------------

  const canReset = !!debouncedSearchTerm;
  const notFound = !tableData.length;

  const handleDeleteRow = useCallback(async (id) => {
    const success = await fetchDeleteBannerData(id);
    if (success) {
      // Check if current page will be empty after deletion
      const currentPage = table.page + 1;
      const itemsOnCurrentPage = tableData.length;
      
      // If this is the last item on the page and not page 1, go to previous page
      let targetPage = currentPage;
      if (itemsOnCurrentPage === 1 && currentPage > 1) {
        targetPage = currentPage - 1;
        table.onChangePage(null, targetPage - 1);
      }
      
      await fetchBannerData(targetPage, table.rowsPerPage, debouncedSearchTerm);
    }
  }, [fetchDeleteBannerData, fetchBannerData, table.page, table.rowsPerPage, table.onChangePage, debouncedSearchTerm, tableData.length]);

  const handleEditRow = useCallback((id) => id, []);

  const handleViewRow = useCallback((id) => id, []);

  return (
    <>
      <DashboardContent maxWidth="2xl">
        <CustomBreadcrumbs
          heading="Banner List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Banner', href: paths?.settings?.banner },
            { name: 'List' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              component={RouterLink}
              to="/settings/banner/create"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'none',
                },
              }}
            >
              Add Banner
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <BannerTableToolbar 
            filters={filters} 
            onResetPage={table.onResetPage}
            onSearchChange={handleSearchChange}
            searchTerm={searchTerm}
          />
          {canReset && (
            <BannerTableFiltersResult
              filters={filters}
              totalResults={pagination.total}
              onResetPage={table.onResetPage}
              onClearSearch={handleClearSearch}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <Box sx={{ position: 'relative' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={selectedRows.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                setSelectedRows(checked ? tableData.map((row) => row.id) : [])
              }
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
                  headLabel={TABLE_BANNER_HEAD}
                  rowCount={tableData.length}
                  numSelected={selectedRows.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    setSelectedRows(checked ? tableData.map((row) => row.id) : [])
                  }
                />

                <TableBody>
                  {tableData.map((row) => (
                    <BannerTableRow
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

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Banner?"
        content={
          <Box>
            <Typography gutterBottom>
              Are you sure you want to delete the selected banner?
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              This action cannot be undone.
            </Typography>
          </Box>
        }
        action={
          <Button
            onClick={handleDeleteSelectedRows}
            variant="contained"
            color="error"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        }
      />
    </>
  );
}
