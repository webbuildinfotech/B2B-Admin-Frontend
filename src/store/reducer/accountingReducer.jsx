import { LEDGER_GET_BY_LIST, LEDGER_LIST, RECEIVABLE_GET_BY_LIST, RECEIVABLE_LIST } from "../constants/actionTypes";

const initialState = {
    receivable: [],
    getByReceivable: '',
    receivablePagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    },
    ledger: [],
    getByLedger: '',
    ledgerPagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    }
};

const AccountingReducer = (state = initialState, { type, payload } = {}) => {
    switch (type) {
        case RECEIVABLE_LIST:
            if (payload && payload.data && Array.isArray(payload.data)) {
                return {
                    ...state,
                    receivable: payload.data,
                    receivablePagination: {
                        total: payload.total,
                        page: payload.page,
                        limit: payload.limit,
                        totalPages: payload.totalPages
                    }
                };
            }
            return {
                ...state,
                receivable: Array.isArray(payload) ? payload : [],
            };
            
        case RECEIVABLE_GET_BY_LIST:
            return {
                ...state,
                getByReceivable: payload,
            };

        case LEDGER_LIST:
            if (payload && payload.data && Array.isArray(payload.data)) {
                return {
                    ...state,
                    ledger: payload.data,
                    ledgerPagination: {
                        total: payload.total,
                        page: payload.page,
                        limit: payload.limit,
                        totalPages: payload.totalPages
                    }
                };
            }
            return {
                ...state,
                ledger: Array.isArray(payload) ? payload : [],
            };
            
        case LEDGER_GET_BY_LIST:
            return {
                ...state,
                getByLedger: payload,
            };

        default:
            return state;
    }
};

export default AccountingReducer;
