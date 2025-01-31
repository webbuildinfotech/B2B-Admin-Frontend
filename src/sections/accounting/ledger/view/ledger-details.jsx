import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
import { Scrollbar } from 'src/components/scrollbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useFetchData } from '../components/fetch-ledger';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { writeFile, utils } from 'xlsx'; // Library for Excel export
import { generatePDF } from '../utils/generatePDF';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { formHelperTextClasses } from '@mui/material/FormHelperText';
import { LedgerTableFiltersResult } from './table/ledger-table-filters-result';

export function LedgerListDetails({ invoice }) {
    const { fetchByIdData } = useFetchData();
    const { id } = useParams(); // Get the vendor ID from URL
    const ledger = useSelector((state) => state.accounting.getByLedger || []);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [dateError, setDateError] = useState('');

    const handleStartDateChange = (date) => {
        setStartDate(date);
        // Clear any previous error when start date is updated
        if (endDate && new Date(date) > new Date(endDate)) {
            setDateError('Start date must be earlier than the end date.');
        } else {
            setDateError('');
        }
    };
    
    const handleEndDateChange = (date) => {
        setEndDate(date);
        if (startDate && new Date(date) < new Date(startDate)) {
            setDateError('End date must be later than the start date.');
        } else {
            setDateError('');
            // Apply the filter only when end date is set
            if (startDate && date) {
                // Trigger the filtering logic
                setPage(0); // Reset to the first page
            }
        }
    };
    
    const filteredVouchers = ledger?.vouchers
        ?.filter((voucher) => 
            Object.values(voucher).some((value) => 
                String(value).toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
        ?.filter((voucher) => {
            const voucherDate = new Date(voucher.date);
            // Only filter by date if both startDate and endDate are selected
            if (startDate && endDate) {
                if (voucherDate < new Date(startDate)) return false;
                if (voucherDate > new Date(endDate)) return false;
            }
            return true;
        });

        useEffect(() => {
            fetchByIdData(id);
        }, []);
    
    // Filtered vouchers
    // const filteredVouchers = ledger?.vouchers?.filter((voucher) =>
    //     Object.values(voucher).some((value) =>
    //         String(value).toLowerCase().includes(searchQuery.toLowerCase())
    //     )
    // )?.filter((voucher) => {
    //     const voucherDate = new Date(voucher.date);
    //     if (startDate && voucherDate < new Date(startDate)) return false;
    //     if (endDate && voucherDate > new Date(endDate)) return false;
    //     return true;
    // });

 
    // const handleStartDateChange = (date) => {
    //     setStartDate(date);
    //     if (endDate && new Date(date) > new Date(endDate)) {
    //         setDateError('Start date must be earlier than the end date.');
    //     } else {
    //         setDateError('');
    //     }
    // };

    // const handleEndDateChange = (date) => {
    //     setEndDate(date);
    //     if (startDate && new Date(date) < new Date(startDate)) {
    //         setDateError('End date must be later than the start date.');
    //     } else {
    //         setDateError('');
    //     }
    // };

    const handleDownloadPdf = () => {
        if (!filteredVouchers || filteredVouchers.length === 0) {
            console.error('No data available for download.');
            return;
        }
        const dateRange = { startDate, endDate };
        // Call the generatePDF function to generate and download the PDF
        generatePDF(filteredVouchers, ledger,dateRange);
    }

    // const handleExportData = () => {
    //     if (!filteredVouchers?.length) {
    //         alert('No data available for export.');
    //         return;
    //     }

    //     const data = filteredVouchers.map((row, index) => ({
    //         '#No': index + 1,
    //         'Voucher No': row.voucherNo || '-',
    //         'Ledger': row.ledger,
    //         'Date': fDate(row.date),
    //         'Voucher Type': row.voucherType || '-',
    //         'Debit Balance': fCurrency(row.debitAmount) || '-',
    //         'Credit Balance': fCurrency(row.creditAmount) || '-',
    //     }));

    //     const worksheet = utils.json_to_sheet(data);
    //     const workbook = utils.book_new();
    //     utils.book_append_sheet(workbook, worksheet, 'Ledger');

    //     writeFile(workbook, `Ledger_${id}.xlsx`);
    // };

    const handleResetFilters = useCallback(() => {
        setStartDate(null);
        setEndDate(null);
        setSearchQuery('');
        setPage(0);
    }, []);

    // Handle pagination changes
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to the first page
    };

    const isFilterApplied = !!searchQuery || !!startDate || !!endDate;

    const renderFooter = (
        <Box gap={2} display="flex" alignItems="center" flexWrap="wrap" sx={{ py: 3 }}>
            <div>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    NOTES : -
                </Typography>
                <Typography variant="body2">
                    Outstanding ledgers are updated automatically every 24 hours through auto-sync.
                </Typography>
            </div>
        </Box>
    );

    const renderList = (
        <Scrollbar sx={{ mt: 5 }}>
            <Table sx={{ minWidth: 960 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Voucher No</TableCell>
                        <TableCell>Particulars</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Voucher Type</TableCell>
                        <TableCell align="center">Debit Balance</TableCell>
                        <TableCell align="center">Credit Balance</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredVouchers?.length > 0 ? (
                        filteredVouchers
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // Apply pagination
                            .map((row, index) => (
                                <TableRow key={row.id}>
                                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                    <TableCell>{row.voucherNo}</TableCell>
                                    <TableCell>{row.ledger || '-'}</TableCell>
                                    <TableCell>{fDate(row.date)}</TableCell>
                                    <TableCell>{row.voucherType || '-'}</TableCell>
                                    <TableCell align="center">{fCurrency(row.debitAmount) || '-'}</TableCell>
                                    <TableCell align="center">{fCurrency(row.creditAmount) || '-'}</TableCell>
                                </TableRow>
                            ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={8} align="center">
                                <Typography variant="body2" color="text.secondary">
                                    No vouchers available.
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Scrollbar>
    );

    return (
        <DashboardContent maxWidth="2xl">
            <CustomBreadcrumbs
                heading={`View # ${ledger.party}`}
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Receivable', href: paths?.accounts?.ledger },
                    { name: 'View' },
                ]}
                action={
                    <Button variant="contained" onClick={handleDownloadPdf}>
                        Download
                    </Button>
                }
                sx={{ mb: { xs: 3, md: 5 } }}
            />



            <Card sx={{ pt: 5, px: 5 }}>
                <Box
                    rowGap={3}
                    display="grid"
                    alignItems="center"
                    gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(3, 1fr)' }}
                >
                    <Stack sx={{ typography: 'body2' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Party
                        </Typography>
                        {ledger.party}
                    </Stack>

                    <Stack sx={{ typography: 'body2' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Alias
                        </Typography>
                        {ledger.alias || '-'}
                    </Stack>
                    <Stack sx={{ typography: 'body2' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Opening Balance
                        </Typography>
                        {ledger.openingBalance}
                    </Stack>
                    <Stack sx={{ typography: 'body2' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Closing Balance
                        </Typography>
                        {ledger.closingBalance}
                    </Stack>
                    <Stack sx={{ typography: 'body2' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Total Debit Amount
                        </Typography>
                        {ledger.totalDebitAmount}
                    </Stack>
                    <Stack sx={{ typography: 'body2' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Total Credit Amount
                        </Typography>
                        {ledger.totalCreditAmount}
                    </Stack>
                </Box>
                <Divider sx={{ mt: 4, borderStyle: 'dashed' }} />
                <Box
                    display="flex"
                    gap={2}
                    flexWrap="wrap"
                    sx={{
                        mb: 2,
                        alignItems: 'center', // Center items vertically for better alignment
                    }}
                >

                    <TextField
                        label="Search..."
                        variant="outlined"
                        fullWidth
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{
                            flex: '1 1 100%', // Takes full width on smaller screens
                            mb: 2,
                            mt: 2,
                            maxWidth: { xs: '100%', md: 600 }, // Adjust width for medium and smaller screens
                        }}
                    />
                    <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={handleStartDateChange}
                        slotProps={{ textField: { fullWidth: true } }}
                        sx={{
                            flex: '1 1 200px', // Adjusts based on available space
                            minWidth: '150px', // Ensures a minimum width
                        }}
                    />
                    <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                error: !!dateError,
                                helperText: dateError || null,
                            },
                        }}
                        sx={{
                            flex: '1 1 200px', // Adjusts based on available space
                            minWidth: '150px', // Ensures a minimum width
                        }}
                    />
                </Box>

                {isFilterApplied && (
                    <LedgerTableFiltersResult
                        filters={{
                            state: { startDate, endDate, name: searchQuery },
                            setState: ({ startDate: newStartDate, endDate: newEndDate, name: newName }) => {
                                setStartDate(newStartDate ?? null);
                                setEndDate(newEndDate ?? null);
                                setSearchQuery(newName ?? '');
                            },
                            onResetState: handleResetFilters,
                        }}
                        totalResults={filteredVouchers?.length || 0}
                        onResetPage={() => setPage(0)}
                        sx={{ mb: 3 }}
                    />
                )}
                
                


                {renderList}

                <Divider sx={{ mt: 5, borderStyle: 'dashed' }} />

                <TablePagination
                    component="div"
                    count={filteredVouchers?.length || 0}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />

                {renderFooter}
            </Card>
        </DashboardContent>
    );
}
