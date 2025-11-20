import React from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { SyncView } from './sync-view';
import { TallyView } from '../../tally/tally-view';
import { paths } from 'src/routes/paths';
import { Grid } from '@mui/material';
import TermEditForm from '../../terms-conditions/view/term-edit-form';
import ContactEditForm from '../../Contact-us/view/contact-edit-form';
import AboutUsEditForm from '../../about-us/view/about-us-edit-form';
import FooterInfoEditForm from '../../footer-info/view/footer-info-edit-form';
import { Logo } from '../../logo/view/logo';
import { TallyPathSetting } from '../../logo/view/path';

export function MainSetting() {
    return (
        <DashboardContent maxWidth="xl">
            <CustomBreadcrumbs
                heading="Settings"
                links={[
                    { name: '' },
                ]}

                sx={{ padding: "10px 1px 0px 12px", background: "#fff" }}
            />
            <TermEditForm />
            <ContactEditForm />
            <AboutUsEditForm />
            <FooterInfoEditForm />
            <Grid container spacing={4} mt={1}>
                <Grid item xs={12} md={12}>
                    <SyncView />
                </Grid>
                <Grid item xs={12} md={12}>
                    <TallyView />
                </Grid>
            </Grid>

            <Grid container spacing={4} mt={1}>
            <Grid item xs={12} md={6}>
            <Logo/>
            </Grid>
            <Grid item xs={12} md={6}>
                <TallyPathSetting />
            </Grid>
        </Grid>
          
        </DashboardContent>
    );
}
