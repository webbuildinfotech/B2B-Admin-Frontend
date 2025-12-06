import { PAYMENT_GET_BY_LIST, PAYMENT_LIST } from "../constants/actionTypes";

const initialState = {
    payment: [],
    getByPayment: '',
    paymentPagination: {
        total: 0,
        page: 1,
        limit: 5,
        totalPages: 0
    }
};

const paymentReducer = (state = initialState, { type, payload } = {}) => {
    switch (type) {
        case PAYMENT_LIST:
            // Check if payload is paginated response
            if (payload?.data && payload?.total !== undefined) {
                return {
                    ...state,
                    payment: payload.data,
                    paymentPagination: {
                        total: payload.total,
                        page: payload.page,
                        limit: payload.limit,
                        totalPages: payload.totalPages
                    }
                };
            }
            // Fallback for array response
            return {
                ...state,
                payment: Array.isArray(payload) ? payload : [],
                paymentPagination: {
                    total: Array.isArray(payload) ? payload.length : 0,
                    page: 1,
                    limit: 5,
                    totalPages: 1
                }
            };
        case PAYMENT_GET_BY_LIST:
            return {
                ...state,
                getByPayment: payload,
            };
        default:
            return state;
    }
};

export default paymentReducer;
