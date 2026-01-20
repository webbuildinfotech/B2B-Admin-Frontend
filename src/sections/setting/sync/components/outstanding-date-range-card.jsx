import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Card,
    Divider,
    TextField,
    Button,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { editSyncSetting, syncSettingList } from "src/store/action/settingActions";

export function OutstandingDateRangeCard() {
    const dispatch = useDispatch();
    const syncs = useSelector((state) => state.setting?.syncData || []);
    const outstandingSync = syncs.find(sync => sync.moduleName === 'Outstanding Amount');

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [saving, setSaving] = useState(false);

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

    // Initialize date fields when sync data is loaded
    useEffect(() => {
        if (outstandingSync) {
            setFromDate(formatDateForInput(outstandingSync.fromDate || ''));
            setToDate(formatDateForInput(outstandingSync.toDate || ''));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [outstandingSync]);

    // Handle date change (only update local state)
    const handleDateChange = (field, value) => {
        if (field === 'fromDate') {
            setFromDate(value);
        } else {
            setToDate(value);
        }
    };

    // Handle save button click
    const handleSave = async () => {
        if (!outstandingSync) return;

        setSaving(true);
        try {
            const updatedFromDate = formatDateForAPI(fromDate);
            const updatedToDate = formatDateForAPI(toDate);
            
            await dispatch(
                editSyncSetting(outstandingSync.id, {
                    moduleName: outstandingSync.moduleName,
                    isAutoSyncEnabled: outstandingSync.isAutoSyncEnabled,
                    isManualSyncEnabled: outstandingSync.isManualSyncEnabled,
                    fromDate: updatedFromDate,
                    toDate: updatedToDate,
                })
            );
        } catch (error) {
            console.error("Failed to update outstanding date range:", error);
        } finally {
            setSaving(false);
        }
    };

    if (!outstandingSync) {
        return null;
    }

    return (
        <Card sx={{ p: 2, backgroundColor: 'background.neutral' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                Outstanding
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
                    value={fromDate}
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
                    value={toDate}
                    onChange={(e) => handleDateChange('toDate', e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    sx={{ mb: 2 }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save'}
                </Button>
            </Box>
        </Card>
    );
}

