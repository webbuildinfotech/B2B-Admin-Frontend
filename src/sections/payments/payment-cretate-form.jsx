import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { RadioGroup, FormControlLabel, Radio, Avatar, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';
import GoogleIcon from '@mui/icons-material/Google';
import PhoneIcon from '@mui/icons-material/Phone';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentIcon from '@mui/icons-material/Payment';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { Field, Form } from 'src/components/hook-form';
import { createPayment } from 'src/store/action/paymentActions';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { validateEmailDomain, validateUpiProvider } from 'src/utils/emailValidation';

const BankFormSchema = zod.object({
    bankName: zod
        .string()
        .min(1, { message: 'Bank Name is required!' })
        .min(2, { message: 'Bank Name must be at least 2 characters!' })
        .max(100, { message: 'Bank Name must not exceed 100 characters!' })
        .regex(/^[a-zA-Z0-9\s.&'-]+$/, { message: 'Bank Name contains invalid characters!' }),

    accountName: zod
        .string()
        .min(1, { message: 'Account Name is required!' })
        .min(3, { message: 'Account Name must be at least 3 characters!' })
        .max(100, { message: 'Account Name must not exceed 100 characters!' })
        .regex(/^[a-zA-Z\s]+$/, { message: 'Account Name can only contain letters and spaces!' }),

    accountNumber: zod
        .string()
        .nonempty({ message: 'Account Number is required!' })
        .regex(/^\d+$/, { message: 'Account Number must contain only digits!' })
        .min(9, { message: 'Account Number must be at least 9 digits!' })
        .max(18, { message: 'Account Number must not exceed 18 digits!' })
        .transform((val) => val.replace(/\s/g, '')),

    ifscCode: zod
        .string()
        .min(1, { message: 'IFSC Code is required!' })
        .length(11, { message: 'IFSC Code must be exactly 11 characters!' })
        .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
            message: 'IFSC Code must be in format: 4 letters + 0 + 6 alphanumeric characters!',
        })
        .transform((val) => val.toUpperCase()),
});

const PayPalFormSchema = zod.object({
    paypalEmail: zod
        .string()
        .min(1, { message: 'PayPal Email is required!' })
        .email({ message: 'Please provide a valid email address!' })
        .refine((email) => validateEmailDomain(email), {
            message:
                'Please use a valid email domain (gmail.com, yahoo.com, outlook.com, etc.). Temporary email domains are not allowed.',
        })
        .transform((val) => val.toLowerCase()),
});

const UPIFormSchema = zod.object({
    upiId: zod
        .string()
        .min(1, { message: 'UPI ID is required!' })
        .min(5, { message: 'UPI ID must be at least 5 characters!' })
        .max(50, { message: 'UPI ID must not exceed 50 characters!' })
        .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/, {
            message: 'UPI ID must be in valid format (e.g., username@upi)!',
        })
        .refine((upiId) => validateUpiProvider(upiId), {
            message:
                'Invalid UPI provider. Please use a valid UPI provider (e.g., googlepay, paytm, phonepe, etc.)!',
        })
        .transform((val) => val.toLowerCase()),

    upiProvider: zod
        .string()
        .min(1, { message: 'UPI Provider is required!' })
        .refine((val) => ['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'Other'].includes(val), {
            message: 'Please select a valid UPI provider!',
        }),

    qrCodeImageUrl: zod.any().optional(),
});

const TAB_META = {
    Bank: {
        title: 'Bank Account Details',
        description: 'Add your bank account information for receiving payments.',
        icon: <AccountBalanceIcon fontSize="small" />,
    },
    Paypal: {
        title: 'PayPal Account',
        description: 'Link your PayPal email to accept international payments.',
        icon: <PaymentIcon fontSize="small" />,
    },
    UPI: {
        title: 'UPI Payment',
        description: 'Set up UPI for quick and secure domestic transfers.',
        icon: <QrCodeIcon fontSize="small" />,
    },
};

