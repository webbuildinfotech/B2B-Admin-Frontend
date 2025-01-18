
import { paths } from 'src/routes/paths';
import { DashboardContent, PageContentLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import  { GalleryCreateForm } from '../form/gallery-create-form';

// Dummy product data
// ----------------------------------------------------------------------
export function GalleryCreateView() {

    return (
        <DashboardContent maxWidth='2xl'>
            <CustomBreadcrumbs
                heading="Create"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Gallery', href: paths?.settings?.gallery },
                    { name: 'Create' },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <PageContentLayout>
                <GalleryCreateForm/>
            </PageContentLayout>
        </DashboardContent>
    );
}
