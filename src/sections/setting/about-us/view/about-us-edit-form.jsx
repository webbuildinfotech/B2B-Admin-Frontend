
import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Box, Card, Stack, Typography, Grid } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Field, Form } from 'src/components/hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { aboutUsList, createAboutUs } from 'src/store/action/settingActions';
import { API_URL } from 'src/configs/env';

const AboutUsSchema = zod.object({
    aboutUs: zod.string().optional(),
    mission: zod.string().optional(),
    vision: zod.string().optional(),
    whatSetsUsApart: zod.string().optional(),
    whyChooseUs: zod.string().optional(),
    imageSmall: zod.any().optional(),
    imageLarge: zod.any().optional(),
});

export default function AboutUsEditForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const methods = useForm({
        resolver: zodResolver(AboutUsSchema),
        defaultValues: {
            aboutUs: '',
            mission: '',
            vision: '',
            whatSetsUsApart: '',
            whyChooseUs: '',
            imageSmall: null,
            imageLarge: null,
        },
    });

    const { reset, handleSubmit, setValue, watch } = methods;
    const values = watch();

    const handleRemoveImageSmall = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/about-us/image/small`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setValue('imageSmall', null);
            }
        } catch (error) {
            console.error('Failed to delete image:', error);
        }
    }, [setValue]);

    const handleRemoveImageLarge = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/about-us/image/large`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setValue('imageLarge', null);
            }
        } catch (error) {
            console.error('Failed to delete image:', error);
        }
    }, [setValue]);

    useEffect(() => {
        const loadAboutUsData = async () => {
            try {
                const aboutUsData = await dispatch(aboutUsList());
                if (aboutUsData) {
                    reset({
                        aboutUs: aboutUsData.aboutUs || '',
                        mission: aboutUsData.mission || '',
                        vision: aboutUsData.vision || '',
                        whatSetsUsApart: aboutUsData.whatSetsUsApart || '',
                        whyChooseUs: aboutUsData.whyChooseUs || '',
                        imageSmall: aboutUsData.imageSmall || null,
                        imageLarge: aboutUsData.imageLarge || null,
                    });
                }
            } catch (error) {
                console.error('Failed to load about us data', error);
            }
        };
        loadAboutUsData();
    }, [dispatch, reset]);

    const onSubmit = handleSubmit(async (data) => {
        setLoading(true);
        try {
            const formData = new FormData();
            
            // Append text fields
            if (data.aboutUs) formData.append('aboutUs', data.aboutUs);
            if (data.mission) formData.append('mission', data.mission);
            if (data.vision) formData.append('vision', data.vision);
            if (data.whatSetsUsApart) formData.append('whatSetsUsApart', data.whatSetsUsApart);
            if (data.whyChooseUs) formData.append('whyChooseUs', data.whyChooseUs);
            
            // Append image files
            if (values.imageSmall && values.imageSmall instanceof File) {
                formData.append('imageSmall', values.imageSmall);
            }
            if (values.imageLarge && values.imageLarge instanceof File) {
                formData.append('imageLarge', values.imageLarge);
            }

            await dispatch(createAboutUs(formData));
        } catch (error) {
            console.error('Submission failed', error);
        } finally {
            setLoading(false);
        }
    });

    return (
        <Box mt={2}>
            <CustomBreadcrumbs
                links={[{ name: '' }]}
            />
            <Form methods={methods} onSubmit={onSubmit}>
                <Stack spacing={3}>
                    <Card>
                        <Stack spacing={2} sx={{ p: 3 }}>
                            <Typography variant="subtitle2">About Us</Typography>
                            <Field.Editor name="aboutUs" sx={{ maxHeight: 480 }} />
                        </Stack>
                    </Card>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <Stack spacing={2} sx={{ p: 3 }}>
                                    <Typography variant="subtitle2">Our Mission</Typography>
                                    <Field.Editor name="mission" sx={{ maxHeight: 480 }} />
                                </Stack>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card>
                                <Stack spacing={2} sx={{ p: 3 }}>
                                    <Typography variant="subtitle2">Our Vision</Typography>
                                    <Field.Editor name="vision" sx={{ maxHeight: 480 }} />
                                </Stack>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card>
                                <Stack spacing={2} sx={{ p: 3 }}>
                                    <Typography variant="subtitle2">What Sets Us Apart</Typography>
                                    <Field.Editor name="whatSetsUsApart" sx={{ maxHeight: 480 }} />
                                </Stack>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card>
                                <Stack spacing={2} sx={{ p: 3 }}>
                                    <Typography variant="subtitle2">Why Choose Us?</Typography>
                                    <Field.Editor name="whyChooseUs" sx={{ maxHeight: 480 }} />
                                </Stack>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card>
                                <Stack spacing={2} sx={{ p: 3 }}>
                                    <Typography variant="subtitle2">Small Image (1:1 ratio)</Typography>
                                    <Field.Upload 
                                        name="imageSmall" 
                                        maxSize={3145728}
                                        helperText="Upload small image (ratio 1:1)"
                                        onDelete={values.imageSmall && typeof values.imageSmall === 'string' ? handleRemoveImageSmall : undefined}
                                    />
                                </Stack>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card>
                                <Stack spacing={2} sx={{ p: 3 }}>
                                    <Typography variant="subtitle2">Large Image (3:4 ratio)</Typography>
                                    <Field.Upload 
                                        name="imageLarge" 
                                        maxSize={3145728}
                                        helperText="Upload large image (ratio 3:4)"
                                        onDelete={values.imageLarge && typeof values.imageLarge === 'string' ? handleRemoveImageLarge : undefined}
                                    />
                                </Stack>
                            </Card>
                        </Grid>
                    </Grid>

                    <Stack direction="row" justifyContent="flex-end" spacing={2}>
                        <LoadingButton type="submit" variant="contained" loading={loading}>
                            Submit
                        </LoadingButton>
                    </Stack>
                </Stack>
            </Form>
        </Box>
    );
}

