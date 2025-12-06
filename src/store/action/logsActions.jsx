import { toast } from "sonner";
import axiosInstance from "src/configs/axiosInstance";
import { LOGS_LIST } from "../constants/actionTypes";
import { setLoading, clearLoading } from "./loaderActions";

export const logsList = (page, limit, search, status) => async (dispatch) => {
    try {
        // Set loading state using constant
        dispatch(setLoading(LOGS_LIST));

        const params = {
            page: page || 1,
            limit: limit || 10
        };
        if (search) params.search = search;
        if (status && status !== 'all') params.status = status;

        const response = await axiosInstance.get('/sync-log', { params });
        
        // Handle both array and paginated response
        const payload = response.data;
        
        // Ensure payload is valid before dispatching
        if (payload) {
            dispatch({
                type: LOGS_LIST,
                payload,
            });
            dispatch(clearLoading(LOGS_LIST));
            return true;
        }
        
        // If payload is invalid, don't dispatch to preserve previous state
        dispatch(clearLoading(LOGS_LIST));
        console.warn('Invalid payload received from logs API:', payload);
        return false;
    } catch (error) {
        // Clear loading on error
        dispatch(clearLoading(LOGS_LIST));
        // Check if error response exists and handle error message
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
        // Don't dispatch on error to preserve previous state
        return false;
    }
};

export const getLogStatusCounts = () => async (dispatch) => {
    try {
        const response = await axiosInstance.get('/sync-log/status-counts');
        return response.data;
    } catch (error) {
        const errorMessage = error?.response?.data?.message || 'Failed to fetch status counts.';
        toast.error(errorMessage);
        return { all: 0, stocks: 0, items: 0, orders: 0, vendors: 0, ledger: 0, receivable: 0, success: 0, fail: 0 };
    }
};
