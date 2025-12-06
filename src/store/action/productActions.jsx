import { toast } from "sonner";
import axiosInstance from "src/configs/axiosInstance";
import { PRODUCT_GET_BY_LIST, PRODUCT_LIST } from "../constants/actionTypes";
import { setLoading, clearLoading } from "./loaderActions";

// Updated itemList with dynamic loader support
export const itemList = (page, limit, search, subGroup1, subGroup2) => async (dispatch) => {
    try {
        // Set loading state using constant
        dispatch(setLoading(PRODUCT_LIST));

        // Always send page and limit to ensure paginated response
        const params = {
            page: page || 1,
            limit: limit || 10
        };
        if (search) params.search = search;
        if (subGroup1 && subGroup1.length > 0) params.subGroup1 = subGroup1;
        if (subGroup2 && subGroup2.length > 0) params.subGroup2 = subGroup2;

        const response = await axiosInstance.get('/items', {
            params
        });

        // Check if response is paginated or plain array
        if (response.data?.data && response.data?.total !== undefined) {
            // Paginated response
            dispatch({
                type: PRODUCT_LIST,
                payload: response.data,
            });
            dispatch(clearLoading(PRODUCT_LIST));
            return response.data;
        }
        // Plain array response (backward compatible)
        dispatch({
            type: PRODUCT_LIST,
            payload: response.data?.data,
        });
        dispatch(clearLoading(PRODUCT_LIST));
        return true;
    } catch (error) {
        // Clear loading on error
        dispatch(clearLoading(PRODUCT_LIST));
        // Check if error response exists and handle error message
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
        return false;
    }
};

// Get all subGroup1 options from backend
export const getAllSubGroup1Options = () => async (dispatch) => {
    try {
        const response = await axiosInstance.get('/items/subgroup1-options');
        return response.data?.data || [];
    } catch (error) {
        const errorMessage = error?.response?.data?.message || 'Failed to fetch subGroup1 options.';
        toast.error(errorMessage);
        return [];
    }
};

// Get subGroup2 options based on selected subGroup1
export const getSubGroup2Options = (subGroup1) => async (dispatch) => {
    try {
        if (!subGroup1 || subGroup1.length === 0) {
            return [];
        }

        const response = await axiosInstance.get('/items/subgroup2-options', {
            params: { subGroup1 }
        });

        return response.data?.data || [];
    } catch (error) {
        const errorMessage = error?.response?.data?.message || 'Failed to fetch subGroup2 options.';
        toast.error(errorMessage);
        return [];
    }
};

export const itemGetByList = (id) => async (dispatch) => {
    try {
        const response = await axiosInstance.get(`/items/get/${id}`);
        dispatch({
            type: PRODUCT_GET_BY_LIST,
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



export const syncProduct = () => async (dispatch) => {
    try {
        const response = await axiosInstance.post('/items/fetch');
        if (response) {
            toast.success(response.data.message);

        }
        return true;
    } catch (error) {
        // Check if error response exists and handle error message
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
    }
    return false; // Return false for any errors
};


export const productList = () => async (dispatch) => {
    try {
        const response = await axiosInstance.get('/products');
        dispatch({
            type: PRODUCT_LIST,
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

export const createProduct = (productData) => async (dispatch) => {
    try {
        const response = await axiosInstance.post('/products/create', productData);
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

export const editProduct = (productId, productData) => async (dispatch) => {
    try {
        const response = await axiosInstance.post(`/items/upload-files/${productId}`, productData);    // Check if the response is successful
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'Product updated successfully!');
            return true; // Indicate successful update
        }
    } catch (error) {
        // Handle errors appropriately
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
    }
    return false; // Return false for any errors or unsuccessful attempts
};

export const deleteProduct = (productId, productData) => async (dispatch) => {
    try {
        const response = await axiosInstance.delete(`/items/delete/${productId}`, {
            data: productData // Send productData as part of the request body
        });

        // Check if the response is successful
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'Data deleted successfully!');
            return true; // Indicate successful deletion
        }
    } catch (error) {
        // Handle errors appropriately
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
    }
    return false; // Return false for any errors or unsuccessful attempts
};

export const deleteItem = (productId) => async (dispatch) => {
    try {
        const response = await axiosInstance.delete(`/items/delete/item/${productId}`);

        // Check if the response is successful
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'Product deleted successfully!');
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
        const response = await axiosInstance.delete(`/items/delete/items/all`, {
            data: { ids }
        });

        // Check if the response is successful
        if (response && response.status >= 200 && response.status < 300) {
            toast.success(response.data.message || 'Product deleted successfully!');
            return true; // Indicate successful deletion
        }
    } catch (error) {
        // Handle errors appropriately
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
    }
    return false; // Return false for any errors or unsuccessful attempts
};
