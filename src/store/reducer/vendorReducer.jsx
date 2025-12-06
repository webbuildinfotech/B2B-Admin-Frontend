import { VENDOR_GET_BY_LIST, VENDOR_LIST } from "../constants/actionTypes";

const initialState = {
    vendor: [],
    getByVendor: '',
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    }
};

const vendorReducer = (state = initialState, { type, payload } = {}) => {
    switch (type) {
        case VENDOR_LIST:
            // Check if payload is paginated (has 'data' property) or plain array
            if (payload && payload.data && Array.isArray(payload.data)) {
                // Paginated response
                return {
                    ...state,
                    vendor: payload.data,
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
                vendor: Array.isArray(payload) ? payload : [],
            };
        case VENDOR_GET_BY_LIST:
            return {
                ...state,
                getByVendor: payload,
            };
        default:
            return state;
    }
};

export default vendorReducer;
