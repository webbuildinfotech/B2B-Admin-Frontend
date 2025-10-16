import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Box, Card, Stack, Typography, Grid, Button, IconButton, Divider } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Field, Form } from 'src/components/hook-form';
import { useDispatch } from 'react-redux';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { footerInfoList, createFooterInfo } from 'src/store/action/settingActions';
import { Iconify } from 'src/components/iconify';

const FooterInfoSchema = zod.object({
    companyName: zod.string().optional(),
    companyAddress: zod.string().optional(),
    mobile: zod.string().optional(),
    email: zod.string().optional(),
    aboutUs: zod.string().optional(),
    disclaimer: zod.string().optional(),
    socialMediaLinks: zod.array(
        zod.object({
            platform: zod.string().min(1, 'Platform is required'),
            url: zod.string().url('Valid URL required'),
            icon: zod.string().min(1, 'Icon is required'),
        })
    ).optional(),
});

export default function FooterInfoEditForm() {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const methods = useForm({
        resolver: zodResolver(FooterInfoSchema),
        defaultValues: {
            companyName: '',
            companyAddress: '',
            mobile: '',
            email: '',
            aboutUs: '',
            disclaimer: '',
            socialMediaLinks: [],
        },
    });

    const { reset, handleSubmit, control } = methods;

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'socialMediaLinks',
    });

    useEffect(() => {
        const loadFooterInfoData = async () => {
            try {
                const footerInfoData = await dispatch(footerInfoList());
                if (footerInfoData) {
                    reset({
                        companyName: footerInfoData.companyName || '',
                        companyAddress: footerInfoData.companyAddress || '',
                        mobile: footerInfoData.mobile || '',
                        email: footerInfoData.email || '',
                        aboutUs: footerInfoData.aboutUs || '',
                        disclaimer: footerInfoData.disclaimer || '',
                        socialMediaLinks: footerInfoData.socialMediaLinks || [],
                    });
                }
            } catch (error) {
                console.error('Failed to load footer info data', error);
            }
        };
        loadFooterInfoData();
    }, [dispatch, reset]);

    const onSubmit = handleSubmit(async (data) => {
        setLoading(true);
        try {
            await dispatch(createFooterInfo(data));
        } catch (error) {
            console.error('Submission failed', error);
        } finally {
            setLoading(false);
        }
    });

    const handleAddSocialMedia = () => {
        append({ platform: '', url: '', icon: '' });
    };

    return (
        <Box mt={2}>
            <CustomBreadcrumbs links={[{ name: '' }]} />
            <Form methods={methods} onSubmit={onSubmit}>
                <Stack spacing={3}>
                    <Card>
                        <Stack spacing={2} sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Footer Information</Typography>
                            
                            {/* Company Info Section */}
                            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
                                Company Details
                            </Typography>
                            <Divider />
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <Field.Text name="companyName" label="Company Name" />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Field.Text name="mobile" label="Mobile Number" />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Field.Text name="email" label="Email Address" />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        Company Address
                                    </Typography>
                                    <Field.Editor 
                                        name="companyAddress" 
                                        placeholder="Enter company address with formatting..."
                                        sx={{ maxHeight: 200 }}
                                    />
                                </Grid>
                            </Grid>

                            {/* About Us Section */}
                            <Typography variant="subtitle1" sx={{ mt: 3, fontWeight: 'bold' }}>
                                About Us Content
                            </Typography>
                            <Divider />
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        About Us Description
                                    </Typography>
                                    <Field.Editor 
                                        name="aboutUs" 
                                        placeholder="Write about your company..."
                                        sx={{ maxHeight: 300 }}
                                    />
                                </Grid>
                            </Grid>

                            {/* Disclaimer Section */}
                            <Typography variant="subtitle1" sx={{ mt: 3, fontWeight: 'bold' }}>
                                Disclaimer
                            </Typography>
                            <Divider />
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Field.Text 
                                        name="disclaimer" 
                                        label="Disclaimer Text" 
                                        multiline 
                                        rows={3}
                                        helperText="This will be displayed at the bottom of the footer"
                                    />
                                </Grid>
                            </Grid>

                            {/* Social Media Links Section */}
                            <Typography variant="subtitle1" sx={{ mt: 3, fontWeight: 'bold' }}>
                                Social Media Links
                            </Typography>
                            <Divider />
                            
                            <Stack spacing={2}>
                                {fields.map((field, index) => (
                                    <Card key={field.id} sx={{ p: 2, bgcolor: 'background.neutral' }}>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={12} md={3}>
                                                <Field.Text 
                                                    name={`socialMediaLinks.${index}.platform`} 
                                                    label="Platform Name" 
                                                    placeholder="e.g., Facebook, Twitter"
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={5}>
                                                <Field.Text 
                                                    name={`socialMediaLinks.${index}.url`} 
                                                    label="URL" 
                                                    placeholder="https://..."
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <Field.Text 
                                                    name={`socialMediaLinks.${index}.icon`} 
                                                    label="Icon Name" 
                                                    placeholder="e.g., facebook, twitter"
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={1}>
                                                <IconButton 
                                                    onClick={() => remove(index)} 
                                                    color="error"
                                                    sx={{ mt: 1 }}
                                                >
                                                    <Iconify icon="solar:trash-bin-trash-bold" />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    </Card>
                                ))}
                                
                                <Button
                                    variant="outlined"
                                    startIcon={<Iconify icon="mingcute:add-line" />}
                                    onClick={handleAddSocialMedia}
                                    sx={{ alignSelf: 'flex-start' }}
                                >
                                    Add Social Media Link
                                </Button>
                            </Stack>

                            <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                    <strong>Note:</strong> Icon names should match the platform (facebook, twitter, instagram, linkedin, youtube, pinterest, github, whatsapp).
                                </Typography>
                            </Box>
                        </Stack>
                    </Card>

                    <Stack direction="row" justifyContent="flex-end" spacing={2}>
                        <LoadingButton type="submit" variant="contained" loading={loading}>
                            Save Footer Info
                        </LoadingButton>
                    </Stack>
                </Stack>
            </Form>
        </Box>
    );
}

