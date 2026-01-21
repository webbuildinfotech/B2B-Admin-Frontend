import React, { useState } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { SyncView } from './sync-view';
import { TallyView } from '../../tally/tally-view';
import { paths } from 'src/routes/paths';
import { Grid, Card, Tabs, Tab, Box } from '@mui/material';
import TermEditForm from '../../terms-conditions/view/term-edit-form';
import ContactEditForm from '../../Contact-us/view/contact-edit-form';
import AboutUsEditForm from '../../about-us/view/about-us-edit-form';
import FooterInfoEditForm from '../../footer-info/view/footer-info-edit-form';
import { Logo } from '../../logo/view/logo';
import { TallyPathSetting } from '../../logo/view/path';

export function MainSetting() {
    const [currentTab, setCurrentTab] = useState(0); // Default to Logo & Path Settings

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    return (
        <DashboardContent maxWidth="2xl">
            <CustomBreadcrumbs
                heading="Settings"
                links={[
                    { name: '' },
                ]}

                sx={{mb: 3, padding: "10px 1px 0px 12px", background: "#fff" }}
            />
            
            {/* Tabs Navigation for Terms, Contact, About Us */}
            <Card sx={{ borderRadius: 0, boxShadow: 1 }}>
                <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 500,
                            minHeight: 48,
                            px: 3,
                        },
                    }}
                >
                    <Tab label="Logo & Path Settings" />
                    <Tab label="Terms & Conditions" />
                    <Tab label="Contact Us" />
                    <Tab label="About Us" />
                    <Tab label="Footer Information" />
                </Tabs>
            </Card>

            {/* Tab Panel: Logo & Path Settings */}
            {currentTab === 0 && (
                <Box sx={{ mt: 2 }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Logo/>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TallyPathSetting />
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Tab Panel: Terms & Conditions */}
            {currentTab === 1 && (
                <Box sx={{ mt: 2 }}>
                    <TermEditForm />
                </Box>
            )}

            {/* Tab Panel: Contact Us */}
            {currentTab === 2 && (
                <Box sx={{ mt: 2 }}>
                    <ContactEditForm />
                </Box>
            )}

            {/* Tab Panel: About Us */}
            {currentTab === 3 && (
                <Box sx={{ mt: 2 }}>
                    <AboutUsEditForm />
                </Box>
            )}

            {/* Tab Panel: Footer Information */}
            {currentTab === 4 && (
                <Box sx={{ mt: 2 }}>
                    <FooterInfoEditForm />
                </Box>
            )}

            <Grid container spacing={4} mt={1}>
                <Grid item xs={12} md={12}>
                    <SyncView />
                </Grid>
            </Grid>
          
        </DashboardContent>
    );
}
