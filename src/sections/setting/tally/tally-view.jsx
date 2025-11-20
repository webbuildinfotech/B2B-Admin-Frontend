import { useEffect, useState, useMemo } from "react";
import {
    Box, Card, CardContent, Typography, Button, Dialog, DialogTitle,
    DialogContent, TextField, DialogActions, Grid, Snackbar,
    Divider
} from "@mui/material";
import { DashboardContent } from "src/layouts/dashboard";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";
import { paths } from "src/routes/paths";
import { fetchTallyAPIData, updateTallyAPI, createTallyAPI } from "src/store/action/settingActions";
import { useDispatch, useSelector } from "react-redux";

export function TallyView() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.setting.tallyFetchData || []); // Replace with your state path
    const [ledgerData, setLedgerData] = useState(data);
    const [selectedLedger, setSelectedLedger] = useState(null); // Tracks the ledger being edited
    const [dialogOpen, setDialogOpen] = useState(false); // Dialog visibility state
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    
    // Check if "Current Company Name" setting exists - recompute when ledgerData changes
    const currentCompanyNameSetting = useMemo(
        () => ledgerData?.find((ledger) => ledger.name === "Current Company Name"),
        [ledgerData]
    );


    const fetchData = async () => {
        const success = await dispatch(fetchTallyAPIData());
        if (!success) {
            setSnackbar({ open: true, message: "Failed to load ledger data.", severity: "error" });
        }
    };
    // Fetch ledger data on component mount
    useEffect(() => {

        fetchData();
    }, [dispatch]);

    // Synchronize local state with Redux store
    useEffect(() => {
        setLedgerData(data);
    }, [data]);

    // Open the dialog with the selected ledger
    const handleEdit = (ledger) => {
        setSelectedLedger(ledger);
        setDialogOpen(true);
    };

    // Close dialog
    const closeDialog = () => {
        setDialogOpen(false);
        setSelectedLedger(null);
    };

    // Save the updated ledger
    const handleSave = async () => {
        if (selectedLedger) {
            // If it has an id, update existing setting; otherwise, create new one
            if (selectedLedger.id) {
                const success = await dispatch(updateTallyAPI(selectedLedger.id, selectedLedger));
                if (success) {
                    setLedgerData((prevData) =>
                        prevData.map((ledger) =>
                            ledger.id === selectedLedger.id ? selectedLedger : ledger
                        )
                    );
                    fetchData();
                    setSnackbar({ open: true, message: "Data updated successfully.", severity: "success" });
                } else {
                    setSnackbar({ open: true, message: "Failed to update ledger.", severity: "error" });
                }
            } else {
                // Create new setting
                const success = await dispatch(createTallyAPI({ name: selectedLedger.name, value: selectedLedger.value }));
                if (success) {
                    fetchData();
                    setSnackbar({ open: true, message: "Setting created successfully.", severity: "success" });
                } else {
                    setSnackbar({ open: true, message: "Failed to create setting.", severity: "error" });
                }
            }
            closeDialog();
        }
    };

    // Handle create/edit for Current Company Name
    const handleCompanyNameEdit = () => {
        if (currentCompanyNameSetting) {
            // Edit existing
            setSelectedLedger(currentCompanyNameSetting);
            setDialogOpen(true);
        } else {
            // Create new
            setSelectedLedger({ name: "Current Company Name", value: "" });
            setDialogOpen(true);
        }
    };

    return (

        <div>
            {/* Ledger Settings Section */}
            <Card mt={4} sx={{ mb: 3 }}>
                <Typography variant="h5" p={2}>Tally Settings</Typography>
                <Divider/>
                <Typography variant="h6" sx={{ p: 2, color: "#007b5e", fontWeight: "bold" }}>
                    Ledger Settings
                </Typography>
                <Grid container spacing={1} sx={{ p: 2 }}>
                    {ledgerData
                        .filter((ledger) => ledger.name !== "Current Company Name") // Exclude Current Company Name from ledger list
                        .slice() // Create a copy of the array to avoid mutating the original state
                        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Sort by createdAt in ascending order 
                        .map((ledger) => (

                            <Grid item xs={12} sm={12} md={12} lg={12} key={ledger.id} sx={{ px: 1 }}>
                                <Card
                                    sx={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #007b5e",
                                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => handleEdit(ledger)}
                                >
                                    <CardContent>
                                        <Typography
                                           
                                            sx={{
                                                fontWeight: "bold",
                                                color: "#007b5e",
                                            }}
                                        >
                                            {ledger.name}
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: "#333",
                                            }}
                                        >
                                            {ledger.value || "Not Set"}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                </Grid>
            </Card>

            {/* Current Company Name Section - Separate Card Below with Grid */}
            <Card mt={2} sx={{ 
                backgroundColor: "#f0f9f7",
                border: "2px solid #007b5e",
                width: "100%",
            }}>
                <Typography variant="h5" p={2} sx={{ color: "#007b5e", fontWeight: "bold" }}>
                    Current Company Name
                </Typography>
                <Divider/>
                <Grid container spacing={2} sx={{ p: 2, width: "100%", margin: 0 }}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} sx={{ width: "100%", maxWidth: "100%", padding: "8px !important" }}>
                        <Card
                            sx={{
                                backgroundColor: currentCompanyNameSetting ? "#fff" : "#fff9e6",
                                border: currentCompanyNameSetting ? "1px solid #007b5e" : "2px dashed #ff9800",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                cursor: "pointer",
                                width: "100%",
                                maxWidth: "100%",
                                "&:hover": {
                                    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
                                    transform: "translateY(-2px)",
                                    transition: "all 0.3s ease",
                                },
                            }}
                            onClick={handleCompanyNameEdit}
                        >
                            <CardContent sx={{ width: "100%", p: 3 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, width: "100%" }}>
                                    <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "200px" }, width: { xs: "100%", sm: "auto" } }}>
                                        <Typography
                                            sx={{
                                                fontWeight: "bold",
                                                color: "#007b5e",
                                                mb: 1,
                                            }}
                                        >
                                            Current Company Name
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: currentCompanyNameSetting?.value ? "#333" : "#ff9800",
                                                fontStyle: currentCompanyNameSetting?.value ? "normal" : "italic",
                                                fontWeight: currentCompanyNameSetting?.value ? "normal" : "600",
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {currentCompanyNameSetting?.value || "⚠️ Not Set - Click here to configure"}
                                        </Typography>
                                        {!currentCompanyNameSetting && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: "#666",
                                                    display: "block",
                                                    mt: 1,
                                                }}
                                            >
                                                This setting is used in Tally invoice XML generation
                                            </Typography>
                                        )}
                                    </Box>
                                    <Button
                                        variant={currentCompanyNameSetting ? "outlined" : "contained"}
                                        sx={{
                                            backgroundColor: currentCompanyNameSetting ? "transparent" : "#007b5e",
                                            color: currentCompanyNameSetting ? "#007b5e" : "#fff",
                                            borderColor: "#007b5e",
                                            minWidth: "100px",
                                            "&:hover": {
                                                backgroundColor: currentCompanyNameSetting ? "#f0f9f7" : "#005945",
                                                borderColor: "#005945",
                                            },
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCompanyNameEdit();
                                        }}
                                    >
                                        {currentCompanyNameSetting ? "Edit" : "Create"}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Card>

            {/* Dialog for Editing */}
            {selectedLedger && (
                <Dialog
                    open={dialogOpen}
                    onClose={closeDialog}
                    fullWidth
                    maxWidth="sm"
                    sx={{
                        "& .MuiDialog-paper": {
                            backgroundColor: "#eaf4f1",
                            border: "2px solid #007b5e",
                        },
                    }}
                >
                    <DialogTitle
                        sx={{
                            backgroundColor: "#007b5e",
                            color: "#fff",
                            fontWeight: "bold",
                            textAlign: "center",
                        }}
                    >
                        {selectedLedger.id ? `Edit ${selectedLedger.name}` : `Create ${selectedLedger.name}`}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label={selectedLedger.name === "Current Company Name" ? "Company Name" : "Ledger Value"}
                            value={selectedLedger.value || ""}
                            onChange={(e) =>
                                setSelectedLedger({ ...selectedLedger, value: e.target.value })
                            }
                            placeholder={selectedLedger.name === "Current Company Name" ? "e.g., RG TECHNO INDUSTRIAL PRODUCTS PVT LTD(2025-26)" : ""}
                            sx={{
                                marginTop: 2,
                                "& .MuiInputBase-root": {
                                    backgroundColor: "#fff",
                                },
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={closeDialog}
                            sx={{
                                color: "#007b5e",
                                fontWeight: "bold",
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            sx={{
                                backgroundColor: "#007b5e",
                                color: "#fff",
                                "&:hover": {
                                    backgroundColor: "#005945",
                                },
                            }}
                        >
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* Snackbar for Notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
            />
        </div>
    );
}
