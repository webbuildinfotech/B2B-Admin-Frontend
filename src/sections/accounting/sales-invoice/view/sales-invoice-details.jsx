import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableCell from '@mui/material/TableCell';
import { fDate } from 'src/utils/format-time';
import { fCurrency, fAmountWithoutMinus } from 'src/utils/format-number';
import { Scrollbar } from 'src/components/scrollbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useFetchSalesInvoice } from '../components/fetch-sales-invoice';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';

export function SalesInvoiceDetails() {
    const { fetchByIdData } = useFetchSalesInvoice();
    const { id } = useParams();
    const salesInvoice = useSelector((state) => state.accounting?.getBySalesInvoice);
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            fetchByIdData(id);
        }
    }, [id]);


    return (
        <DashboardContent maxWidth="2xl">
            <CustomBreadcrumbs
                heading={`Sales Invoice #${salesInvoice?.voucherNo || id || 'Loading...'}`}
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Sales Invoice', href: paths.salesInvoice.root },
                    { name: 'View' },
                ]}
                action={
                    <Stack direction="row" spacing={1}>
                        {salesInvoice?.invoicePdf && (
                            <Button
                                variant="contained"
                                startIcon={<Iconify icon="solar:download-minimalistic-bold" />}
                                onClick={() => window.open(salesInvoice.invoicePdf, '_blank')}
                            >
                                Download PDF
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            startIcon={<Iconify icon="eva:arrow-back-fill" />}
                            onClick={() => navigate(-1)}
                        >
                            Back
                        </Button>
                    </Stack>
                }
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <Card sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {/* Basic Information */}
                    <Grid xs={12} md={6}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Invoice Information
                        </Typography>
                        <Stack spacing={1.5}>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Voucher No:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {salesInvoice?.voucherNo ?? null}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Voucher Date:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {salesInvoice?.voucherDate ? fDate(salesInvoice.voucherDate) : null}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Voucher Type:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {salesInvoice?.voucherType ?? null}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Reference No:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {salesInvoice?.referenceNo ?? null}
                                </Typography>
                            </Box>

                          
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Amount:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {salesInvoice?.amount != null ? fCurrency(salesInvoice.amount) : null}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Closing Balance:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {salesInvoice?.closingBalance != null ? fCurrency(salesInvoice.closingBalance) : null}
                                </Typography>
                            </Box>
                        </Stack>
                    </Grid>

                    {/* Party Information */}
                    <Grid xs={12} md={6}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Party Information
                        </Typography>
                        <Stack spacing={1.5}>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Party Name:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {salesInvoice?.partyName ?? null}
                                </Typography>
                            </Box>
                           
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Customer Name:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {salesInvoice?.customerName && salesInvoice.customerName !== 'NULL' ? salesInvoice.customerName : "Not Available"}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    GSTIN:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {salesInvoice?.partyGstin ?? null}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Email ID:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {salesInvoice?.emailId ?? null}
                                </Typography>
                            </Box>

                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Mobile:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {salesInvoice?.mobileNumber ?? null}
                                </Typography>
                            </Box>

                        </Stack>
                    </Grid>

                    {/* Divider after first row */}
                    <Grid xs={12}>
                        <Divider sx={{ mt: 1, mb: 3, borderStyle: 'dashed' }} />
                    </Grid>

                    {/* Address Information and Payment Terms in Grid */}
                    <Grid xs={12} md={6}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Address Information
                        </Typography>
                        <Stack spacing={1.5}>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Buyer Address:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {salesInvoice?.buyerAddress ?? null}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Consignee Address:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {salesInvoice?.consigneeAddress ?? null}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    State:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {salesInvoice?.state ?? null}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Place of Supply:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {salesInvoice?.placeOfSupply ?? null}
                                </Typography>
                            </Box>
                        </Stack>
                    </Grid>

                    {/* Payment Terms */}
                    <Grid xs={12} md={6}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Payment Terms
                        </Typography>
                        <Stack spacing={1}>
                            {salesInvoice?.paymentTerms && salesInvoice.paymentTerms.length > 0 ? (
                                salesInvoice.paymentTerms.map((term, index) => (
                                    <Typography key={term.id || index} variant="body2">
                                        {term.terms && term.terms !== 'NULL' ? term.terms : "Not Available"}
                                    </Typography>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                   Not Available
                                </Typography>
                            )}
                        </Stack>
                    </Grid>

                    {/* Items */}
                    <Grid xs={12}>
                        <Divider sx={{ mt: 3, mb: 3, borderStyle: 'dashed' }} />
                    </Grid>
                    <Grid xs={12}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Items
                        </Typography>
                        {salesInvoice?.items && salesInvoice.items.length > 0 ? (
                            <Scrollbar>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Item Name</TableCell>
                                               <TableCell>Base Units</TableCell>
                                            <TableCell align="center">Actual Qty</TableCell>
                                            <TableCell align="center">Billed Qty</TableCell>

                                            <TableCell align="center">Rate</TableCell>
                                            <TableCell align="center">Disc %</TableCell>
                                            <TableCell align="center">GST %</TableCell>

                                            <TableCell align="center">Amount</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {salesInvoice.items.map((item, index) => (
                                            <TableRow key={item.id || index}>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {item.itemName ?? null}
                                                        </Typography>
                                                        {item.descriptions && item.descriptions.length > 0 && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                {item.descriptions.map((desc, idx) => (
                                                                    <Box key={idx}>{desc.desc ?? null}</Box>
                                                                ))}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                   <TableCell>{item.baseUnits ?? null}</TableCell>
                                                <TableCell align="center">{item.actualQty ?? null}</TableCell>
                                                <TableCell align="center">{item.billedQty ?? null}</TableCell>

                                                <TableCell align="center">{item.rate != null ? fCurrency(item.rate) : null}</TableCell>
                                                <TableCell align="center">{item.discPerc ?? null}</TableCell>
                                                <TableCell align="center">{item.gstPer ? `${item.gstPer}%` : "0"}</TableCell>

                                                <TableCell align="center">{item.amount != null ? fCurrency(item.amount) : null}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Scrollbar>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                {null}
                            </Typography>
                        )}
                    </Grid>

                    {/* Tax Ledgers */}
                    <Grid xs={12}>
                        <Divider sx={{ mt: 3, mb: 3, borderStyle: 'dashed' }} />
                    </Grid>
                    <Grid xs={12}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Tax Ledgers
                        </Typography>
                        {salesInvoice?.ledgers && salesInvoice.ledgers.length > 0 ? (
                            <Scrollbar>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Ledger Name</TableCell>
                                                 <TableCell align="right">Amount</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {salesInvoice.ledgers.map((ledger, index) => (
                                            <TableRow key={ledger.id || index}>
                                                <TableCell>{ledger.ledgerName ?? null}</TableCell>
                                                      <TableCell align="right">{ledger.amount != null ? fCurrency(ledger.amount) : null}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Scrollbar>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                {null}
                            </Typography>
                        )}
                    </Grid>
                </Grid>
            </Card>
        </DashboardContent>
    );
}

