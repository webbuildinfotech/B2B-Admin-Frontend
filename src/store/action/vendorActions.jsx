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

export const syncVendor = () => async (dispatch) => {
    try {
        const response = await axiosInstance.post('/vendors/fetch');
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'Vendors fetched and stored successfully!');
            return true;
        }
        return true;
    } catch (error) {
        // Check if error response exists and handle error message
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            // Show full-screen popup notification using SweetAlert
            swal({
                title: "Vendor Sync in Progress",
                text: "Please wait, background process is running. The vendor sync operation is taking longer than expected. Please check the vendor list after a few minutes.",
                icon: "info",
                button: "Got it",
                className: "swal-wide",
                allowOutsideClick: true,
                allowEscapeKey: true,
            });
            return true; // Return true because sync might have started
        }
        
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
