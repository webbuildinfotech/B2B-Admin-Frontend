import { LOGS_LIST } from "../constants/actionTypes";

const initialState = {
   logs: [],
   logsPagination: {
       total: 0,
       page: 1,
       limit: 10,
       totalPages: 0,
   },
};
const logsReducer = (state = initialState, { type, payload } = {}) => {
    switch (type) {
        case LOGS_LIST:
            // Handle both array and paginated response
            if (payload && typeof payload === 'object' && 'data' in payload) {
                return {
                    ...state,
                    logs: Array.isArray(payload.data) ? payload.data : state.logs, // Preserve previous data if invalid
                    logsPagination: {
                        total: payload.total ?? state.logsPagination.total, // Preserve previous total if invalid
                        page: payload.page ?? state.logsPagination.page,
                        limit: payload.limit ?? state.logsPagination.limit,
                        totalPages: payload.totalPages ?? state.logsPagination.totalPages,
                    },
                };
            }
            // Fallback for array response
            return {
                ...state,
                logs: Array.isArray(payload) ? payload : state.logs, // Preserve previous data if invalid
                logsPagination: {
                    total: Array.isArray(payload) ? payload.length : state.logsPagination.total,
                    page: state.logsPagination.page, // Preserve current page
                    limit: state.logsPagination.limit, // Preserve current limit
                    totalPages: Array.isArray(payload) ? Math.ceil(payload.length / state.logsPagination.limit) : state.logsPagination.totalPages,
                },
            };
        default:
            return state;
    }
};
export default logsReducer;
