import React, { useEffect } from 'react';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import { Iconify } from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { DashboardContent, PageContentLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { FAQGetByList } from 'src/store/action/settingActions';
import DOMPurify from 'dompurify';
import { fDate } from 'src/utils/format-time';

// Function to get status chip props
const getStatusChip = (status) => {
    switch (status) {
        case 'Active':
            return { color: 'success', label: 'Active' };
        case 'Inactive':
            return { color: 'error', label: 'Inactive' };
        default:
            return { color: 'default', label: status || 'Unknown' };
    }
};

export function FAQView() {

    const dispatch = useDispatch();
    const { id } = useParams(); // Get the product ID from URL
    const faq = useSelector((state) => state.setting.getByFAQ); // Access the product from the Redux store

    useEffect(() => {
        // Fetch the FAQ data when the component mounts
        if (id) {
            dispatch(FAQGetByList(id));
        }
    }, [id, dispatch]);

    const renderContent = (
        <Card sx={{ boxShadow: (theme) => theme.customShadows.card }}>
            <Stack spacing={4} sx={{ p: 4 }}>
                {/* Question Section */}
                <Box>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'primary.lighter',
                                color: 'primary.main',
                            }}
                        >
                            <Iconify icon="mdi:question-mark-circle" width={24} />
                        </Box>
                        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            Question
                        </Typography>
                    </Stack>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            lineHeight: 1.5,
                        }}
                    >
                        {faq?.question || 'No question available'}
                    </Typography>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                {/* Answer Section */}
                <Box>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'success.lighter',
                                color: 'success.main',
                            }}
                        >
                            <Iconify icon="mdi:message-reply-text-outline" width={24} />
                        </Box>
                        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            Answer
                        </Typography>
                    </Stack>
                    <Box
                        sx={{
                            p: 2.5,
                            borderRadius: 2,
                            bgcolor: 'background.neutral',
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                            minHeight: 100,
                        }}
                    >
                        {faq?.answer ? (
                            <Typography
                                variant="body1"
                                sx={{
                                    color: 'text.primary',
                                    lineHeight: 1.8,
                                    '& p': { mb: 1.5 },
                                    '& p:last-child': { mb: 0 },
                                }}
                                // eslint-disable-next-line react/no-danger
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(faq.answer) }}
                            />
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                No answer available
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Stack>
        </Card>
    );

    const statusChip = getStatusChip(faq?.status);

    const renderOverview = (
        <Stack spacing={3}>
            {/* Status Card */}
            <Card sx={{ boxShadow: (theme) => theme.customShadows.card }}>
                <Stack spacing={2.5} sx={{ p: 3 }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Status
                    </Typography>
                    <Chip
                        label={statusChip.label}
                        color={statusChip.color}
                        icon={<Iconify icon="mdi:check-circle-outline" width={20} />}
                        sx={{
                            width: 'fit-content',
                            fontWeight: 600,
                            height: 32,
                        }}
                    />
                </Stack>
            </Card>

            {/* Information Card */}
            <Card sx={{ boxShadow: (theme) => theme.customShadows.card }}>
                <Stack spacing={3} sx={{ p: 3 }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>
                        Information
                    </Typography>
                    <Divider sx={{ borderStyle: 'dashed' }} />
                    {[
                        {
                            label: 'Date Posted',
                            value: faq?.created_at ? fDate(faq.created_at) : 'Not available',
                            icon: <Iconify icon="mdi:calendar-check-outline" width={20} />,
                        },
                        {
                            label: 'Last Updated',
                            value: faq?.updated_at ? fDate(faq.updated_at) : 'Not available',
                            icon: <Iconify icon="mdi:calendar-edit-outline" width={20} />,
                        },
                    ].map((item, index) => (
                        <Box key={item.label}>
                            <Stack spacing={1.5} direction="row" alignItems="flex-start">
                                <Box
                                    sx={{
                                        mt: 0.5,
                                        color: 'text.secondary',
                                    }}
                                >
                                    {item.icon}
                                </Box>
                                <Stack spacing={0.5} sx={{ flex: 1 }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {item.label}
                                    </Typography>
                                    <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                                        {item.value}
                                    </Typography>
                                </Stack>
                            </Stack>
                            {index < 1 && <Divider sx={{ mt: 2, borderStyle: 'dashed' }} />}
                        </Box>
                    ))}
                </Stack>
            </Card>
        </Stack>
    );

    return (
        <DashboardContent maxWidth="2xl">
            <CustomBreadcrumbs
                heading="FAQ Details"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'FAQ', href: paths?.settings.faq },
                    { name: 'View' },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <PageContentLayout>
                <Grid container spacing={3}>
                    <Grid xs={12} md={8}>
                        {renderContent}
                    </Grid>

                    <Grid xs={12} md={4}>
                        {renderOverview}
                    </Grid>
                </Grid>
            </PageContentLayout>
        </DashboardContent>
    );
}
