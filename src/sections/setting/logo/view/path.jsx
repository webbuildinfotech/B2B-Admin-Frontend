import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Box,
    Divider,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import EditCalendarIcon from '@mui/icons-material/EditCalendar';

import { createTallyPath, pathList } from "src/store/action/settingActions";
import { useDispatch, useSelector } from "react-redux";

export function TallyPathSetting() {
    const dispatch = useDispatch();

    const [tallyPath, setTallyPath] = useState(""); // Full path for editing
    const [maskedPath, setMaskedPath] = useState(""); // Masked path for display
    const [isEditing, setIsEditing] = useState(false); // Toggle for edit mode
    const [confirmOpen, setConfirmOpen] = useState(false); // Confirmation dialog toggle

    const list = useSelector((state) => state.setting?.path || ""); // Assume only one path is returned

    useEffect(() => {
        // Fetch the current path on component mount
        dispatch(pathList());
    }, [dispatch]);

    useEffect(() => {
        if (list) {
            // Mask the fetched path and set it
            setMaskedPath(maskPath(list));
            setTallyPath(list); // Set full path for editing
        }
    }, [list]);

    const maskPath = (path) => {
        // Mask the path with `****`, showing only the last 4 characters
        if (path.length <= 4) return path; // If path is very short, don't mask
        return `****${path.slice(-4)}`; // Use template literal instead of string concatenation
    };

    const handleInputChange = (event) => {
        setTallyPath(event.target.value); // Allow editing the full path
    };

    const handleEdit = () => {
        setIsEditing(true); // Enable edit mode
    };

    const handleCancel = () => {
        setIsEditing(false); // Disable edit mode without saving
        setTallyPath(list); // Reset to the original path
    };

    const handleSaveClick = () => {
        // Open confirmation dialog
        setConfirmOpen(true);
    };

    const handleConfirmClose = (confirmed) => {
        setConfirmOpen(false); // Close the confirmation dialog
        if (confirmed) {
            handleSubmit(); // Proceed to save if confirmed
        }
    };

    const handleSubmit = async () => {
        const formattedPath = tallyPath.trim().replace(/\\/g, "\\\\"); // Format path for backend
        await dispatch(createTallyPath({ value: formattedPath }));
        setMaskedPath(maskPath(formattedPath)); // Update the masked path after save
        setIsEditing(false); // Exit edit mode
    };

    return (
        <Card
            sx={{
                height: "100%", // Ensure it takes the full height of the parent container
                display: "flex", // For vertical alignment
                flexDirection: "column", // Stack content vertically
            }}
        >
            <Typography
                variant="h5"
                p={2}
                sx={{ textAlign: "center", backgroundColor: "#f5f5f5" }}
            >
                Configure Invoice PDF Download Path
            </Typography>

            <Divider />
            <CardContent sx={{ flexGrow: 1 }}>
                <>
                    {/* Show the masked path with the edit icon inline */}
                    {!isEditing && maskedPath && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center", // Align text and icon vertically
                                justifyContent: "space-between", // Ensure proper spacing
                                marginBottom: 3,
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "blue",
                                    wordWrap: "break-word",
                                    flexGrow: 1, // Allow text to grow and wrap if needed
                                    textAlign: "left",
                                }}
                            >
                                <strong>Current Path:</strong> {maskedPath}
                            </Typography>
                            <IconButton
                                color="primary"
                                onClick={handleEdit}
                                sx={{ marginLeft: 2 }} // Add spacing between text and icon
                            >
                                <EditCalendarIcon />
                            </IconButton>
                        </Box>
                    )}

                    {/* Input field for editing the full path */}
                    {isEditing && (
                        <TextField
                            label="Edit Tally Path"
                            variant="outlined"
                            fullWidth
                            value={tallyPath} // Show full path for editing
                            onChange={handleInputChange}
                            placeholder="e.g., C:/Tally/Path"
                            sx={{ marginBottom: 3 }}
                        />
                    )}

                    {/* Action Buttons */}
                    {isEditing && (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 2,
                                marginBottom: 2,
                            }}
                        >
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSaveClick}
                            >
                                Save Path
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleCancel}
                            >
                                Cancel
                            </Button>
                        </Box>
                    )}
                </>
            </CardContent>

            {/* Confirmation Dialog */}
            {/* Confirmation Dialog */}
            <Dialog
                open={confirmOpen}
                onClose={() => handleConfirmClose(false)}
            >
                <DialogTitle>Confirm Path Change</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to change the path? This will
                        affect the Tally invoice download location.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        sx={{
                            backgroundColor: "#F44336", // Red background
                            color: "white", // White text
                            border: "2px solid #D32F2F", // Red border
                            "&:hover": {
                                backgroundColor: "#D32F2F", // Darker red on hover
                            },
                        }}
                        onClick={() => handleConfirmClose(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        sx={{
                            backgroundColor: "#4CAF50", // Green background
                            color: "white", // White text
                            border: "2px solid #388E3C", // Green border
                            "&:hover": {
                                backgroundColor: "#388E3C", // Darker green on hover
                            },
                        }}
                        onClick={() => handleConfirmClose(true)}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

        </Card>
    );
}
