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

export const syncReceivable = (onStatusUpdate, onComplete) => async (dispatch) => {
    try {
        const response = await axiosInstance.post('/ledgers/receivable/fetch');
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'Outstanding Receivable fetched and stored successfully!');
            // Fetch data immediately after sync completes
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
            // Show informative message in English
            toast.info('This process is taking longer than expected. Please wait. Data will automatically refresh in 2-3 minutes.', {
                duration: 8000, // Show for 8 seconds
            });
            
            // Automatically fetch data after 2.5 minutes (150 seconds)
            if (onComplete) {
                setTimeout(() => {
                    toast.info('Automatically fetching data...');
                    onComplete();
                }, 150000); // 2.5 minutes = 150000 milliseconds
            }
            return true; // Return true as sync might still be processing
        }
        
        // Handle other errors
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


export const syncLedger = (onStatusUpdate, onComplete) => async (dispatch) => {
    try {
        const response = await axiosInstance.post('/ledgers/fetch');
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'Ledgers fetched and stored successfully!');
            // Fetch data immediately after sync completes
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
            // Show informative message in English
            toast.info('This process is taking longer than expected. Please wait. Data will automatically refresh in 2-3 minutes.', {
                duration: 8000, // Show for 8 seconds
            });
            
            // Automatically fetch data after 2.5 minutes (150 seconds)
            if (onComplete) {
                setTimeout(() => {
                    toast.info('Automatically fetching data...');
                    onComplete();
                }, 150000); // 2.5 minutes = 150000 milliseconds
            }
            return true; // Return true as sync might still be processing
        }
        
        // Handle other errors
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

