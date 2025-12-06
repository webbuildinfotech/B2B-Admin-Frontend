import { Box, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';

// ----------------------------------------------------------------------

// Hook to get loading state for a specific action
export function useLoader(actionType) {
    return useSelector((state) => state.loader?.loading?.[actionType] || false);
}

// Component to show loader overlay
export function TableLoaderOverlay({ actionType }) {
    const isLoading = useLoader(actionType);

    if (!isLoading) {
        return null;
    }

    return (
        <Box
            sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.paper',
                zIndex: 10,
                opacity: 0.8,
            }}
        >
            <CircularProgress />
        </Box>
    );
}

