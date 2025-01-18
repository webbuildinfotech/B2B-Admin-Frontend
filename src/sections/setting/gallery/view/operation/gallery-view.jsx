import React, { useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import { Iconify } from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { DashboardContent, PageContentLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { galleryGetByList } from 'src/store/action/settingActions';
import { fDate, fTime } from 'src/utils/format-time';

export function GalleryView() {
    const dispatch = useDispatch();
    const { id } = useParams();
    const gallery = useSelector((state) => state.setting.getByGallery);

    useEffect(() => {
        if (id) {
            dispatch(galleryGetByList(id));
        }
    }, [id, dispatch]);

    if (!gallery) {
        return <Typography variant="h6">Loading gallery...</Typography>;
    }

    return (
        <DashboardContent maxWidth="2xl">
            <CustomBreadcrumbs
                heading="Gallery View"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Gallery', href: paths?.settings?.gallery },
                    { name: 'Details' },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <Box
                sx={{
                    width: 1,
                    borderRadius: 2,
                    position: 'relative',
                    p: 4,
                    bgcolor: '#FFF',
                }}
            >
                <Box sx={{ px: 2, pb: 1, gap: 2, pt: 2.5, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" component="div">
                            {gallery.name || 'No name available'}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            rowGap: 1.5,
                            columnGap: 2,
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            typography: 'caption',
                            color: 'text.secondary',
                        }}
                    >
                        <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
                            <Iconify width={16} icon="solar:calendar-date-bold" sx={{ flexShrink: 0 }} />
                            {gallery.updatedAt
                                ? `${fDate(gallery.updatedAt)} ${fTime(gallery.updatedAt)}`
                                : 'No duration available'}
                        </Box>
                    </Box>
                </Box>

                <Grid container spacing={3} sx={{ mt: 3 }}>
                    {gallery?.GalleryImages?.map((image, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    boxShadow: 3,
                                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: 6,
                                    },
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={image}
                                    alt={`Gallery image ${index + 1}`}
                                    sx={{
                                        objectFit: 'cover',
                                        transition: 'transform 0.3s ease-in-out',
                                        '&:hover': {
                                            transform: 'scale(1.1)',
                                        },
                                    }}
                                />
                                <CardContent>
                                    <Typography variant="caption" color="text.secondary">
                                        Image {index + 1}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </DashboardContent>
    );
}
