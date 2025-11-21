import { z as zod } from 'zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { updateAdminProfile } from 'src/store/action/userActions';
import { useDispatch } from 'react-redux';

// ----------------------------------------------------------------------

// Validation schema for admin profile update
const AdminProfileSchema = zod.object({
    name: zod.string().min(1, { message: 'Name is required!' }),
    email: zod
        .string()
        .min(1, { message: 'Email is required!' })
        .email({ message: 'Email must be a valid email address!' }),
    mobile: schemaHelper.phoneNumber({ isValidPhoneNumber }),
    address: zod.string().optional(),
    state: zod.string().optional(),
    country: zod.string().optional(),
    pincode: zod.string().optional(),
    profile: zod.union([zod.instanceof(File), zod.string()]).optional().nullable(),
});

// ----------------------------------------------------------------------
// Admin Profile Edit Form Component
export function AdminProfileEditForm({ open, onClose, adminData, onSuccess }) {
    const dispatch = useDispatch();

    // Prepare default values from adminData
    const defaultValues = useMemo(() => {
        if (!adminData) {
            return {
                name: '',
                email: '',
                mobile: '',
                address: '',
                state: '',
                country: '',
                pincode: '',
                profile: null,
            };
        }
        
        const mobileValue = adminData?.mobile || adminData?.phone || '';
        
        return {
            name: adminData?.name || '',
            email: adminData?.email || '',
            mobile: mobileValue,
            address: adminData?.address || '',
            state: adminData?.state || '',
            country: adminData?.country || '',
            pincode: adminData?.pincode || '',
            profile: adminData?.profile || null,
        };
    }, [adminData]);

    const methods = useForm({
        resolver: zodResolver(AdminProfileSchema),
        defaultValues,
    });

    const { reset, setValue, handleSubmit, formState: { isSubmitting } } = methods;

    // Helper function to format phone number to international format
    const formatPhoneNumber = (phoneNumber, defaultCountry = 'IN') => {
        if (!phoneNumber) return '';
        
        // If already in international format, return as is
        if (phoneNumber.startsWith('+')) {
            return phoneNumber;
        }
        
        // Try to parse and format the phone number
        try {
            const parsed = parsePhoneNumber(phoneNumber, defaultCountry);
            if (parsed) {
                return parsed.number; // Returns in international format like +916351735093
            }
        } catch (error) {
            // Silently handle parsing errors
        }
        
        // If parsing fails, try adding country code for India (IN)
        if (phoneNumber.length === 10 && defaultCountry === 'IN') {
            return `+91${phoneNumber}`;
        }
        
        return phoneNumber;
    };

    // Reset form values when dialog opens or adminData changes
    useEffect(() => {
        if (open && adminData) {
            const rawMobile = adminData?.mobile || adminData?.phone || '';
            // Format phone number to international format
            const mobileValue = formatPhoneNumber(rawMobile, 'IN');
            
            const formValues = {
                name: adminData?.name || '',
                email: adminData?.email || '',
                mobile: mobileValue,
                address: adminData?.address || '',
                state: adminData?.state || '',
                country: adminData?.country || '',
                pincode: adminData?.pincode || '',
                profile: adminData?.profile || null,
            };
            
            // Reset the form with new values
            reset(formValues, { keepDefaultValues: false });
            
            // Explicitly set mobile value after a short delay to ensure Phone component updates
            if (mobileValue) {
                setTimeout(() => {
                    setValue('mobile', mobileValue, { shouldValidate: false, shouldDirty: false });
                }, 100);
            }
        }
    }, [open, adminData, reset, setValue]);

    // Handle form submission
    const onSubmit = handleSubmit(async (data) => {
        // Check if profile picture file is uploaded (must be a File object, not a string URL)
        const hasProfileFile = data.profile && data.profile instanceof File;
        
        let formattedData;
        
        if (hasProfileFile) {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('profile', data.profile);
            formData.append('name', data.name || '');
            formData.append('email', data.email || '');
            formData.append('mobile', data.mobile || '');
            formData.append('address', data.address || '');
            formData.append('state', data.state || '');
            formData.append('country', data.country || '');
            formData.append('pincode', data.pincode || '');
            formattedData = formData;
        } else {
            // Send JSON if no file (or if profile is a string URL, don't send it)
            formattedData = {
                name: data.name,
                email: data.email,
                mobile: data.mobile,
                address: data.address,
                state: data.state,
                country: data.country,
                pincode: data.pincode,
            };
            // Only include profile if it's a new file, not if it's the existing URL
            // (Backend will keep existing profile if not provided)
        }

        const isSuccess = await dispatch(updateAdminProfile(adminData.id, formattedData));
        if (isSuccess) {
            reset();
            onClose();
            if (onSuccess) {
                onSuccess();
            }
        }
    });

    return (
        <Dialog fullWidth maxWidth="md" open={open} onClose={onClose} key={adminData?.id || 'admin-profile-form'}>
            <Form methods={methods} onSubmit={onSubmit}>
                <DialogTitle>Edit Admin Profile</DialogTitle>

                <DialogContent>
                    <Alert variant="outlined" severity="info" sx={{ mb: 3 }}>
                        Update your profile information below. Only admins can update their profile.
                    </Alert>

                    <Box sx={{ mb: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Field.UploadAvatar name="profile" maxSize={3145728} />
                        <Typography variant="caption" sx={{ mt: 3, mx: 'auto', textAlign: 'center', color: 'text.disabled' }}>
                            Allowed *.jpeg, *.jpg, *.png, *.gif
                        </Typography>
                    </Box>

                    <Box display="grid" gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }} gap={3}>
                        <Field.Text name="name" label="Name" />
                        <Field.Text name="email" label="Email" />
                        <Field.Phone 
                            name="mobile" 
                            label="Mobile"
                            country="IN"
                            disableSelect
                        />
                        <Field.Text name="address" label="Address" />
                        <Field.Text name="state" label="State" />
                        <Field.Text name="country" label="Country" />
                        <Field.Text name="pincode" label="Pincode" />
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button variant="outlined" onClick={onClose}>
                        Cancel
                    </Button>
                    <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                        Update Profile
                    </LoadingButton>
                </DialogActions>
            </Form>
        </Dialog>
    );
}

