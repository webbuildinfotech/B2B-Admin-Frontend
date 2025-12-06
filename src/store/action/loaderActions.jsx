import { SET_LOADING, CLEAR_LOADING } from "../constants/actionTypes";

// Set loading state for a specific action
export const setLoading = (actionType) => (dispatch) => {
    dispatch({
        type: SET_LOADING,
        payload: actionType,
    });
};

// Clear loading state for a specific action
export const clearLoading = (actionType) => (dispatch) => {
    dispatch({
        type: CLEAR_LOADING,
        payload: actionType,
    });
};

