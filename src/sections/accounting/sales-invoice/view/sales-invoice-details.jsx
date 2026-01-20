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

    if (!salesInvoice) {
        return (
            <DashboardContent>
                <Typography>Loading...</Typography>
            </DashboardContent>
        );
    }

    return (
        <DashboardContent maxWidth="2xl">
            <CustomBreadcrumbs
                heading={`Sales Invoice #${salesInvoice.voucherNo || id}`}
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Sales Invoice', href: paths.salesInvoice.root },
                    { name: 'View' },
                ]}
                action={
                    <Button
                        variant="outlined"
                        startIcon={<Iconify icon="eva:arrow-back-fill" />}
                        onClick={() => navigate(-1)}
                    >
                        Back
                    </Button>
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
                                    {salesInvoice.voucherNo || '-'}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Voucher Date:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {fDate(salesInvoice.voucherDate) || '-'}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Voucher Type:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {salesInvoice.voucherType || '-'}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Reference No:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {salesInvoice.referenceNo || '-'}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Amount:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {fCurrency(salesInvoice.amount) || '-'}
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
                                    {salesInvoice.partyName || '-'}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    GSTIN:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {salesInvoice.partyGstin || '-'}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Email:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {salesInvoice.emailId || '-'}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Mobile:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {salesInvoice.mobileNumber || '-'}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Closing Balance:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {fCurrency(salesInvoice.closingBalance) || '-'}
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
                        {(salesInvoice.buyerAddress || salesInvoice.consigneeAddress || salesInvoice.state) && (
                            <>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Address Information
                                </Typography>
                                <Stack spacing={1.5}>
                                    {salesInvoice.buyerAddress && (
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Buyer Address:
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                {salesInvoice.buyerAddress}
                                            </Typography>
                                        </Box>
                                    )}
                                    {salesInvoice.consigneeAddress && (
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Consignee Address:
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                {salesInvoice.consigneeAddress}
                                            </Typography>
                                        </Box>
                                    )}
                                    {salesInvoice.state && (
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">
                                                State:
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                {salesInvoice.state}
                                            </Typography>
                                        </Box>
                                    )}
                                    {salesInvoice.placeOfSupply && (
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">
                                                Place of Supply:
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                {salesInvoice.placeOfSupply}
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </>
                        )}
                    </Grid>

                    {/* Payment Terms */}
                    <Grid xs={12} md={6}>
                        {salesInvoice.paymentTerms && salesInvoice.paymentTerms.length > 0 && (
                            <>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Payment Terms
                                </Typography>
                                <Stack spacing={1}>
                                    {salesInvoice.paymentTerms.map((term, index) => (
                                        <Typography key={term.id || index} variant="body2">
                                            {term.terms || '-'}
                                        </Typography>
                                    ))}
                                </Stack>
                            </>
                        )}
                    </Grid>

                    {/* Divider before Items */}
                    {salesInvoice.items && salesInvoice.items.length > 0 && (
                        <>
                            {((salesInvoice.buyerAddress || salesInvoice.consigneeAddress || salesInvoice.state) || (salesInvoice.paymentTerms && salesInvoice.paymentTerms.length > 0)) && (
                                <Grid xs={12}>
                                    <Divider sx={{ mt: 3, mb: 3, borderStyle: 'dashed' }} />
                                </Grid>
                            )}
                            <Grid xs={12}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Items
                            </Typography>
                            <Scrollbar>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Item Name</TableCell>
                                            <TableCell align="right">Qty</TableCell>
                                            <TableCell align="right">Rate</TableCell>
                                            <TableCell align="right">Amount</TableCell>
                                            <TableCell align="right">GST %</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {salesInvoice.items.map((item, index) => (
                                            <TableRow key={item.id || index}>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {item.itemName || '-'}
                                                        </Typography>
                                                        {item.descriptions && item.descriptions.length > 0 && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                {item.descriptions.map((desc, idx) => (
                                                                    <Box key={idx}>{desc.desc}</Box>
                                                                ))}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">{item.billedQty || '-'}</TableCell>
                                                <TableCell align="right">{fCurrency(item.rate) || '-'}</TableCell>
                                                <TableCell align="right">{fCurrency(item.amount) || '-'}</TableCell>
                                                <TableCell align="right">{item.gstPer ? `${item.gstPer}%` : '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Scrollbar>
                            </Grid>
                        </>
                    )}

                    {/* Divider before Ledgers */}
                    {salesInvoice.ledgers && salesInvoice.ledgers.length > 0 && (
                        <>
                            {salesInvoice.paymentTerms && salesInvoice.paymentTerms.length > 0 && (
                                <Grid xs={12}>
                                    <Divider sx={{ mt: 3, mb: 3, borderStyle: 'dashed' }} />
                                </Grid>
                            )}
                            <Grid xs={12}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Tax Ledgers
                            </Typography>
                            <Scrollbar>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Ledger Name</TableCell>
                                            <TableCell align="right">Rate %</TableCell>
                                            <TableCell align="right">Amount</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {salesInvoice.ledgers.map((ledger, index) => (
                                            <TableRow key={ledger.id || index}>
                                                <TableCell>{ledger.ledgerName || '-'}</TableCell>
                                                <TableCell align="right">{ledger.ratePerc || '-'}</TableCell>
                                                <TableCell align="right">{fCurrency(ledger.amount) || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Scrollbar>
                            </Grid>
                        </>
                    )}
                </Grid>
            </Card>
        </DashboardContent>
    );
}

