import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Card,
    Divider,
    Grid,
    TextField,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { editSyncSetting, syncSettingList } from "src/store/action/settingActions";

export function DateRangeSettings() {
    const dispatch = useDispatch();
    const syncs = useSelector((state) => state.setting?.syncData || []);

    // State to manage date fields for each sync item
    const [dateFields, setDateFields] = useState({});

    // Helper function to convert YYYYMMDD to YYYY-MM-DD for date input
    const formatDateForInput = (dateString) => {
        if (!dateString || dateString.length !== 8) return '';
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        return `${year}-${month}-${day}`;
    };

    // Helper function to convert YYYY-MM-DD to YYYYMMDD
    const formatDateForAPI = (dateString) => {
        if (!dateString) return null;
        return dateString.replace(/-/g, '');
    };

    // Fetch sync settings from the backend
    useEffect(() => {
        const fetchData = async () => {
            await dispatch(syncSettingList());
        };
        fetchData();
    }, [dispatch]);

    // Initialize date fields when syncs data is loaded
    useEffect(() => {
        if (syncs.length > 0) {
            const initialDateFields = {};
            syncs.forEach((sync) => {
                if (sync.moduleName === 'Ledger Statement' || sync.moduleName === 'Outstanding Amount') {
                    initialDateFields[sync.id] = {
                        fromDate: formatDateForInput(sync.fromDate || ''),
                        toDate: formatDateForInput(sync.toDate || ''),
                    };
                }
            });
            setDateFields(initialDateFields);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [syncs]);

    // API call to update sync settings
    const updateSyncSetting = async (id, moduleName, isAutoSyncEnabled, isManualSyncEnabled, fromDate = null, toDate = null) => {
        try {
            // Dispatch the action to update the sync setting
            const success = await dispatch(
                editSyncSetting(id, {
                    moduleName,
                    isAutoSyncEnabled,
                    isManualSyncEnabled,
                    fromDate,
                    toDate,
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

    // Render date range card for a specific sync module
    const renderDateRangeCard = (sync) => {
        const currentDates = dateFields[sync.id] || { fromDate: '', toDate: '' };

        const handleDateChange = async (field, value) => {
            const formattedDate = formatDateForAPI(value);
            
            // Update local state
            setDateFields((prev) => ({
                ...prev,
                [sync.id]: {
                    ...prev[sync.id],
                    [field]: value,
                },
            }));

            // Update API
            const updatedFromDate = field === 'fromDate' ? formattedDate : formatDateForAPI(currentDates.fromDate);
            const updatedToDate = field === 'toDate' ? formattedDate : formatDateForAPI(currentDates.toDate);
            
            await updateSyncSetting(
                sync.id,
                sync.moduleName,
                sync.isAutoSyncEnabled,
                sync.isManualSyncEnabled,
                updatedFromDate,
                updatedToDate
            );
        };

        return (
            <Card key={sync.id} sx={{ p: 2, backgroundColor: 'background.neutral' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                    {sync.moduleName === 'Ledger Statement' ? 'Ledger' : 'Outstanding'}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                    Financial Year Wise Data
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                    Date Range (Optional) - Leave empty to use default financial year dates
                </Typography>
                <Box>
                    <TextField
                        fullWidth
                        label="From Date"
                        type="date"
                        value={currentDates.fromDate}
                        onChange={(e) => handleDateChange('fromDate', e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="To Date"
                        type="date"
                        value={currentDates.toDate}
                        onChange={(e) => handleDateChange('toDate', e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Box>
            </Card>
        );
    };

    // Filter syncs for date range modules
    const dateRangeSyncs = syncs.filter(
        sync => sync.moduleName === 'Ledger Statement' || sync.moduleName === 'Outstanding Amount'
    );

    if (dateRangeSyncs.length === 0) {
        return null;
    }

    return (
        <Card sx={{ mt: 3 }}>
            <Typography variant="h5" p={2}>Financial Year Wise Data Settings</Typography>
            <Divider />
            <Grid container spacing={2} sx={{ p: 2 }}>
                {dateRangeSyncs.map((sync) => (
                    <Grid key={sync.id} item xs={12} sm={6} md={6}>
                        {renderDateRangeCard(sync)}
                    </Grid>
                ))}
            </Grid>
        </Card>
    );
}

