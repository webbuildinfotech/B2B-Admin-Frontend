import { z as zod } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState, useEffect, useMemo } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { useRouter } from 'src/routes/hooks';
import { Box, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import { createBanner } from 'src/store/action/settingActions';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useFetchBannerData } from '../../components/fetch-banner';


// Define the BannerType enum
const BannerType = {
    Home: 'Home',
    Contact: 'Contact',
    About: 'About',
    Dealer: 'Dealer',
    Resource: 'Resource',
    FAQs: 'FAQs',
    Terms: 'Terms',
};

// Define schema for multiple file uploads
export const BannerFormSchema = zod.object({
    name: zod.string().min(1, { message: 'Name is required!' }),
    type: zod.string().min(1, { message: 'Type is required!' }),
    bannerImages: zod.any().optional() // Allow any type for multiple files
});

export function BannerCreateForm() {

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Fetch banner data when component mounts
    const { fetchBannerData } = useFetchBannerData();

    // Get existing banners from Redux store
    const existingBanners = useSelector((state) => state.setting?.banner || []);

    // Fetch banner data only once on component mount
    useEffect(() => {
        const loadBannerData = async () => {
            setDataLoading(true);
            try {
                await fetchBannerData();
            } catch (error) {
                console.error('Error fetching banner data:', error);
            } finally {
                setDataLoading(false);
            }
        };

        // Only fetch if we don't have banner data
        if (existingBanners.length === 0) {
            loadBannerData();
        } else {
            setDataLoading(false);
        }
    }, []); // Empty dependency array - only run once

    // Get used types from existing banners
    const usedTypes = useMemo(() => 
        existingBanners.map(banner => banner.type)
    , [existingBanners]);

    // Get available types (types that haven't been used yet)
    const availableTypes = useMemo(() => 
        Object.values(BannerType).filter(type => !usedTypes.includes(type))
    , [usedTypes]);

    // Define initial default values for creation
    const defaultValues = {
        name: '',
        type: availableTypes.length > 0 ? availableTypes[0] : '',
        bannerImages: [],
    };

    const methods = useForm({
        resolver: zodResolver(BannerFormSchema),
        defaultValues,
    });

    const { reset, handleSubmit, setValue, watch, formState: { isSubmitting } } = methods;
    const values = watch();

    // Update default type when available types change
    useEffect(() => {
        if (availableTypes.length > 0 && !availableTypes.includes(values.type)) {
            setValue('type', availableTypes[0]);
        }
    }, [availableTypes, setValue, values.type]);

    const onSubmit = handleSubmit(async (data) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('type', data.type);

        // Handle multiple banner images
        const bannerImages = values.bannerImages || [];
        if (bannerImages.length === 0) {
            toast.error('Please upload at least one banner image');
            return;
        }
        
        bannerImages.forEach((image) => {
            formData.append('bannerImages', image);
        });

        setLoading(true);
        try {
            const response = await dispatch(createBanner(formData));
            if (response) {
                navigate('/settings/banner');
            }
        } catch (error) {
            console.error('Submission failed', error);
        } finally {
            setLoading(false);
        }
    });
    
    const handleChange = ({ target: { value } }) => {
        setValue('type', value); // Update the form value
    };
    
    const handleRemoveFile = useCallback((file) => 
        setValue('bannerImages', values.bannerImages.filter((item) => item !== file))
    , [setValue, values.bannerImages]);

    const handleRemoveAllFiles = useCallback(() => 
        setValue('bannerImages', [])
    , [setValue]);

    // Show loading state while fetching data
    if (dataLoading) {
        return (
            <Card>
                <CardHeader title="Create New Banner" />
                <Divider sx={{ mt: 1 }} />
                <Stack spacing={3} sx={{ p: 3 }}>
                    <Typography variant="body1">
                        Loading banner data...
                    </Typography>
                </Stack>
            </Card>
        );
    }

    // Show message if no types are available
    if (availableTypes.length === 0) {
        return (
            <Card>
                <CardHeader title="Create New Banner" />
                <Divider sx={{ mt: 1 }} />
                <Stack spacing={3} sx={{ p: 3 }}>
                    <Typography variant="body1" color="warning.main">
                        All banner types have already been used. Please delete an existing banner first to create a new one.
                    </Typography>
                    <Box display="flex" justifyContent="flex-end">
                        <LoadingButton 
                            variant="contained" 
                            size="large" 
                            onClick={() => navigate('/settings/banner')}
                        >
                            Back to Banner List
                        </LoadingButton>
                    </Box>
                </Stack>
            </Card>
        );
    }

    return (
        <Form methods={methods} onSubmit={onSubmit}>
            <Card>
                <CardHeader title="Create New Banner" />
                <Divider sx={{ mt: 1 }} />

                <Stack spacing={3} sx={{ p: 3 }}>
                    <Field.Text name="name" label="Banner Name" />

                    <Stack spacing={1.5}>
                    <FormControl fullWidth>
                    <InputLabel id="type-select-label">Type</InputLabel>
                    <Select
                        labelId="type-select-label"
                        id="type-select"
                        value={watch('type')} // Bind value to 'type'
                        onChange={handleChange}
                        label="Type"
                    >
                        {availableTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                </Stack>

                    <Stack spacing={1.5}>
                        <Typography variant="subtitle2">Banner Images</Typography>

                        <Field.Upload 
                            multiple
                            thumbnail
                            name="bannerImages" 
                            maxSize={3145728} 
                            onRemove={handleRemoveFile}
                            onRemoveAll={handleRemoveAllFiles}
                        />
                    </Stack>

                    <Box display="flex" justifyContent="flex-end">
                        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
                            Create Banner
                        </LoadingButton>
                    </Box>
                </Stack>
            </Card>
        </Form>
    );
}
