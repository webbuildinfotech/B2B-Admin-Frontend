import { toast } from "sonner";
import swal from "sweetalert";
import axiosInstance from "src/configs/axiosInstance";
import { VENDOR_GET_BY_LIST, VENDOR_LIST } from "../constants/actionTypes";
import { setLoading, clearLoading } from "./loaderActions";

export const vendorList = (page, limit, search, status) => async (dispatch) => {
    try {
        // Set loading state using constant
        dispatch(setLoading(VENDOR_LIST));

        // Always send page and limit to ensure paginated response
        const params = {
            page: page || 1,
            limit: limit || 10
        };
        if (search) params.search = search;
        if (status && status !== 'all') params.status = status;

        const response = await axiosInstance.get('/vendors', {
            params
        });

        // Check if response is paginated or plain array
        if (response.data?.data && response.data?.total !== undefined) {
            // Paginated response
            dispatch({
                type: VENDOR_LIST,
                payload: response.data,
            });
            dispatch(clearLoading(VENDOR_LIST));
            return response.data;
        }
        // Plain array response (backward compatible)
        dispatch({
            type: VENDOR_LIST,
            payload: response.data?.data,
        });
        dispatch(clearLoading(VENDOR_LIST));
        return true;
    } catch (error) {
        // Clear loading on error
        dispatch(clearLoading(VENDOR_LIST));
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
        return false;
    }
};

export const vendorGetByList = (id) => async (dispatch) => {
    try {
        const response = await axiosInstance.get(`/vendors/${id}`);
        dispatch({
            type: VENDOR_GET_BY_LIST,
            payload: response.data?.data, // Assuming response contains the customers data
        });
        return true;
    } catch (error) {
        // Check if error response exists and handle error message
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
    }
    return false; // Return false for any errors
};

