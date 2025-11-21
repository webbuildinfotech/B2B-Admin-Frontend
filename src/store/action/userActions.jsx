import { toast } from "sonner";
import axiosInstance from "src/configs/axiosInstance";
import { USER_LIST, AUTH_DATA } from "../constants/actionTypes";

export const userList = () => async (dispatch) => {
    try {
        const response = await axiosInstance.get('/users');
        dispatch({
            type: USER_LIST,
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

export const createUser = (userData) => async (dispatch) => {
    try {
        const response = await axiosInstance.post('/auth/register', userData);
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'User registered successfully!');
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

export const editUser = (userId, userData) => async (dispatch) => {
    try {
        const response = await axiosInstance.patch(`/users/update/${userId}`, userData);

        // Check if the response is successful
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'User updated successfully!');
            return true; // Indicate successful update
        }
    } catch (error) {
        // Handle errors appropriately
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
    }
    return false; // Return false for any errors or unsuccessful attempts
};

export const deleteUser = (userId) => async (dispatch) => {
    try {
        const response = await axiosInstance.delete(`/users/delete/${userId}`);
        // Check if the response is successful
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'User deleted successfully!');
            return true; // Indicate successful deletion
        }
    } catch (error) {
        // Handle errors appropriately
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
    }
    return false; // Return false for any errors or unsuccessful attempts
};

export const updateAdminProfile = (adminId, profileData) => async (dispatch) => {
    try {
        // Check if profileData is FormData - axios interceptor will handle Content-Type automatically
        const response = await axiosInstance.put(`/users/profile/${adminId}`, profileData);

        // Check if the response is successful
        if (response && response.status >= 200 && response.status < 300) {
            const updatedUser = response.data?.data;
            
            // Update localStorage with updated user data
            if (updatedUser) {
                // Get current userData from localStorage
                const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
                
                // Merge updated user data with existing user data
                const updatedUserData = {
                    ...currentUserData,
                    user: {
                        ...currentUserData.user,
                        ...updatedUser,
                    }
                };
                
                // Update localStorage
                localStorage.setItem('userData', JSON.stringify(updatedUserData));
                
                // Dispatch action to update Redux store
                dispatch({
                    type: AUTH_DATA,
                    payload: { user: updatedUserData.user },
                });
            }
            
            toast.success(response.data.message || 'Admin profile updated successfully!');
            return true; // Indicate successful update
        }
    } catch (error) {
        // Handle network errors
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            toast.error('Network Error: Please check if the backend server is running and accessible.');
            console.error('Network Error Details:', {
                message: error.message,
                code: error.code,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    baseURL: error.config?.baseURL,
                }
            });
        } else {
            // Handle other errors
            const errorMessage = error?.response?.data?.message || error?.message || 'An unexpected error occurred. Please try again.';
            toast.error(errorMessage);
        }
    }
    return false; // Return false for any errors or unsuccessful attempts
};