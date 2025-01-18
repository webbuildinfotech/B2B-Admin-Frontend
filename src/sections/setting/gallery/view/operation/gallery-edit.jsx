
import { paths } from 'src/routes/paths';
import { DashboardContent, PageContentLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useParams } from 'react-router';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { galleryGetByList } from 'src/store/action/settingActions';
import { GalleryEditForm } from '../form/gallery-edit-form';


// Dummy product data
// ----------------------------------------------------------------------
export function GalleryEditView() {
    const dispatch = useDispatch();
    const { id } = useParams(); // Get the product ID from URL
    const gallery = useSelector((state) => state.setting.getByGallery); // Access the product from the Redux store

    useEffect(() => {
        // Fetch the product data when the component mounts
        if (id) {
            dispatch(galleryGetByList(id));
        }
    }, [id, dispatch]);

    return (
        <DashboardContent maxWidth='2xl'>
            <CustomBreadcrumbs
                heading="Edit"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Gallery', href: paths?.settings?.gallery },
                    { name: 'Edit' },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <PageContentLayout>
                <GalleryEditForm currentGallery={gallery} />
            </PageContentLayout>
        </DashboardContent>
    );
}
