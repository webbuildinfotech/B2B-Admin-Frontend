import { toast } from "sonner";
import axiosInstance from "src/configs/axiosInstance";
import {  STOCK_LIST } from "../constants/actionTypes";
import { setLoading, clearLoading } from "./loaderActions";

export const syncStock = () => async (dispatch) => {
    try {
        const response = await axiosInstance.post('/stocks/fetch-summary');
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'Stocks fetched and stored successfully!');
            return true;
        }
        return true;
    } catch (error) {
        // Check if error response exists and handle error message
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
    }
    return false; // Return false for any errors
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




