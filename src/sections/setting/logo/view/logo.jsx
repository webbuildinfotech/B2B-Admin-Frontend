import React, { useState, useEffect } from "react";
import {
    Box,
    Card,
    Divider,
    Typography,
    Button,
    LinearProgress,
    Grid,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useFetchData } from "../utils/fetch";
import { createLogo } from "src/store/action/settingActions";
import { DEFAULT_LOGO } from "src/components/logo/logo";
import { resolveMediaUrl } from "src/utils/media-url";

export function Logo() {
    const dispatch = useDispatch();
    const { fetchData } = useFetchData();
    const logoList = useSelector((state) => state.setting?.logo || null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(DEFAULT_LOGO);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedFile) return;
        if (logoList?.logoImage) {
            setPreviewUrl(`${resolveMediaUrl(logoList.logoImage)}?t=${new Date().getTime()}`);
        } else {
            setPreviewUrl(DEFAULT_LOGO);
        }
    }, [logoList, selectedFile]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const filePreview = URL.createObjectURL(file);
            setPreviewUrl(filePreview);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert("Please select a file to upload.");
            return;
        }

        setUploading(true);

        try {
            const uploadFormData = new FormData();
            uploadFormData.append("logoFile", selectedFile);

            await dispatch(createLogo(uploadFormData));
            fetchData();
            setSelectedFile(null);
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card sx={{ height: "100%" }}>
            <Typography variant="h5" p={2}>
                Logo Upload
            </Typography>
            <Divider />
            <Box sx={{ textAlign: "center", mt: 2 }}>
                <img
                    src={previewUrl || DEFAULT_LOGO}
                    alt="Logo Preview"
                    onError={(e) => {
                        if (e.currentTarget.dataset.fallbackApplied === '1') return;
                        e.currentTarget.dataset.fallbackApplied = '1';
                        e.currentTarget.src = DEFAULT_LOGO;
                    }}
                    style={{
                        maxWidth: "150px",
                        height: "auto",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        padding: "4px",
                    }}
                />
            </Box>
            <Grid
                container
                spacing={2}
                justifyContent="center"
                alignItems="center"
                mt={2}
                sx={{ px: 1 }}
            >
                <Grid item>
                    <Button
                        variant="outlined"
                        component="label"
                        sx={{
                            textTransform: "none",
                            padding: "8px 12px",
                            fontSize: "14px",
                            width: "150px",
                        }}
                        disabled={uploading}
                    >
                        Choose File
                        <input
                            type="file"
                            hidden
                            accept=".jpeg,.jpg,.png,.gif"
                            onChange={handleFileChange}
                        />
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpload}
                        sx={{
                            textTransform: "none",
                            padding: "8px 12px",
                            fontSize: "14px",
                            width: "150px",
                        }}
                        disabled={!selectedFile || uploading}
                    >
                        {uploading ? "Uploading..." : "Upload"}
                    </Button>
                </Grid>
            </Grid>
            {uploading && (
                <Box sx={{ mt: 2 }}>
                    <LinearProgress />
                    <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mt: 1, textAlign: "center" }}
                    >
                        Uploading, please wait...
                    </Typography>
                </Box>
            )}
            {selectedFile && (
                <Typography
                    variant="body2"
                    sx={{
                        mt: 1,
                        textAlign: "center",
                        color: "textSecondary",
                        fontStyle: "italic",
                        fontSize: "13px",
                    }}
                >
                    {selectedFile.name}
                </Typography>
            )}
            <Typography
                variant="caption"
                sx={{
                    mt: 3,
                    textAlign: "center",
                    display: "block",
                    color: "text.disabled",
                }}
            >
                Allowed *.jpeg, *.jpg, *.png, *.gif | Max size: 3MB
            </Typography>
        </Card>
    );
}
