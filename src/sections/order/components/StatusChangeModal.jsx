import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';

const statusOptions = ['pending', 'completed', 'cancelled'];

export default function StatusChangeModal({ open, currentStatus, handleClose, handleConfirm }) {
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);

    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
    };

    const handleConfirmClick = () => {
        handleConfirm(selectedStatus);
        handleClose();
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Change Order Status</DialogTitle>
            <DialogContent>
                <FormControl fullWidth margin="normal">
                    <InputLabel id="status-select-label">Status</InputLabel>
                    <Select
                        labelId="status-select-label"
                        id="status-select-label"
                        value={selectedStatus}
                         label="Status"
                        onChange={handleStatusChange}
                    >
                        {statusOptions.map((status) => (
                            <MenuItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleConfirmClick} variant="contained">
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
}