export function PaymentCreateForm() {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Bank');
    const defaultValues = {
        bankName: '',
        accountName: '',
        accountNumber: '',
        ifscCode: '',
        paypalEmail: '',
        upiId: '',
        upiProvider: '',
        qrCodeImageUrl: '',
    };

    const methods = useForm({
        resolver: zodResolver(
            activeTab === 'Bank'
                ? BankFormSchema
                : activeTab === 'Paypal'
                  ? PayPalFormSchema
                  : UPIFormSchema
        ),
        defaultValues,
    });

    const {
        handleSubmit,
        setValue,
        formState: { isSubmitting, errors },
    } = methods;

    const onSubmit = handleSubmit(async (data) => {
        const formData = new FormData();

        if (activeTab === 'Bank') {
            formData.append('type', 'Bank');
            formData.append('bankName', data.bankName);
            formData.append('accountName', data.accountName);
            formData.append('accountNumber', data.accountNumber);
            formData.append('ifscCode', data.ifscCode);
            if (data.qrCodeImageUrl) {
                formData.append('qrCodeImageUrl', data.qrCodeImageUrl);
            }
        } else if (activeTab === 'Paypal') {
            formData.append('type', 'Paypal');
            formData.append('paypalEmail', data.paypalEmail);
        } else if (activeTab === 'UPI') {
            formData.append('type', 'UPI');
            formData.append('upiId', data.upiId);
            formData.append('upiProvider', data.upiProvider);
            if (data.qrCodeImageUrl) {
                formData.append('qrCodeImageUrl', data.qrCodeImageUrl);
            }
        }

        setLoading(true);
        try {
            const response = await dispatch(createPayment(formData));
            if (response) {
                navigate('/payments');
            }
        } catch (error) {
            console.error('Error creating payment:', error);
        } finally {
            setLoading(false);
        }
    });

    const handleRemoveFile = useCallback(() => {
        setValue('qrCodeImageUrl', null);
    }, [setValue]);

    const tabMeta = TAB_META[activeTab];

    return (
        <Form methods={methods} onSubmit={onSubmit}>
            <Card
                sx={{
                    overflow: 'hidden',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    boxShadow: (theme) => theme.customShadows?.card || theme.shadows[2],
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={(event, newValue) => setActiveTab(newValue)}
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{
                        px: 2,
                        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                        '& .MuiTab-root': {
                            minHeight: 64,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: 14,
                        },
                    }}
                >
                    <Tab
                        value="Bank"
                        icon={<AccountBalanceIcon />}
                        iconPosition="start"
                        label="Bank Details"
                    />
                    <Tab
                        value="Paypal"
                        icon={<PaymentIcon />}
                        iconPosition="start"
                        label="PayPal"
                    />
                    <Tab value="UPI" icon={<QrCodeIcon />} iconPosition="start" label="UPI" />
                </Tabs>

                <Divider />

                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 3 }}>
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                color: 'primary.main',
                                flexShrink: 0,
                            }}
                        >
                            {tabMeta.icon}
                        </Box>
                        <Box>
                            <Typography variant="h6">{tabMeta.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {tabMeta.description}
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack spacing={3}>
                        {activeTab === 'Bank' && (
                            <Grid container spacing={2.5}>
                                <Grid xs={12} md={6}>
                                    <Field.Text
                                        name="bankName"
                                        label="Bank Name"
                                        placeholder="e.g. HDFC Bank, SBI, ICICI"
                                        helperText="Enter the full name of your bank"
                                    />
                                </Grid>
                                <Grid xs={12} md={6}>
                                    <Field.Text
                                        name="accountName"
                                        label="Account Holder Name"
                                        placeholder="Name as per bank records"
                                        helperText="Must match your bank account name"
                                    />
                                </Grid>
                                <Grid xs={12} md={6}>
                                    <Field.Text
                                        name="accountNumber"
                                        label="Account Number"
                                        placeholder="Enter account number"
                                        helperText="9–18 digit account number"
                                    />
                                </Grid>
                                <Grid xs={12} md={6}>
                                    <Field.Text
                                        name="ifscCode"
                                        label="IFSC Code"
                                        placeholder="e.g. HDFC0001234"
                                        helperText="11-character IFSC from your cheque / passbook"
                                    />
                                </Grid>
                            </Grid>
                        )}

                        {activeTab === 'Paypal' && (
                            <Field.Text
                                name="paypalEmail"
                                label="PayPal Email"
                                placeholder="you@example.com"
                                helperText="Use the email registered with your PayPal account"
                            />
                        )}

                        {activeTab === 'UPI' && (
                            <>
                                <Field.Text
                                    name="upiId"
                                    label="UPI ID"
                                    placeholder="username@upi"
                                    helperText="e.g. yourname@okhdfcbank or yourname@paytm"
                                />

                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                                        Select UPI Provider
                                    </Typography>
                                    <RadioGroup
                                        name="upiProvider"
                                        onChange={(e) => setValue('upiProvider', e.target.value)}
                                    >
                                        <Grid container spacing={1.5}>
                                            {[
                                                {
                                                    value: 'Google Pay',
                                                    label: 'Google Pay',
                                                    color: '#4285F4',
                                                    icon: <GoogleIcon />,
                                                },
                                                {
                                                    value: 'PhonePe',
                                                    label: 'PhonePe',
                                                    color: '#673AB7',
                                                    icon: <PhoneIcon />,
                                                },
                                                {
                                                    value: 'Other',
                                                    label: 'Other',
                                                    color: '#757575',
                                                    icon: <AddIcon />,
                                                },
                                            ].map((provider) => (
                                                <Grid key={provider.value} xs={12} sm={4}>
                                                    <Paper
                                                        variant="outlined"
                                                        sx={{
                                                            px: 1.5,
                                                            py: 0.5,
                                                            borderRadius: 2,
                                                            borderColor: (theme) =>
                                                                methods.watch('upiProvider') ===
                                                                provider.value
                                                                    ? 'primary.main'
                                                                    : 'divider',
                                                            bgcolor: (theme) =>
                                                                methods.watch('upiProvider') ===
                                                                provider.value
                                                                    ? alpha(
                                                                          theme.palette.primary.main,
                                                                          0.04
                                                                      )
                                                                    : 'transparent',
                                                        }}
                                                    >
                                                        <FormControlLabel
                                                            value={provider.value}
                                                            control={<Radio size="small" />}
                                                            sx={{ m: 0, width: '100%' }}
                                                            label={
                                                                <Stack
                                                                    direction="row"
                                                                    spacing={1}
                                                                    alignItems="center"
                                                                >
                                                                    <Avatar
                                                                        sx={{
                                                                            bgcolor: provider.color,
                                                                            width: 32,
                                                                            height: 32,
                                                                        }}
                                                                    >
                                                                        {provider.icon}
                                                                    </Avatar>
                                                                    <Typography variant="body2" fontWeight={600}>
                                                                        {provider.label}
                                                                    </Typography>
                                                                </Stack>
                                                            }
                                                        />
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </RadioGroup>
                                    {errors.upiProvider && (
                                        <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                                            {errors.upiProvider.message}
                                        </Typography>
                                    )}
                                </Box>

                                <Stack spacing={1.5}>
                                    <Typography variant="subtitle2">QR Code Image (Optional)</Typography>
                                    <Field.Upload
                                        name="qrCodeImageUrl"
                                        maxSize={3145728}
                                        accept={{
                                            'image/png': [],
                                            'image/jpeg': [],
                                        }}
                                        onDelete={handleRemoveFile}
                                    />
                                </Stack>
                            </>
                        )}

                        <Divider sx={{ borderStyle: 'dashed' }} />

                        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                            <LoadingButton
                                type="submit"
                                variant="contained"
                                size="large"
                                loading={isSubmitting || loading}
                                sx={{ minWidth: 160, px: 3 }}
                            >
                                Add Payment
                            </LoadingButton>
                        </Stack>
                    </Stack>
                </Box>
            </Card>
        </Form>
    );
}
