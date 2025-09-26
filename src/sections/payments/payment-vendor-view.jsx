import React, { useEffect, useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  Stack,
  Divider,
  Grid,
  Avatar,
  Chip,
  Paper,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import GoogleIcon from '@mui/icons-material/Google';
import PhoneIcon from '@mui/icons-material/Phone';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentIcon from '@mui/icons-material/Payment';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useFetchData } from './components/fetch-payment';
import { useSelector } from 'react-redux';

export function PaymentViewUi() {
  const [activeTab, setActiveTab] = useState('Bank'); // Default to Bank tab
  const payments = useSelector((state) => state.payment?.payment || []);
  const { fetchData } = useFetchData();

  useEffect(() => {
    fetchData(); // Fetch banners when the component mounts
  }, []);

  // Filter the data based on the active tab
  const filteredPayments = payments.filter((payment) => payment.type === activeTab);

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Payment Details"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Payments', href: paths?.dashboard?.payment?.root },
          { name: 'Payment Details' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        {/* Tabs for payment types */}
        <Tabs
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ px: 3 }}
        >
          <Tab value="Bank" label="Bank Details" />
          <Tab value="Paypal" label="PayPal" />
          <Tab value="UPI" label="UPI" />
        </Tabs>

        <Divider />

        <Box sx={{ p: 3 }}>
          {filteredPayments.length > 0 ? (
            <Grid container spacing={3}>
              {filteredPayments.map((payment, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={activeTab === 'UPI' ? 4 : 6}
                  key={payment.id || index}
                >
                  {/* Bank Card */}
                  {activeTab === 'Bank' && (
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'grey.200',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: (theme) => theme.shadows[8],
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: -2,
                          right: -2,
                          bottom: -2,
                          left: -2,
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          borderRadius: 'inherit',
                          zIndex: -1,
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                        },
                        '&:hover::before': {
                          opacity: 1,
                        },
                      }}
                    >
                      {/* Bank Card Header */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={3}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              bgcolor: alpha('#fff', 0.2),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <AccountBalanceIcon sx={{ color: 'white', fontSize: 24 }} />
                          </Box>
                          <Typography variant="h6" fontWeight={600}>
                            Bank Account
                          </Typography>
                        </Box>
                        <Chip
                          label="Primary"
                          size="small"
                          sx={{
                            bgcolor: alpha('#fff', 0.2),
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </Stack>

                      {/* Bank Details */}
                      <Stack spacing={2.5}>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ opacity: 0.8, mb: 0.5, display: 'block' }}
                          >
                            Account Holder
                          </Typography>
                          <Typography variant="h6" fontWeight={500}>
                            {payment.accountName || 'Not Available'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ opacity: 0.8, mb: 0.5, display: 'block' }}
                          >
                            Account Number
                          </Typography>
                          <Typography
                            variant="body1"
                            fontWeight={500}
                            sx={{ letterSpacing: 3, fontFamily: 'monospace' }}
                          >
                            {payment.accountNumber
                              ? payment.accountNumber.toString().replace(/(\d{4})(?=\d)/g, '$1-')
                              : '0000-0000-0000-0000'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ opacity: 0.8, mb: 0.5, display: 'block' }}
                          >
                            IFSC Code
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {payment.ifscCode || 'Not Available'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  )}

                  {/* PayPal Card */}
                  {activeTab === 'Paypal' && (
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'grey.200',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, #0070ba 0%, #003087 100%)',
                        color: 'white',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: (theme) => theme.shadows[8],
                        },
                      }}
                    >
                      {/* PayPal Card Header */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={3}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              bgcolor: alpha('#fff', 0.2),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <PaymentIcon sx={{ color: 'white', fontSize: 24 }} />
                          </Box>
                          <Typography variant="h6" fontWeight={600}>
                            PayPal
                          </Typography>
                        </Box>
                        <Chip
                          label="Verified"
                          size="small"
                          sx={{
                            bgcolor: alpha('#4caf50', 0.9),
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </Stack>

                      {/* PayPal Details */}
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ opacity: 0.8, mb: 0.5, display: 'block' }}
                        >
                          PayPal Email
                        </Typography>
                        <Typography variant="h6" fontWeight={500}>
                          {payment.paypalEmail || 'Not Available'}
                        </Typography>
                      </Box>
                    </Paper>
                  )}

                  {/* UPI Card */}
                  {activeTab === 'UPI' && (
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'grey.200',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        background:
                          payment.upiProvider === 'Google Pay'
                            ? 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)'
                            : payment.upiProvider === 'PhonePe'
                              ? 'linear-gradient(135deg, #673AB7 0%, #9C27B0 100%)'
                              : 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                        color: 'white',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: (theme) => theme.shadows[8],
                        },
                      }}
                    >
                      {/* UPI Card Header */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={3}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              bgcolor: alpha('#fff', 0.2),
                            }}
                          >
                            {payment.upiProvider === 'Google Pay' && (
                              <GoogleIcon sx={{ fontSize: 24 }} />
                            )}
                            {payment.upiProvider === 'PhonePe' && (
                              <PhoneIcon sx={{ fontSize: 24 }} />
                            )}
                            {payment.upiProvider === 'Other' && (
                              <QrCodeIcon sx={{ fontSize: 24 }} />
                            )}
                          </Avatar>
                          <Typography variant="h6" fontWeight={600}>
                            {payment.upiProvider || 'UPI'}
                          </Typography>
                        </Box>
                        <Chip
                          label="Active"
                          size="small"
                          sx={{
                            bgcolor: alpha('#4caf50', 0.9),
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </Stack>

                      {/* UPI Details */}
                      <Stack spacing={2}>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ opacity: 0.8, mb: 0.5, display: 'block' }}
                          >
                            UPI ID
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {payment.upiId || 'Not Available'}
                          </Typography>
                        </Box>

                        {payment.qrCodeImageUrl && (
                          <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography
                              variant="caption"
                              sx={{ opacity: 0.8, mb: 1, display: 'block' }}
                            >
                              QR Code
                            </Typography>
                            <Box
                              component="img"
                              src={payment.qrCodeImageUrl}
                              alt="QR Code"
                              sx={{
                                width: 100,
                                height: 100,
                                borderRadius: 2,
                                bgcolor: 'white',
                                p: 1,
                              }}
                            />
                          </Box>
                        )}
                      </Stack>
                    </Paper>
                  )}
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Iconify
                icon="eva:credit-card-outline"
                width={64}
                sx={{ color: 'text.disabled', mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No {activeTab} Methods Found
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Add your {activeTab.toLowerCase()} payment details to get started
              </Typography>
            </Box>
          )}
        </Box>
      </Card>
    </DashboardContent>
  );
}
