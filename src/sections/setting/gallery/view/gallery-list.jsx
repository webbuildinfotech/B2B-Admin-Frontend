import { useState, useCallback, useEffect } from 'react';
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
import { TABLE_GALLERY_HEAD } from 'src/components/constants';
import { useFetchData } from '../components/fetch';
import { GalleryTableToolbar } from './table/gallery-table-toolbar';
import { GalleryTableFiltersResult } from './table/gallery-table-filter-result';
import { GalleryTableRow } from './table/gallery-table-row';
import { deleteAllGalleryItem } from 'src/store/action/settingActions';

// ----------------------------------------------------------------------

export function GalleryList() {
  const table = useTable();
  const router = useRouter();
  const confirm = useBoolean();
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]); // Store selected row IDs

  const { fetchData, fetchDeleteData } = useFetchData();

  const dispatch = useDispatch();

  const galleryList = useSelector((state) => state.setting?.gallery || []);
  const [deleting, setDeleting] = useState(false); // Track delete operation

  const [tableData, setTableData] = useState(galleryList);

  // Initialize filters state
  const filters = useSetState({ searchTerm: '', name: '' });

  useEffect(() => {
    fetchData(); // Fetch banners when the component mounts
  }, []);

  useEffect(() => {
    setTableData(galleryList);
  }, [galleryList]);

  //----------------------------------------------------------------------------------------------------

  const handleSelectRow = useCallback((id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  }, []);

  // const handleDeleteSelectedRows = useCallback(() => {
  //     selectedRows.forEach((id) => fetchDeleteData(id));
  //     setSelectedRows([]);
  //     fetchData(); // Refresh data after deletion
  //     confirm.onFalse();
  // }, [selectedRows, fetchDeleteData, fetchData]);

  const handleDeleteSelectedRows = useCallback(async () => {
    setDeleting(true); // Start loading for delete operation
    try {
      await dispatch(deleteAllGalleryItem(selectedRows));
      setSelectedRows([]);
      fetchData(); // Refresh data after deletion
      confirm.onFalse();
    } catch (error) {
      console.error('Error deleting selected rows:', error);
      // Optionally, show an error message to the user here
    } finally {
      setDeleting(false); // Stop loading after delete operation
    }
  }, [selectedRows, fetchData, confirm]);

  //----------------------------------------------------------------------------------------------------

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });
  const canReset = !!filters.state.searchTerm;
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback((id) => {
    fetchDeleteData(id);
  }, []);

  const handleEditRow = useCallback((id) => id, []);

  const handleViewRow = useCallback((id) => id, []);

  return (
    <>
      <DashboardContent maxWidth="2xl">
        <CustomBreadcrumbs
          heading="Gallery List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Gallery', href: paths?.settings?.gallery },
            { name: 'List' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              component={RouterLink}
              to="/settings/gallery/create"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'none',
                },
              }}
            >
              Add Gallery
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <GalleryTableToolbar filters={filters} onResetPage={table.onResetPage} />
          {canReset && (
            <GalleryTableFiltersResult
              filters={filters}
              totalResults={dataFiltered.length}
              onResetPage={table.onResetPage}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <Box sx={{ position: 'relative' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={selectedRows.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                setSelectedRows(checked ? dataFiltered.map((row) => row.id) : [])
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
                  headLabel={TABLE_GALLERY_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={selectedRows.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    setSelectedRows(checked ? dataFiltered.map((row) => row.id) : [])
                  }
                />

                <TableBody>
                  {dataFiltered
                    .sort((a, b) => new Date(b.name) - new Date(a.name)) // Sort by 'created' descending
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <GalleryTableRow
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
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={dataFiltered.length}
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
        title="Delete Gallery?"
        content={
          <Box>
            <Typography gutterBottom>Are you sure you want to delete ?</Typography>
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
