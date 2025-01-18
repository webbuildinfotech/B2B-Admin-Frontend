import { z as zod } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { useRouter } from 'src/routes/hooks';
import { Box, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import { createBanner, createGallery } from 'src/store/action/settingActions';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

// Define schema for file uploads and new 'type' field
export const GalleryFormSchema = zod.object({
    name: zod.string().min(1, { message: 'Name is required!' }),
    type: zod.enum(['gallery', 'certificate'], { message: 'Type is required!' }),
    galleryImages: zod
        .array(
            zod
                .instanceof(File)
                .refine((file) => file.size <= 3145728, 'Each file must be less than 3MB.')
        )
        .nonempty('At least one image is required!'),

});

export function GalleryCreateForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Define initial default values for creation
    const defaultValues = {
        name: '',
        type: 'gallery', // Default type is 'gallery'
        galleryImages: '',
    };

    const methods = useForm({
        resolver: zodResolver(GalleryFormSchema),
        defaultValues,
    });

    const { reset, handleSubmit, setValue, watch, formState: { isSubmitting } } = methods;
    const values = watch();

    const onSubmit = handleSubmit(async (data) => {
        const formData = new FormData();
        formData.append('name', data.name); // Append the gallery name
        formData.append('type', data.type); // Append the type (gallery or certificate)

        // Append each file in the galleryImages array to the FormData
        if (data.galleryImages && Array.isArray(data.galleryImages)) {
            data.galleryImages.forEach((file) => {
                formData.append('galleryImages', file);
            });
        }

        setLoading(true);
        try {
            const response = await dispatch(createGallery(formData));
            if (response) {
                navigate('/settings/gallery');
            }
        } catch (error) {
            console.error('Submission failed:', error);
            toast.error('Failed to create gallery.');
        } finally {
            setLoading(false);
        }
    });

    const handleRemoveFile = useCallback(
        (inputFile) => {
            const filtered = values.galleryImages
                && values.galleryImages
                    ?.filter((file) => file !== inputFile);
            setValue('galleryImages', filtered);
        },
        [setValue, values.galleryImages
        ]
    );

    const handleRemoveAllFiles = useCallback(() => {
        setValue('galleryImages', [], { shouldValidate: true });
    }, [setValue]);

    

    return (
        <Form methods={methods} onSubmit={onSubmit}>
            <Card>
                <CardHeader title="Create New Gallery" />
                <Divider sx={{ mt: 1 }} />

                <Stack spacing={3} sx={{ p: 3 }}>

                    <Stack spacing={1.5}>
                        <Controller
                            name="type"
                            control={methods.control}
                            defaultValue="gallery"
                            render={({ field }) => (
                                <FormControl fullWidth>
                                    <InputLabel id="type-select-label">Type</InputLabel>
                                    <Select
                                        {...field}
                                        labelId="type-select-label"
                                        id="type-select"
                                        label="Type"
                                    >
                                        <MenuItem value="gallery">Gallery</MenuItem>
                                        <MenuItem value="certificate">Certificate</MenuItem>
                                    </Select>
                                </FormControl>
                            )}
                        />
                    </Stack>

                    <Field.Text name="name" label="Gallery Name" />


                    <Stack spacing={1.5}>
                        <Typography variant="subtitle2">Gallery Image</Typography>

                        <Field.Upload
                            multiple
                            thumbnail
                            name="galleryImages"
                            maxSize={3145728}
                            onRemove={handleRemoveFile}
                            onRemoveAll={handleRemoveAllFiles}
                        />

                    </Stack>

                    <Box display="flex" justifyContent="flex-end">
                        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
                            Create
                        </LoadingButton>
                    </Box>
                </Stack>
            </Card>
        </Form>
    );
}
