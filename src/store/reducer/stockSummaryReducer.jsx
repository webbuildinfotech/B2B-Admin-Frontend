import { STOCK_LIST } from "../constants/actionTypes";

const initialState = {
    stock: [],
    getByStock: '',
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    }
};

const stockReducer = (state = initialState, { type, payload } = {}) => {
    switch (type) {
        case STOCK_LIST:
            if (payload && payload.data && Array.isArray(payload.data)) {
                return {
                    ...state,
                    stock: payload.data,
                    pagination: {
                        total: payload.total,
                        page: payload.page,
                        limit: payload.limit,
                        totalPages: payload.totalPages
                    }
                };
            }
            return {
                ...state,
                stock: Array.isArray(payload) ? payload : [],
            };
        default:
            return state;
    }
};

export default stockReducer;
