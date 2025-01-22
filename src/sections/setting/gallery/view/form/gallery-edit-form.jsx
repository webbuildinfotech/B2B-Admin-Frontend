import { z as zod } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useEffect, useCallback, useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { useRouter } from 'src/routes/hooks';
import { Box, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import { deleteAllGallery, deleteSingleGallery, editGallery } from 'src/store/action/settingActions';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Define schema for gallery form
export const GalleryFormSchema = zod.object({
    name: zod.string().min(1, { message: 'Name is required!' }),
    type: zod.enum(['gallery', 'certificate'], { message: 'Type is required!' }),
    galleryImages: zod
        .array(
            zod.union([
                zod
                    .instanceof(File)
                    .refine((file) => file.size <= 3145728, 'Each file must be less than 3MB.'),
                zod.string(), // Allow existing uploaded images as strings (e.g., URLs or IDs)
            ])
        )
        .optional(),
});

export function GalleryEditForm({ currentGallery }) {

    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const defaultValues = useMemo(
        () => ({
            name: currentGallery?.name || '',
            type: currentGallery?.type || 'gallery',
            galleryImages: currentGallery?.GalleryImages
                || [],
        }),
        [currentGallery]
    );

    const methods = useForm({
        resolver: zodResolver(GalleryFormSchema),
        defaultValues,
    });

    const { reset, handleSubmit, setValue, watch, formState: { isSubmitting } } = methods;
    const values = watch();

    useEffect(() => {
        if (currentGallery) {
            reset(defaultValues);
        }
    }, [currentGallery, defaultValues, reset]);

    const onSubmit = handleSubmit(async (data) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('type', data.type);

        if (data.galleryImages) {
            data.galleryImages.forEach((file) => {
                formData.append('galleryImages', file);
            });
        }

        setLoading(true);
        try {
            const response = await dispatch(editGallery(currentGallery.id, formData));
            if (response) {
                // toast.success('Gallery updated successfully.');
                navigate('/settings/gallery');
            }
        } catch (error) {
            console.error('Submission failed:', error);
            toast.error('Failed to update gallery.');
        } finally {
            setLoading(false);
        }
    });

    const handleRemoveFile = useCallback(
        (inputFile) => {
            // Determine if the file is a local file (not uploaded yet)
            const isLocalFile = inputFile instanceof File;

            // Call the API only if the file is not a local file
            if (!isLocalFile) {
                dispatch(deleteSingleGallery(currentGallery.id, inputFile));
                const filtered = values.galleryImages?.filter((file) => file !== inputFile);
                setValue('galleryImages', filtered, { shouldValidate: true });
            }

            // Filter out the removed file from the galleryImages array
            const filtered = values.galleryImages?.filter((file) => file !== inputFile);
            setValue('galleryImages', filtered, { shouldValidate: true });
        },
        [dispatch, setValue, values.galleryImages, currentGallery.id]
    );


    const handleRemoveAllFiles = useCallback(
        async () => {
            try {
                // Dispatch the deleteAllGallery action
                await dispatch(deleteAllGallery(currentGallery.id));
            } catch (error) {
                console.error('Error removing all files:', error);
            } finally {
                // Clear the galleryImages field and log the success message
                setValue('galleryImages', [], { shouldValidate: true });
                console.log('All files removed successfully.');
                navigate('/settings/gallery');
            }
        },
        [dispatch, currentGallery.id, setValue]
    );





    return (
        <Form methods={methods} onSubmit={onSubmit}>
            <Card>
                <CardHeader title="Edit Gallery" />
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
                        <Typography variant="subtitle2">Gallery Images</Typography>
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
                        <LoadingButton type="submit" variant="contained" size="large" loading={loading || isSubmitting}>
                            Save Changes
                        </LoadingButton>
                    </Box>
                </Stack>
            </Card>
        </Form>
    );
}
