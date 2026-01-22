import { toast } from "sonner";
import axiosInstance from "src/configs/axiosInstance";
import {  STOCK_LIST } from "../constants/actionTypes";
import { setLoading, clearLoading } from "./loaderActions";

export const syncStock = (onStatusUpdate, onComplete) => async (dispatch) => {
    try {
        const startResponse = await axiosInstance.post('/stocks/fetch-summary', {}, {
            timeout: 10000 // 10 seconds timeout for starting sync
        });

        if (startResponse && startResponse.status === 202) {
            toast.info('Stock sync started. Monitoring progress...', { duration: 3000 });
            
            // Poll status endpoint every 5 seconds
            const pollInterval = 5000; // 5 seconds
            const maxPollTime = 10 * 60 * 1000; // 10 minutes max
            const startTime = Date.now();
            let pollCount = 0;

            const pollStatus = async () => {
                try {
                    const statusResponse = await axiosInstance.get('/stocks/sync-status', {
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
                        toast.success(status.message || 'Stocks synced successfully!');
                        if (onComplete) {
                            onComplete();
                        }
                        return true;
                    }

                    // Check if sync failed
                    if (status.status === 'error') {
                        toast.error(status.error || status.message || 'Stock sync failed. Please try again.');
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
                            if (pollCount % 5 === 0) { // Update toast every 25 seconds (5 polls * 5 seconds)
                                toast.info(progressMessage, { duration: 2000 });
                            }
                        }

                        // Check if exceeded max poll time
                        if (Date.now() - startTime > maxPollTime) {
                            toast.warning('Stock sync is taking longer than expected. Please check back later or refresh the page.');
                            if (onComplete) {
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
                        toast.info('Stock sync completed. Refreshing data...');
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
                    console.warn('Stock status check failed, retrying...', pollError);
                    
                    // Only stop if we've exceeded max time
                    if (Date.now() - startTime > maxPollTime) {
                        toast.warning('Unable to check stock sync status. Please refresh the page to see updated data.');
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
            toast.success(startResponse.data.message || 'Stocks fetched and stored successfully!');
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
            toast.info('Stock sync request sent. Please wait and refresh the page in a few minutes to see updated data.', {
                duration: 8000,
            });
            
            // Try to poll status anyway
            try {
                const statusResponse = await axiosInstance.get('/stocks/sync-status', { timeout: 5000 });
                if (statusResponse.data.status === 'processing') {
                    toast.info('Stock sync is in progress. Monitoring...', { duration: 3000 });
                    // Start polling
                    const pollInterval = 5000;
                    const pollStatus = async () => {
                        try {
                            const status = await axiosInstance.get('/stocks/sync-status', { timeout: 5000 });
                            if (status.data.status === 'completed') {
                                toast.success('Stock sync completed!');
                                if (onComplete) onComplete();
                                return;
                            }
                            if (status.data.status === 'error') {
                                toast.error(status.data.error || 'Stock sync failed');
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
                    toast.info('Automatically fetching stock data...');
                    onComplete();
                }, 120000); // 2 minutes
            }
            return true;
        }
        
        // Handle other errors
        const errorMessage = error?.response?.data?.message || error?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
        console.error('Sync stock error:', error);
        return false;
    }
};


export const stockList = (page, limit, search) => async (dispatch) => {
    try {
        // Set loading state using constant
        dispatch(setLoading(STOCK_LIST));

        const params = { page: page || 1, limit: limit || 10 }; // Always send page and limit
        if (search) params.search = search;

        const response = await axiosInstance.get('/stocks', {
            params: Object.keys(params).length > 0 ? params : undefined
        });

        // Check if response is paginated or plain array
        if (response.data?.data && response.data?.total !== undefined) {
            // Paginated response
            dispatch({
                type: STOCK_LIST,
                payload: response.data,
            });
            dispatch(clearLoading(STOCK_LIST));
            return response.data;
        }
        // Plain array response (backward compatible)
        dispatch({
            type: STOCK_LIST,
            payload: response.data?.data,
        });
        dispatch(clearLoading(STOCK_LIST));
        return true;
    } catch (error) {
        console.error('Stock list error:', error);
        // Clear loading on error
        dispatch(clearLoading(STOCK_LIST));
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
        return false;
    }
};

export const deleteAllItem = (ids) => async (dispatch) => {
    try {
        // Pass ids as the data property in the axios delete request
        const response = await axiosInstance.delete(`/stocks/delete/stocks/all`, {
            data: { ids }
        });

        // Check if the response is successful
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'stocks deleted successfully!');
            return true; // Indicate successful deletion
        }
    } catch (error) {
        // Handle errors appropriately
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
    }
    return false; // Return false for any errors or unsuccessful attempts
};