export const syncVendor = (onStatusUpdate, onComplete) => async (dispatch) => {
    try {
        // Start sync (returns immediately)
        const startResponse = await axiosInstance.post('/vendors/fetch', {}, {
            timeout: 10000 // 10 seconds timeout for starting sync
        });

        if (startResponse && startResponse.status === 202) {
            toast.info('Sync started. Monitoring progress...', { duration: 3000 });
            
            // Poll status endpoint every 5 seconds
            const pollInterval = 5000; // 5 seconds
            const maxPollTime = 10 * 60 * 1000; // 10 minutes max
            const startTime = Date.now();
            let pollCount = 0;

            const pollStatus = async () => {
                try {
                    const statusResponse = await axiosInstance.get('/vendors/sync-status', {
                        timeout: 5000 // 5 seconds timeout for status check
                    });

                    const status = statusResponse.data;
                    pollCount += 1;

                    // Call status update callback if provided
                    if (onStatusUpdate) {
                        onStatusUpdate(status);
                    }

                    // Check if sync is completed
                    if (status.status === 'completed') {
                        toast.success(status.message || 'Vendors synced successfully!');
                        if (onComplete) {
                            onComplete();
                        }
                        return true;
                    }

                    // Check if sync failed
                    if (status.status === 'error') {
                        toast.error(status.error || status.message || 'Sync failed. Please try again.');
                        // Stop loading and call completion callback to reset UI
                        if (onComplete) {
                            onComplete();
                        }
                        return false;
                    }

                    // Check if still processing
                    if (status.status === 'processing') {
                        // Show progress if available
                        if (status.totalRecords && status.processedRecords !== undefined) {
                            const progress = Math.round((status.processedRecords / status.totalRecords) * 100);
                            const progressMessage = status.message || `Processing... ${progress}%`;
                            if (pollCount % 3 === 0) { // Update toast every 15 seconds (3 polls * 5 seconds)
                                toast.info(progressMessage, { duration: 2000 });
                            }
                        }

                        // Check if exceeded max poll time
                        if (Date.now() - startTime > maxPollTime) {
                            toast.warning('Sync is taking longer than expected. Please check back later or refresh the page.');
                            if (onComplete) {
                                // Still try to fetch data
                                setTimeout(() => onComplete(), 5000);
                            }
                            return false;
                        }

                        // Continue polling
                        setTimeout(pollStatus, pollInterval);
                        return null; // Still processing
                    }

                    // If status is idle, sync might have completed already
                    if (status.status === 'idle') {
                        toast.info('Sync completed. Refreshing data...');
                        if (onComplete) {
                            onComplete();
                        }
                        return true;
                    }

                    // Continue polling for other statuses
                    setTimeout(pollStatus, pollInterval);
                    return null;
                } catch (pollError) {
                    // If status check fails, continue polling (might be temporary network issue)
                    console.warn('Status check failed, retrying...', pollError);
                    
                    // Only stop if we've exceeded max time
                    if (Date.now() - startTime > maxPollTime) {
                        toast.warning('Unable to check sync status. Please refresh the page to see updated data.');
                        if (onComplete) {
                            setTimeout(() => onComplete(), 5000);
                        }
                        return false;
                    }

                    // Retry after a longer interval on error
                    setTimeout(pollStatus, pollInterval * 2);
                    return null;
                }
            };

            // Start polling
            await pollStatus();
            return true;
        }

        // If response is not 202, handle as before
        if (startResponse && startResponse.status >= 200 && startResponse.status < 300) {
            toast.success(startResponse.data.message || 'Vendors fetched and stored successfully!');
            if (onComplete) {
                onComplete();
            }
            return true;
        }
        return true;
    } catch (error) {
        // Check for gateway timeout or request timeout errors
        const isTimeoutError = 
            error?.code === 'ECONNABORTED' || 
            error?.message?.includes('timeout') || 
            error?.response?.status === 504 ||
            error?.response?.status === 408;

        if (isTimeoutError) {
            // Even if start request times out, sync might have started
            toast.info('Sync request sent. Please wait and refresh the page in a few minutes to see updated data.', {
                duration: 8000,
            });
            
            // Try to poll status anyway
            try {
                const statusResponse = await axiosInstance.get('/vendors/sync-status', { timeout: 5000 });
                if (statusResponse.data.status === 'processing') {
                    toast.info('Sync is in progress. Monitoring...', { duration: 3000 });
                    // Start polling
                    const pollInterval = 5000;
                    const pollStatus = async () => {
                        try {
                            const status = await axiosInstance.get('/vendors/sync-status', { timeout: 5000 });
                            if (status.data.status === 'completed') {
                                toast.success('Sync completed!');
                                if (onComplete) onComplete();
                                return;
                            }
                            if (status.data.status === 'error') {
                                toast.error(status.data.error || 'Sync failed');
                                if (onComplete) {
                                    onComplete();
                                }
                                return;
                            }
                            setTimeout(pollStatus, pollInterval);
                        } catch (e) {
                            setTimeout(pollStatus, pollInterval * 2);
                        }
                    };
                    setTimeout(pollStatus, pollInterval);
                }
            } catch (e) {
                // If status check also fails, just show message
            }
            
            // Fallback: auto-refresh after delay
            if (onComplete) {
                setTimeout(() => {
                    toast.info('Automatically fetching data...');
                    onComplete();
                }, 120000); // 2 minutes
            }
            return true;
        }
        
        // Handle other errors
        const errorMessage = error?.response?.data?.message || error?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
        console.error('Sync vendor error:', error);
        return false;
    }
};


export const deleteVendor = (id) => async (dispatch) => {
    try {
        const response = await axiosInstance.delete(`/vendors/delete/${id}`);
        // Check if the response is successful
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'vendors deleted successfully!');
            return true; // Indicate successful deletion
        }
    } catch (error) {
        // Handle errors appropriately
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
    }
    return false; // Return false for any errors or unsuccessful attempts
};

export const onUpdateStatus = (id, status) => async (dispatch) => {
      try {
        const response = await axiosInstance.patch(`/users/status/${id}`, status);
        if (response) {
            toast.success(response.data.message);
            return true; // Indicate successful deletion
        }
    } catch (error) {
        // Handle errors appropriately
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
    }
    return false; // Return false for any errors or unsuccessful attempts
};

export const deleteAllItem = (ids) => async (dispatch) => {
    try {
        // Pass ids as the data property in the axios delete request
        const response = await axiosInstance.delete(`/vendors/delete/vendors/all`, {
            data: { ids }
        });

        // Check if the response is successful
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'vendors deleted successfully!');
            return true; // Indicate successful deletion
        }
    } catch (error) {
        // Handle errors appropriately
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
    }
    return false; // Return false for any errors or unsuccessful attempts
};

// Get vendor status counts for tabs
export const getVendorStatusCounts = () => async (dispatch) => {
    try {
        const response = await axiosInstance.get('/vendors/status-counts');
        return response.data?.data || { all: 0, active: 0, inactive: 0 };
    } catch (error) {
        const errorMessage = error?.response?.data?.message || 'Failed to fetch status counts.';
        toast.error(errorMessage);
        return { all: 0, active: 0, inactive: 0 };
    }
};
