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
import LoadingButton from '@mui/lab/LoadingButton';
import { RadioGroup, FormControlLabel, Radio, Avatar } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import PhoneIcon from '@mui/icons-material/Phone';
import AddIcon from '@mui/icons-material/Add';
import { Field, Form, schemaHelper } from 'src/components/hook-form';
import { createPayment } from 'src/store/action/paymentActions';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { validateEmailDomain, validateUpiProvider } from 'src/utils/emailValidation';

// Define schemas for different payment methods
const BankFormSchema = zod.object({
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
        .transform((val) => val.replace(/\s/g, '')), // Remove spaces

    ifscCode: zod
        .string()
        .min(1, { message: 'IFSC Code is required!' })
        .length(11, { message: 'IFSC Code must be exactly 11 characters!' })
        .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, { 
            message: 'IFSC Code must be in format: 4 letters + 0 + 6 alphanumeric characters!' 
        })
        .transform((val) => val.toUpperCase()), // Convert to uppercase
});

const PayPalFormSchema = zod.object({
    paypalEmail: zod
    .string()
    .min(1, { message: 'PayPal Email is required!' })
    .email({ message: 'Please provide a valid email address!' })
    .refine((email) => validateEmailDomain(email), {
        message: 'Please use a valid email domain (gmail.com, yahoo.com, outlook.com, etc.). Temporary email domains are not allowed.'
    })
    .transform((val) => val.toLowerCase()), // Convert to lowercase
});

const UPIFormSchema = zod.object({
    upiId: zod
        .string()
        .min(1, { message: 'UPI ID is required!' })
        .min(5, { message: 'UPI ID must be at least 5 characters!' })
        .max(50, { message: 'UPI ID must not exceed 50 characters!' })
        .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/, { 
            message: 'UPI ID must be in valid format (e.g., username@upi)!' 
        })
        .refine((upiId) => validateUpiProvider(upiId), {
            message: 'Invalid UPI provider. Please use a valid UPI provider (e.g., googlepay, paytm, phonepe, etc.)!'
        })
        .transform((val) => val.toLowerCase()), // Convert to lowercase
    
    upiProvider: zod
        .string()
        .min(1, { message: 'UPI Provider is required!' })
        .refine((val) => ['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'Other'].includes(val), {
            message: 'Please select a valid UPI provider!'
        }),
    
    qrCodeImageUrl: zod.any().optional(),
});


export function PaymentCreateForm() {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Bank'); // Default to the 'bank' tab
    const defaultValues = {
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

    const { handleSubmit, setValue, formState: { isSubmitting, errors } } = methods;

    const onSubmit = handleSubmit(async (data) => {
        const formData = new FormData();

        // Add data to FormData based on activeTab
        if (activeTab === 'Bank') {
            formData.append('type', 'Bank');
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
            const response = await dispatch(createPayment(formData)); // Dispatch the action
            if (response) {
                navigate('/payments'); // Adjust to the appropriate path

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

    return (
        <Form methods={methods} onSubmit={onSubmit}>
            <Card>
                {/* Tabs for selecting payment method */}
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

                <Stack spacing={3} sx={{ p: 3 }}>
                    {/* Render Bank Form */}
                    {activeTab === 'Bank' && (
                        <>
                            <Field.Text name="accountName" label="Account Name" />

                            <Field.Text name="accountNumber" label="Account Number" />

                            <Field.Text name="ifscCode" label="IFSC Code" />

                        </>
                    )}

                    {/* Render PayPal Form */}
                    {activeTab === 'Paypal' && (

                        <Field.Text name="paypalEmail" label="PayPal Email" />


                    )}

                    {/* Render UPI Form */}
                    {activeTab === 'UPI' && (
                        <>
                            <Field.Text name="upiId" label="UPI ID" />


                            {/* UPI Provider Selection */}
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Select UPI Provider
                            </Typography>
                            <RadioGroup
                                row={false}
                                name="upiProvider"
                                onChange={(e) => setValue('upiProvider', e.target.value)}
                            >
                                <Stack spacing={2}>
                                    <FormControlLabel
                                        value="Google Pay"
                                        control={<Radio />}
                                        label={
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Avatar sx={{ bgcolor: '#4285F4' }}>
                                                    <GoogleIcon />
                                                </Avatar>
                                                <Typography>Google Pay</Typography>
                                            </Stack>
                                        }
                                    />
                                    <FormControlLabel
                                        value="PhonePe"
                                        control={<Radio />}
                                        label={
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Avatar sx={{ bgcolor: '#673AB7' }}>
                                                    <PhoneIcon />
                                                </Avatar>
                                                <Typography>PhonePe</Typography>
                                            </Stack>
                                        }
                                    />
                                    <FormControlLabel
                                        value="Other"
                                        control={<Radio />}
                                        label={
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Avatar sx={{ bgcolor: '#9E9E9E' }}>
                                                    <AddIcon />
                                                </Avatar>
                                                <Typography>Other</Typography>
                                            </Stack>
                                        }
                                    />
                                </Stack>
                            </RadioGroup>
                            {errors.upiProvider && (
                                <Typography color="error" variant="body2">
                                    {errors.upiProvider.message}
                                </Typography>
                            )}

                            {/* QR Code Upload */}
                            <Stack spacing={1.5}>
                                <Typography variant="subtitle2">QR Code Image (Optional)</Typography>
                                <Field.Upload
                                    name="qrCodeImageUrl"
                                    maxSize={3145728}
                                    accept={{
                                        'image/png': [],
                                        'image/jpeg': [], // Covers both .jpeg and .jpg
                                    }}
                                    onDelete={handleRemoveFile}
                                />
                            </Stack>
                        </>
                    )}

                    {/* Submit Button */}
                    <Box>
                        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting || loading}>
                            Add Payment
                        </LoadingButton>
                    </Box>
                </Stack>
            </Card>
        </Form>
    );
}
