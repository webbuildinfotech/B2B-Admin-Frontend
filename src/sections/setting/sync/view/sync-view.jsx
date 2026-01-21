import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Switch,
    FormControlLabel,
    Paper,
    Grid,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    Card,
    CardHeader,
    Tabs,
    Tab,
} from "@mui/material";
import { DashboardContent } from "src/layouts/dashboard";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";
import { paths } from "src/routes/paths";
import { useDispatch, useSelector } from "react-redux";
import { editSyncSetting, syncSettingList } from "src/store/action/settingActions";
import { TallyView } from "../../tally/tally-view";
import { bgcolor } from "@mui/system";
import { LedgerDateRangeCard } from "../components/ledger-date-range-card";
import { OutstandingDateRangeCard } from "../components/outstanding-date-range-card";
import { CronSettingsCard } from "../components/cron-settings-card";

export function SyncView() {
    const dispatch = useDispatch();

    const syncs = useSelector((state) => state.setting?.syncData || []);

    // States to manage confirmation dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentAction, setCurrentAction] = useState(null);
    
    // State for tab management
    const [currentTab, setCurrentTab] = useState(0);

    // Fetch sync settings from the backend
    useEffect(() => {
        const fetchData = async () => {
            await dispatch(syncSettingList());
        };
        fetchData();
    }, [dispatch]);

    // API call to update sync settings
    const updateSyncSetting = async (id, moduleName, isAutoSyncEnabled, isManualSyncEnabled) => {
        try {
            // Dispatch the action to update the sync setting
            const success = await dispatch(
                editSyncSetting(id, {
                    moduleName,
                    isAutoSyncEnabled,
                    isManualSyncEnabled,
                })
            );
            if (success) {
                console.log(`Sync setting for ${moduleName} updated successfully.`);
            } else {
                console.error(`Failed to update sync setting for ${moduleName}.`);
            }
        } catch (error) {
            console.error("Failed to update sync setting:", error);
        }
    };

    // Handle toggle with confirmation dialog
    const handleToggle = (id, moduleName, setStateFunction, currentState, syncType) => {
        setDialogOpen(true);
        setCurrentAction(() => async () => {
            const updatedState = !currentState;

            // Update the local state
            setStateFunction(updatedState);

            // Update API
            const updatedSyncs = {
                isAutoSyncEnabled: syncType === "Auto Sync" ? updatedState : undefined,
                isManualSyncEnabled: syncType === "Manual Sync" ? updatedState : undefined,
            };
            await updateSyncSetting(id, moduleName, updatedSyncs.isAutoSyncEnabled, updatedSyncs.isManualSyncEnabled);

            setDialogOpen(false);
        });
    };

    // Render individual sync cards dynamically
    const renderSyncCard = (sync) => (
        <Paper key={sync.id} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>{sync.moduleName}</Typography>
            <Divider />
            <Box sx={{ mt: 2 }}>
                <Typography>Auto Sync</Typography>
                <FormControlLabel
                    control={
                        <Switch
                            checked={sync.isAutoSyncEnabled}
                            onChange={() =>
                                handleToggle(sync.id, sync.moduleName, (state) => {
                                    sync.isAutoSyncEnabled = state;
                                }, sync.isAutoSyncEnabled, "Auto Sync")
                            }
                            color="primary"
                        />
                    }
                    label={sync.isAutoSyncEnabled ? "Enabled" : "Disabled"}
                />
            </Box>
            <Box sx={{ mt: 2 }}>
                <Typography>Manual Sync</Typography>
                <FormControlLabel
                    control={
                        <Switch
                            checked={sync.isManualSyncEnabled}
                            onChange={() =>
                                handleToggle(sync.id, sync.moduleName, (state) => {
                                    sync.isManualSyncEnabled = state;
                                }, sync.isManualSyncEnabled, "Manual Sync")
                            }
                            color="primary"
                        />
                    }
                    label={sync.isManualSyncEnabled ? "Enabled" : "Disabled"}
                />
            </Box>
        </Paper>
    );

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    return (
        <Box sx={{ minHeight: '600px' }}>
            {/* Tabs Navigation */}
            <Card sx={{ mb: 3, borderRadius: 0, boxShadow: 1 }}>
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
                    <Tab label="Tally Settings" />
                    <Tab label="Sync Settings" />
                    <Tab label="Date Range Settings" />
                    <Tab label="Cron Job Settings" />
                </Tabs>
            </Card>

            {/* Tab Panel: Sync Settings */}
            {currentTab === 0 && (
                <Box>
                    <Card>
                        <Typography variant="h5" p={2}>Sync Settings</Typography>
                        <Divider />
                        <Grid container sx={{ p: 2 }}>
                            {syncs
                                .slice()
                                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                                .map((sync) => (
                                    <Grid key={sync.id} item xs={12} sm={6} md={4}>
                                        {renderSyncCard(sync)}
                                    </Grid>
                                ))}
                        </Grid>
                    </Card>
                    <Box sx={{ p: 1, mt: 2 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                            Note:
                        </Typography>
                        <Box
                            component="ul"
                            sx={{
                                pl: 4,
                                mt: 1,
                                '& li': {
                                    listStyleType: 'disc',
                                    marginLeft: '1rem',
                                },
                            }}
                        >
                            <li>
                                <Typography variant="body2" color="textSecondary">
                                    Auto Sync, when enabled, syncs data automatically every hour.
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body2" color="textSecondary">
                                    Manual Sync allows you to sync data on-demand at any time.
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body2" color="textSecondary">
                                    Disabling either option stops its respective functionality.
                                </Typography>
                            </li>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Tab Panel: Date Range Settings */}
            {currentTab === 1 && (
                <Card sx={{ mt: 2, minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h5" p={2}>Financial Year Wise Data Settings</Typography>
                    <Divider />
                    <Grid container spacing={2} sx={{ p: 2, flex: 1 }}>
                        <Grid item xs={12} sm={6} md={6}>
                            <Box sx={{ height: '100%' }}>
                                <LedgerDateRangeCard />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6}>
                            <Box sx={{ height: '100%' }}>
                                <OutstandingDateRangeCard />
                            </Box>
                        </Grid>
                    </Grid>
                </Card>
            )}

            {/* Tab Panel: Cron Job Settings */}
            {currentTab === 2 && (
                <Card sx={{ mt: 2 }}>
                    <Typography variant="h5" p={2}>Cron Job Settings</Typography>
                    <Divider />
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Configure the interval for automatic cron jobs. Changes will take effect after saving and rescheduling.
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                                <CronSettingsCard type="Invoice Upload" />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <CronSettingsCard type="Vendor Sync" />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <CronSettingsCard type="Ledger Statement" />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <CronSettingsCard type="Outstanding Receivable" />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <CronSettingsCard type="Stock Summary" />
                            </Grid>
                        </Grid>
                    </Box>
                </Card>
            )}

            {/* Tab Panel: Tally Settings */}
            {currentTab === 3 && (
                <Box sx={{ mt: 2 }}>
                    <TallyView />
                </Box>
            )}

            {/* Confirmation Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to change this sync setting?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} color="secondary"  sx={{
                        backgroundColor: "#F44336", // Red background

                        color: "white", // White text
                        border: "2px solid  #388E3C", // Green border
                        "&:hover": {
                            backgroundColor: "#D32F2F", // Darker green on hover
                        },
                    }}>
                        Cancel
                    </Button>
                    <Button onClick={currentAction} color="primary"  sx={{
                        backgroundColor: "#4CAF50", // Green background

                            color: "white", // White text
                            border: "2px solid #D32F2F", // Red border
                            "&:hover": {
                                backgroundColor: "#388E3C", // Darker red on hover
                            },
                        }}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
