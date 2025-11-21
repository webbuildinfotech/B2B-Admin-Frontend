import { toast } from "sonner";
import axiosInstance from "src/configs/axiosInstance";
import { VENDOR_GET_BY_LIST, VENDOR_LIST } from "../constants/actionTypes";

export const vendorList = () => async (dispatch) => {
    try {
        const response = await axiosInstance.get('/vendors');
        dispatch({
            type: VENDOR_LIST,
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

export const syncVendor = () => async (dispatch) => {
    try {
        // The endpoint now returns immediately (202 Accepted) and processes in background
        // Reduced timeout since the response is immediate
        const response = await axiosInstance.post('/vendors/fetch', {}, {
            timeout: 30000, // 30 seconds should be enough for immediate response
        });
        
        // Handle 202 Accepted (processing started) and other success statuses
        if (response && (response.status === 202 || (response.status >= 200 && response.status < 300))) {
            const message = response.data?.message || 'Vendor sync started successfully!';
            const status = response.data?.status || 'processing';
            
            // Show info toast for background processing
            if (response.status === 202 || status === 'processing') {
                toast.info(message + ' Please check the vendor list after a few minutes.');
            } else {
                toast.success(message);
            }
            return true;
        }
        return true;
    } catch (error) {
        console.log(error,"%%%%%%%%");
        
        // Handle timeout errors specifically
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            toast.error('Request timeout: Please try again or contact support if the issue persists.');
            return false;
        }
        
        // Handle network errors
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            toast.error('Network Error: Please check if the backend server is running and accessible.');
            return false;
        }
        
        // Handle gateway timeout (504)
        if (error.response?.status === 504) {
            toast.error('Gateway timeout: The server is taking too long to respond. Please try again later.');
            return false;
        }
        
        // Check if error response exists and handle error message
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
    }
    return false; // Return false for any errors
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
