import { PRODUCT_GET_BY_LIST, PRODUCT_LIST } from "../constants/actionTypes";

const initialState = {
    product: [],
    getByProduct: '',
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    }
};

const productReducer = (state = initialState, { type, payload } = {}) => {
    switch (type) {
        case PRODUCT_LIST:
            // Check if payload is paginated (has 'data' property) or plain array
            if (payload && payload.data && Array.isArray(payload.data)) {
                // Paginated response
                return {
                    ...state,
                    product: payload.data,
                    pagination: {
                        total: payload.total,
                        page: payload.page,
                        limit: payload.limit,
                        totalPages: payload.totalPages
                    }
                };
            }
            // Plain array response (backward compatibility)
            return {
                ...state,
                product: Array.isArray(payload) ? payload : [],
            };
        case PRODUCT_GET_BY_LIST:
            return {
                ...state,
                getByProduct: payload,
            };
        default:
            return state;
    }
};

export default productReducer;
