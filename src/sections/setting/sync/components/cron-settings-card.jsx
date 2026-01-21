import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Card,
    Divider,
    TextField,
    Button,
    Grid,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { updateCronSetting, cronSettingsList, rescheduleCronJob } from "src/store/action/settingActions";
import { toast } from "sonner";

const CRON_TYPES = [
    { value: 'Invoice Upload', label: 'Invoice Upload' },
    { value: 'Vendor Sync', label: 'Vendor Sync' },
    { value: 'Ledger Statement', label: 'Ledger Statement' },
    { value: 'Outstanding Receivable', label: 'Outstanding Receivable' },
    { value: 'Stock Summary', label: 'Stock Summary' },
];

export function CronSettingsCard({ type }) {
    const dispatch = useDispatch();
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch cron settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const settings = await dispatch(cronSettingsList());
                const setting = settings.find(s => s.type === type) || {
                    type,
                    hours: 1,
                    minutes: 0,
                    seconds: 0,
                };
                setHours(setting.hours || 0);
                setMinutes(setting.minutes || 0);
                setSeconds(setting.seconds || 0);
            } catch (error) {
                console.error('Failed to fetch cron settings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [dispatch, type]);

    const handleSave = async () => {
        // Validation
        if (hours === 0 && minutes === 0 && seconds === 0) {
            toast.error('Please set at least one time interval (hours, minutes, or seconds)');
            return;
        }

        if (seconds > 59) {
            toast.error('Seconds must be between 0 and 59');
            return;
        }

        setSaving(true);
        try {
            const success = await dispatch(updateCronSetting({
                type,
                hours,
                minutes,
                seconds,
            }));

            if (success) {
                // Reschedule the cron job
                await dispatch(rescheduleCronJob(type));
                // Show only one toast message with the interval
                toast.success(`${type} cron job set to ${getCronDescription()}`);
            }
        } catch (error) {
            console.error('Failed to update cron settings:', error);
        } finally {
            setSaving(false);
        }
    };

    const getCronDescription = () => {
        if (hours > 0) {
            return `Every ${hours} hour(s)`;
        }
        if (minutes > 0) {
            return `Every ${minutes} minute(s)`;
        }
        if (seconds > 0) {
            return `Every ${seconds} second(s)`;
        }
        return 'Not configured';
    };

    if (loading) {
        return (
            <Card sx={{ p: 2, backgroundColor: 'background.neutral' }}>
                <Typography>Loading...</Typography>
            </Card>
        );
    }

    return (
        <Card sx={{ p: 2, backgroundColor: 'background.neutral', mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                {type}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                Cron Interval
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                Set the interval for this cron job. Priority: Hours &gt; Minutes &gt; Seconds
            </Typography>

            <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Hours"
                                type="number"
                                value={hours}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value, 10) || 0;
                                    setHours(Math.max(0, val));
                                    if (val > 0) {
                                        setMinutes(0);
                                        setSeconds(0);
                                    }
                                }}
                                inputProps={{ min: 0 }}
                                helperText="0 = disabled"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Minutes"
                                type="number"
                                value={minutes}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value, 10) || 0;
                                    setMinutes(Math.max(0, val));
                                    if (val > 0) {
                                        setHours(0);
                                        setSeconds(0);
                                    }
                                }}
                                inputProps={{ min: 0, max: 59 }}
                                helperText="0-59 (ignored if hours &gt; 0)"
                                disabled={hours > 0}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Seconds"
                                type="number"
                                value={seconds}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value, 10) || 0;
                                    setSeconds(Math.max(0, Math.min(59, val)));
                                    if (val > 0) {
                                        setHours(0);
                                        setMinutes(0);
                                    }
                                }}
                                inputProps={{ min: 0, max: 59 }}
                                helperText="0-59 (ignored if hours/minutes &gt; 0)"
                                disabled={hours > 0 || minutes > 0}
                                error={seconds > 59}
                            />
                        </Grid>
                    </Grid>

            <Box sx={{ mt: 2, p: 1, backgroundColor: 'info.lighter', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary">
                    <strong>Current Schedule:</strong> {getCronDescription()}
                </Typography>
            </Box>

            <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={saving || loading}
                sx={{ mt: 3 }}
                fullWidth
            >
                {saving ? 'Saving...' : 'Save & Reschedule'}
            </Button>
        </Card>
    );
}

