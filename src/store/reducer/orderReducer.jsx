import { ORDER_LIST, ORDER_BY_LIST } from "../constants/actionTypes";

const initialState = {
    order: [],
    orderByID: "",
    orderPagination: {
        total: 0,
        page: 1,
        limit: 5,
        totalPages: 0
    }
};

const orderReducer = (state = initialState, { type, payload } = {}) => {
    switch (type) {
        case ORDER_LIST:
            // Check if payload is paginated response (Admin)
            if (payload?.data && payload?.total !== undefined) {
                return {
                    ...state,
                    order: payload.data,
                    orderPagination: {
                        total: payload.total,
                        page: payload.page,
                        limit: payload.limit,
                        totalPages: payload.totalPages
                    }
                };
            }
            // Handle vendor response structure: { orders: [...], statusSummary: {...}, monthlyData: [...] }
            if (payload?.orders && Array.isArray(payload.orders)) {
                return {
                    ...state,
                    // Store the full vendor response object so statusSummary and monthlyData are accessible
                    order: {
                        orders: payload.orders,
                        statusSummary: payload.statusSummary,
                        monthlyData: payload.monthlyData
                    },
                    orderPagination: {
                        total: payload.orders.length,
                        page: 1,
                        limit: payload.orders.length || 5,
                        totalPages: 1
                    }
                };
            }
            // Fallback for array response
            return {
                ...state,
                order: Array.isArray(payload) ? payload : [],
                orderPagination: {
                    total: Array.isArray(payload) ? payload.length : 0,
                    page: 1,
                    limit: 5,
                    totalPages: 1
                }
            };
        case ORDER_BY_LIST:
            return {
                ...state,
                orderByID: payload,
            };
        default:
            return state;
    }
};
export default orderReducer;