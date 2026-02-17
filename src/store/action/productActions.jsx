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

// Get all items without pagination for vendor items filter
export const getAllItemsForFilter = (search, subGroup1, subGroup2) => async (dispatch) => {
    try {
        const params = {};
        if (search) params.search = search;
        if (subGroup1 && subGroup1.length > 0) params.subGroup1 = subGroup1;
        if (subGroup2 && subGroup2.length > 0) params.subGroup2 = subGroup2;

        const response = await axiosInstance.get('/items', {
            params
        });
        // Return all items as array (without pagination)
        dispatch({
            type: PRODUCT_LIST,
            payload: response.data?.data,
        });
        return true;
    } catch (error) {
        const errorMessage = error?.response?.data?.message || 'Failed to fetch items for filter.';
        toast.error(errorMessage);
        return [];
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



// Product sync with background process + status polling (same as vendor/stock)
export const syncProduct = (onStatusUpdate, onComplete) => async (dispatch) => {
    try {
        const startResponse = await axiosInstance.post('/items/fetch', {}, {
            timeout: 10000 // 10 seconds timeout for starting sync
        });

        if (startResponse && startResponse.status === 202) {
            toast.info('Product sync started. Monitoring progress...', { duration: 3000 });

            const pollInterval = 5000; // 5 seconds
            const maxPollTime = 10 * 60 * 1000; // 10 minutes max
            const startTime = Date.now();
            let pollCount = 0;

            const pollStatus = async () => {
                try {
                    const statusResponse = await axiosInstance.get('/items/sync-status', {
                        timeout: 5000
                    });

                    const status = statusResponse.data;
                    pollCount += 1;

                    if (onStatusUpdate) {
                        onStatusUpdate(status);
                    }

                    if (status.status === 'completed') {
                        toast.success(status.message || 'Products synced successfully!');
                        if (onComplete) onComplete();
                        return true;
                    }

                    if (status.status === 'error') {
                        toast.error(status.error || status.message || 'Product sync failed. Please try again.');
                        if (onComplete) onComplete();
                        return false;
                    }

                    if (status.status === 'processing') {
                        if (status.totalRecords && status.processedRecords !== undefined) {
                            const progress = Math.round((status.processedRecords / status.totalRecords) * 100);
                            const progressMessage = status.message || `Processing... ${progress}%`;
                            if (pollCount % 3 === 0) {
                                toast.info(progressMessage, { duration: 2000 });
                            }
                        }
                        if (Date.now() - startTime > maxPollTime) {
                            toast.warning('Product sync is taking longer than expected. Please check back later or refresh the page.');
                            if (onComplete) setTimeout(() => onComplete(), 5000);
                            return false;
                        }
                        setTimeout(pollStatus, pollInterval);
                        return null;
                    }

                    if (status.status === 'idle') {
                        toast.info('Product sync completed. Refreshing data...');
                        if (onComplete) onComplete();
                        return true;
                    }

                    setTimeout(pollStatus, pollInterval);
                    return null;
                } catch (pollError) {
                    console.warn('Product sync status check failed, retrying...', pollError);
                    if (Date.now() - startTime > maxPollTime) {
                        toast.warning('Unable to check product sync status. Please refresh the page to see updated data.');
                        if (onComplete) setTimeout(() => onComplete(), 5000);
                        return false;
                    }
                    setTimeout(pollStatus, pollInterval * 2);
                    return null;
                }
            };

            await pollStatus();
            return true;
        }

        if (startResponse && startResponse.status >= 200 && startResponse.status < 300) {
            toast.success(startResponse.data?.message || 'Products synced successfully!');
            if (onComplete) onComplete();
            return true;
        }
        return true;
    } catch (error) {
        const isTimeoutError =
            error?.code === 'ECONNABORTED' ||
            error?.message?.includes('timeout') ||
            error?.response?.status === 504 ||
            error?.response?.status === 408;

        if (isTimeoutError) {
            toast.info('Product sync request sent. Please wait and refresh the page in a few minutes to see updated data.', {
                duration: 8000,
            });
            try {
                const statusResponse = await axiosInstance.get('/items/sync-status', { timeout: 5000 });
                if (statusResponse.data.status === 'processing') {
                    toast.info('Product sync is in progress. Monitoring...', { duration: 3000 });
                    const pollInterval = 5000;
                    const pollStatus = async () => {
                        try {
                            const status = await axiosInstance.get('/items/sync-status', { timeout: 5000 });
                            if (status.data.status === 'completed') {
                                toast.success('Product sync completed!');
                                if (onComplete) onComplete();
                                return;
                            }
                            if (status.data.status === 'error') {
                                toast.error(status.data.error || 'Product sync failed');
                                if (onComplete) onComplete();
                                return;
                            }
                            setTimeout(pollStatus, pollInterval);
                        } catch (e) {
                            setTimeout(pollStatus, pollInterval);
                        }
                    };
                    await pollStatus();
                    return true;
                }
                if (statusResponse.data.status === 'completed' || statusResponse.data.status === 'idle') {
                    toast.success('Product sync completed!');
                    if (onComplete) onComplete();
                    return true;
                }
            } catch (e) {
                // ignore
            }
        }
        const errorMessage = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
        toast.error(errorMessage);
        if (onComplete) onComplete();
        return false;
    }
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
