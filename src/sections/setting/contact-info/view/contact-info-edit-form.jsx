
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Box, Card, Stack, Typography, Grid } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Field, Form } from 'src/components/hook-form';
import { useDispatch } from 'react-redux';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { contactInfoList, createContactInfo } from 'src/store/action/settingActions';

const ContactInfoSchema = zod.object({
    companyName: zod.string().optional(),
    address: zod.string().optional(),
    location: zod.string().optional(),
    phone: zod.string().optional(),
    email: zod.string().optional(),
    workingHours: zod.string().optional(),
});

export default function ContactInfoEditForm() {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const methods = useForm({
        resolver: zodResolver(ContactInfoSchema),
        defaultValues: {
            companyName: '',
            address: '',
            location: '',
            phone: '',
            email: '',
            workingHours: '',
        },
    });

    const { reset, handleSubmit } = methods;

    useEffect(() => {
        const loadContactInfoData = async () => {
            try {
                const contactInfoData = await dispatch(contactInfoList());
                if (contactInfoData) {
                    reset({
                        companyName: contactInfoData.companyName || '',
                        address: contactInfoData.address || '',
                        location: contactInfoData.location || '',
                        phone: contactInfoData.phone || '',
                        email: contactInfoData.email || '',
                        workingHours: contactInfoData.workingHours || '',
                    });
                }
            } catch (error) {
                console.error('Failed to load contact info data', error);
            }
        };
        loadContactInfoData();
    }, [dispatch, reset]);

    const onSubmit = handleSubmit(async (data) => {
        setLoading(true);
        try {
            await dispatch(createContactInfo(data));
        } catch (error) {
            console.error('Submission failed', error);
        } finally {
            setLoading(false);
        }
    });

    return (
        <Box mt={2}>
            <CustomBreadcrumbs links={[{ name: '' }]} />
            <Form methods={methods} onSubmit={onSubmit}>
                <Stack spacing={3}>
                    <Card>
                        <Stack spacing={2} sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Contact Information</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <Field.Text name="companyName" label="Company Name" />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Field.Text name="phone" label="Phone / Mobile" />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Field.Text name="email" label="Email" />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Field.Text 
                                        name="address" 
                                        label="Full Address (for Contact Page)" 
                                        multiline 
                                        rows={4}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Field.Text 
                                        name="location" 
                                        label="Location / Address (for Footer)" 
                                        multiline 
                                        rows={4}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Field.Text 
                                        name="workingHours" 
                                        label="Working Hours" 
                                        multiline 
                                        rows={3}
                                    />
                                </Grid>
                            </Grid>
                        </Stack>
                    </Card>

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

