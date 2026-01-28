import { toast } from "sonner";
import axiosInstance from "src/configs/axiosInstance";
import { LEDGER_GET_BY_LIST, LEDGER_LIST, RECEIVABLE_GET_BY_LIST, RECEIVABLE_LIST, SALES_INVOICE_GET_BY_LIST, SALES_INVOICE_LIST } from "../constants/actionTypes";
import { setLoading, clearLoading } from "./loaderActions";

export const receivableList = (page, limit, search) => async (dispatch) => {
    try {
        // Set loading state using constant
        dispatch(setLoading(RECEIVABLE_LIST));

        const params = { page: page || 1, limit: limit || 10 }; // Always send page and limit
        if (search) params.search = search;

        const response = await axiosInstance.get('/ledgers/receivable', {
            params: Object.keys(params).length > 0 ? params : undefined
        });

        if (response.data?.data && response.data?.total !== undefined) {
            dispatch({ type: RECEIVABLE_LIST, payload: response.data });
            dispatch(clearLoading(RECEIVABLE_LIST));
            return response.data;
        }
        dispatch({ type: RECEIVABLE_LIST, payload: response.data?.data });
        dispatch(clearLoading(RECEIVABLE_LIST));
        return true;
    } catch (error) {
        // Clear loading on error
        dispatch(clearLoading(RECEIVABLE_LIST));
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
        return false;
    }
};

