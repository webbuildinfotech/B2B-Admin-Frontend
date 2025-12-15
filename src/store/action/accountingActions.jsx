import { toast } from "sonner";
import axiosInstance from "src/configs/axiosInstance";
import { LEDGER_GET_BY_LIST, LEDGER_LIST, RECEIVABLE_GET_BY_LIST, RECEIVABLE_LIST } from "../constants/actionTypes";
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

// Get receivable sync status
export const getReceivableSyncStatus = () => async (dispatch) => {
    try {
        const response = await axiosInstance.get('/ledgers/sync-status/receivable');
        return response.data;
    } catch (error) {
        console.error('Error fetching receivable sync status:', error);
        return { status: 'idle', message: 'Unable to fetch status' };
    }
};

// Poll receivable sync status
export const pollReceivableSyncStatus = (onStatusUpdate, onComplete, maxAttempts = 60, interval = 2000) => {
    let attempts = 0;
    const poll = async () => {
        try {
            const response = await axiosInstance.get('/ledgers/sync-status/receivable');
            const status = response.data;
            
            if (onStatusUpdate) {
                onStatusUpdate(status);
            }
            
            attempts += 1;
            
            // Continue polling if processing and haven't exceeded max attempts
            if (status.status === 'processing' && attempts < maxAttempts) {
                setTimeout(poll, interval);
            } else if (status.status === 'completed') {
                toast.success('Receivable sync completed successfully!');
                // Auto fetch data after sync completes
                if (onComplete) {
                    onComplete();
                }
            } else if (status.status === 'error') {
                toast.error(`Receivable sync failed: ${status.error || status.message}`);
            }
        } catch (error) {
            console.error('Error polling receivable sync status:', error);
            if (attempts < maxAttempts) {
                setTimeout(poll, interval);
            }
        }
    };
    poll();
};

export const syncReceivable = (onStatusUpdate, onComplete) => async (dispatch) => {
    try {
        const response = await axiosInstance.post('/ledgers/receivable/fetch');
        if (response && response.status === 202) {
            // 202 Accepted - Background processing started
            toast.info(response.data.message || 'Receivable sync started. Processing in background...');
            
            // Start polling for status with completion callback
            pollReceivableSyncStatus(onStatusUpdate, onComplete);
            
            return true;
        }
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'outstanding Receivable fetched and stored successfully!');
            // Fetch data immediately if not background processing
            if (onComplete) {
                onComplete();
            }
            return true;
        }
        return true;
    } catch (error) {
        // Check if error response exists and handle error message
        const errorMessage = error?.response?.data?.message || error?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
        console.error('Sync receivable error:', error);
    }
    return false; // Return false for any errors
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


// Get ledger sync status
export const getLedgerSyncStatus = () => async (dispatch) => {
    try {
        const response = await axiosInstance.get('/ledgers/sync-status/ledger');
        return response.data;
    } catch (error) {
        console.error('Error fetching ledger sync status:', error);
        return { status: 'idle', message: 'Unable to fetch status' };
    }
};

// Poll ledger sync status
export const pollLedgerSyncStatus = (onStatusUpdate, onComplete, maxAttempts = 60, interval = 2000) => {
    let attempts = 0;
    const poll = async () => {
        try {
            const response = await axiosInstance.get('/ledgers/sync-status/ledger');
            const status = response.data;
            
            if (onStatusUpdate) {
                onStatusUpdate(status);
            }
            
            attempts += 1;
            
            // Continue polling if processing and haven't exceeded max attempts
            if (status.status === 'processing' && attempts < maxAttempts) {
                setTimeout(poll, interval);
            } else if (status.status === 'completed') {
                toast.success('Ledger sync completed successfully!');
                // Auto fetch data after sync completes
                if (onComplete) {
                    onComplete();
                }
            } else if (status.status === 'error') {
                toast.error(`Ledger sync failed: ${status.error || status.message}`);
            }
        } catch (error) {
            console.error('Error polling ledger sync status:', error);
            if (attempts < maxAttempts) {
                setTimeout(poll, interval);
            }
        }
    };
    poll();
};

export const syncLedger = (onStatusUpdate, onComplete) => async (dispatch) => {
    try {
        const response = await axiosInstance.post('/ledgers/fetch');
        if (response && response.status === 202) {
            // 202 Accepted - Background processing started
            toast.info(response.data.message || 'Ledger sync started. Processing in background...');
            
            // Start polling for status with completion callback
            pollLedgerSyncStatus(onStatusUpdate, onComplete);
            
            return true;
        }
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'ledgers fetched and stored successfully!');
            // Fetch data immediately if not background processing
            if (onComplete) {
                onComplete();
            }
            return true;
        }
        return true;
    } catch (error) {
        // Check if error response exists and handle error message
        const errorMessage = error?.response?.data?.message || error?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
        console.error('Sync ledger error:', error);
    }
    return false; // Return false for any errors
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

