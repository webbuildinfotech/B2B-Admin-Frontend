import { SET_LOADING, CLEAR_LOADING } from "../constants/actionTypes";

const initialState = {
    loading: {},
};

const loaderReducer = (state = initialState, { type, payload } = {}) => {
    switch (type) {
        case SET_LOADING:
            return {
                ...state,
                loading: {
                    ...state.loading,
                    [payload]: true,
                },
            };
        case CLEAR_LOADING:
            return {
                ...state,
                loading: {
                    ...state.loading,
                    [payload]: false,
                },
            };
        default:
            return state;
    }
};

export default loaderReducer;