export const receivableGetByList = (id) => async (dispatch) => {
    try {
        const response = await axiosInstance.get(`/ledgers/receivable/${id}`);
        dispatch({
            type: RECEIVABLE_GET_BY_LIST,
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

export const syncReceivable = (onStatusUpdate, onComplete) => async (dispatch) => {
    try {
        // Start sync (returns immediately)
        const startResponse = await axiosInstance.post('/ledgers/receivable/fetch', {}, {
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
                    const statusResponse = await axiosInstance.get('/ledgers/receivable/sync-status', {
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
                        toast.success(status.message || 'Receivables synced successfully!');
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
            toast.success(startResponse.data.message || 'Receivables fetched and stored successfully!');
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
                const statusResponse = await axiosInstance.get('/ledgers/receivable/sync-status', { timeout: 5000 });
                if (statusResponse.data.status === 'processing') {
                    toast.info('Sync is in progress. Monitoring...', { duration: 3000 });
                    // Start polling
                    const pollInterval = 5000;
                    const pollStatus = async () => {
                        try {
                            const status = await axiosInstance.get('/ledgers/receivable/sync-status', { timeout: 5000 });
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
        console.error('Sync receivable error:', error);
        return false;
    }
};

export const deleteReceivable = (id) => async (dispatch) => {
    try {
        const response = await axiosInstance.delete(`/ledgers/receivable/delete/${id}`);
        // Check if the response is successful
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'ledgers deleted successfully!');
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
        const response = await axiosInstance.delete(`/ledgers/delete/all`, {
            data: { ids }
        });

        // Check if the response is successful
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'outstanding deleted successfully!');
            return true; // Indicate successful deletion
        }
    } catch (error) {
        // Handle errors appropriately
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
    }
    return false; // Return false for any errors or unsuccessful attempts
};


// Ledger statement

export const ledgerList = (page, limit, search) => async (dispatch) => {
    try {
        // Set loading state using constant
        dispatch(setLoading(LEDGER_LIST));

        const params = { page: page || 1, limit: limit || 10 }; // Always send page and limit
        if (search) params.search = search;

        const response = await axiosInstance.get('/ledgers/get-all', {
            params: Object.keys(params).length > 0 ? params : undefined
        });

        if (response.data?.data && response.data?.total !== undefined) {
            dispatch({ type: LEDGER_LIST, payload: response.data });
            dispatch(clearLoading(LEDGER_LIST));
            return response.data;
        }
        dispatch({ type: LEDGER_LIST, payload: response.data?.data });
        dispatch(clearLoading(LEDGER_LIST));
        return true;
    } catch (error) {
        // Clear loading on error
        dispatch(clearLoading(LEDGER_LIST));
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
        return false;
    }
};

export const ledgerGetByList = (id) => async (dispatch) => {
    try {
        const response = await axiosInstance.get(`/ledgers/get/${id}`);
        dispatch({
            type: LEDGER_GET_BY_LIST,
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


export const syncLedger = (onStatusUpdate, onComplete) => async (dispatch) => {
    try {
        // Start sync (returns immediately)
        const startResponse = await axiosInstance.post('/ledgers/fetch', {}, {
            timeout: 10000 // 10 seconds timeout for starting sync
        });

        if (startResponse && startResponse.status === 202) {
            toast.info('Sync started. Monitoring progress...', { duration: 3000 });
            
            // Poll status endpoint every 2 seconds
            const pollInterval = 5000; // 5 seconds
            const maxPollTime = 10 * 60 * 1000; // 10 minutes max
            const startTime = Date.now();
            let pollCount = 0;

            const pollStatus = async () => {
                try {
                    const statusResponse = await axiosInstance.get('/ledgers/sync-status', {
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
                        toast.success(status.message || 'Ledgers synced successfully!');
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
            toast.success(startResponse.data.message || 'Ledgers fetched and stored successfully!');
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
                const statusResponse = await axiosInstance.get('/ledgers/sync-status', { timeout: 5000 });
                if (statusResponse.data.status === 'processing') {
                    toast.info('Sync is in progress. Monitoring...', { duration: 3000 });
                    // Start polling
                    const pollInterval = 5000;
                    const pollStatus = async () => {
                        try {
                            const status = await axiosInstance.get('/ledgers/sync-status', { timeout: 5000 });
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
        console.error('Sync ledger error:', error);
        return false;
    }
};

export const deleteAllLedger = (ids) => async (dispatch) => {
    try {
        // Pass ids as the data property in the axios delete request
        const response = await axiosInstance.delete(`/ledgers/delete/all-ledger`, {
            data: { ids }
        });

        // Check if the response is successful
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'Ledger deleted successfully!');
            return true; // Indicate successful deletion
        }
    } catch (error) {
        // Handle errors appropriately
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
    }
    return false; // Return false for any errors or unsuccessful attempts
};

// Sales Invoice

export const syncSalesInvoices = () => async () => {
    try {
        const { data } = await axiosInstance.post('/items/sales-invoices/upload-all-invoices');
        if (data?.message) {
            toast.success(data.message);
        } else {
            toast.success('Invoices sync started.');
        }
        return true;
    } catch (error) {
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred';
        toast.error(errorMessage);
        return false;
    }
};

export const salesInvoiceList = (page, limit, search) => async (dispatch) => {
    try {
        dispatch(setLoading(SALES_INVOICE_LIST));

        const params = { page: page || 1, limit: limit || 10 };
        if (search) params.search = search;

        const response = await axiosInstance.get('/items/sales-invoices', {
            params: Object.keys(params).length > 0 ? params : undefined
        });

        if (response.data?.data && response.data?.total !== undefined) {
            dispatch({ type: SALES_INVOICE_LIST, payload: response.data });
            dispatch(clearLoading(SALES_INVOICE_LIST));
            return response.data;
        }
        dispatch({ type: SALES_INVOICE_LIST, payload: response.data?.data || [] });
        dispatch(clearLoading(SALES_INVOICE_LIST));
        return true;
    } catch (error) {
        dispatch(clearLoading(SALES_INVOICE_LIST));
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
        return false;
    }
};

export const salesInvoiceGetById = (id) => async (dispatch) => {
    try {
        const response = await axiosInstance.get(`/items/sales-invoices/${id}`);
        dispatch({
            type: SALES_INVOICE_GET_BY_LIST,
            payload: response.data?.data,
        });
        return true;
    } catch (error) {
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
        return false;
    }
};

export const createSalesInvoice = (data) => async (dispatch) => {
    try {
        const response = await axiosInstance.post('/items/sales-invoices', data);
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'Sales invoice created successfully!');
            return response.data;
        }
        return true;
    } catch (error) {
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
        return false;
    }
};

export const updateSalesInvoice = (id, data) => async (dispatch) => {
    try {
        // For update, we send the data with id in the voucher array
        const updateData = {
            voucher: [{
                id,
                ...data
            }]
        };
        const response = await axiosInstance.post('/items/sales-invoices', updateData);
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'Sales invoice updated successfully!');
            return response.data;
        }
        return true;
    } catch (error) {
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
        return false;
    }
};

export const deleteSalesInvoice = (id) => async (dispatch) => {
    try {
        const response = await axiosInstance.delete(`/items/sales-invoices/${id}`);
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'Sales invoice deleted successfully!');
            return true;
        }
        return false;
    } catch (error) {
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
        return false;
    }
};

export const deleteAllSalesInvoice = (ids) => async (dispatch) => {
    try {
        const response = await axiosInstance.delete('/items/sales-invoices/delete/multiple', {
            data: { ids }
        });

        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'Sales invoices deleted successfully!');
            return true;
        }
        return false;
    } catch (error) {
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
        return false;
    }
};

