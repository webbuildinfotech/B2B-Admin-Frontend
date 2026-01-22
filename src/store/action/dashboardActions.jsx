import { toast } from "sonner";
import axiosInstance from "src/configs/axiosInstance";
import { DASHBOARD_LENGTH, MONTHLY_ORDER_LIST } from "../constants/actionTypes";

export const dashboardList = () => async (dispatch) => {
    try {
        const response = await axiosInstance.get('/dashboard/data');
        dispatch({
            type: DASHBOARD_LENGTH,
            payload: response.data, // Assuming response contains the customers data
        });
        return true;
    } catch (error) {
        console.error('Dashboard list error:', error);
        
        // Handle different error types
        let errorMessage = 'An unexpected error occurred. Please try again.';
        
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            errorMessage = 'Request timeout. The server is taking too long to respond. Please try again.';
        } else if (error.code === 'ERR_NETWORK' || !error.response) {
            errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.response?.data) {
            // Handle NestJS error format: { message: string } or { message: string, error: string }
            errorMessage = error.response.data.message || error.response.data.error || errorMessage;
        } else if (error.response?.status) {
            errorMessage = `Server error (${error.response.status}). Please try again later.`;
        }
        
        toast.error(errorMessage);
    }
    return false; // Return false for any errors
};


export const dashOrderList = () => async (dispatch) => {
    try {
        const response = await axiosInstance.get('/order/get/monthly');
        dispatch({
            type: MONTHLY_ORDER_LIST,
            payload: response.data, // Assuming response contains the customers data
        });
        return true;
    } catch (error) {
        // Check if error response exists and handle error message
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
    }
    return false; // Return false for any errors
};