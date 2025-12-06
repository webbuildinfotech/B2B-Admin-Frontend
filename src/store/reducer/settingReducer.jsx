import { ABOUT_US_GET_BY_LIST, ABOUT_US_LIST, FOOTER_INFO_LIST, SYNC_GET_BY_LIST, SYNC_LIST, FAQ_LIST, FAQ_GET_BY_LIST, CONTACT_GET_BY_LIST, CONTACT_LIST, TERM_LIST, TERM_GET_BY_LIST, BANNER_LIST, BANNER_GET_BY_LIST, FETCH_TALLY_DATA, UPDATE_TALLY, LOGO, PATH_TALLY, GALLERY_LIST, GALLERY_GET_BY_LIST } from "../constants/actionTypes";

const initialState = {
    faq: [],
    contact: [],
    aboutUs: null,
    footerInfo: null,
    getByAboutUs: '',
    termCondition: [],
    getByFAQ: '',
    getByContact: '',
    getByTermCondition: '',
    banner: [],
    getByBanner: '',
    bannerPagination: {
        total: 0,
        page: 1,
        limit: 5,
        totalPages: 0
    },
    syncData: [],
    getBySyncData: '',
    tallyFetchData: [],
    logo: '',
    path: '',

    gallery: [],
    getByGallery: ''



};
const settingReducer = (state = initialState, { type, payload } = {}) => {
    switch (type) {

        case SYNC_LIST:
            return {
                ...state,
                syncData: payload,
            };

        case SYNC_GET_BY_LIST:
            return {
                ...state,
                getBySyncData: payload,
            };

        case FAQ_LIST:
            return {
                ...state,
                faq: payload,
            };
        case FAQ_GET_BY_LIST:
            return {
                ...state,
                getByFAQ: payload,
            };

        case CONTACT_LIST:
            return {
                ...state,
                contact: payload,
            };
        case CONTACT_GET_BY_LIST:
            return {
                ...state,
                getByContact: payload,
            };

        case ABOUT_US_LIST:
            return {
                ...state,
                aboutUs: payload,
            };
        case ABOUT_US_GET_BY_LIST:
            return {
                ...state,
                getByAboutUs: payload,
            };

        case FOOTER_INFO_LIST:
            return {
                ...state,
                footerInfo: payload,
            };

        case TERM_LIST:
            return {
                ...state,
                termCondition: payload,
            };
        case TERM_GET_BY_LIST:
            return {
                ...state,
                getByTermCondition: payload,
            };

        case BANNER_LIST:
            // Check if payload is paginated response
            if (payload?.data && payload?.total !== undefined) {
                return {
                    ...state,
                    banner: payload.data,
                    bannerPagination: {
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
                banner: Array.isArray(payload) ? payload : [],
                bannerPagination: {
                    total: Array.isArray(payload) ? payload.length : 0,
                    page: 1,
                    limit: 5,
                    totalPages: 1
                }
            };


        case LOGO:
            return {
                ...state,
                logo: payload,
            };

        case PATH_TALLY:
            return {
                ...state,
                path: payload,
            };

        case BANNER_GET_BY_LIST:
            return {
                ...state,
                getByBanner: payload,
            };

        case FETCH_TALLY_DATA:
            return {
                ...state,
                tallyFetchData: payload,
            };

        case UPDATE_TALLY:
            return {
                ...state,
                tallyFetchData: state.tallyFetchData.map((ledger) =>
                    ledger.id === payload.id ? payload : ledger
                ),
            };

        case GALLERY_LIST:
            return {
                ...state,
                gallery: payload,
            };

        case GALLERY_GET_BY_LIST:
            return {
                ...state,
                getByGallery: payload,
            };


        default:
            return state;
    }
};

export default settingReducer;
