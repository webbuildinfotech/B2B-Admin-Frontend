import { USER_LIST, ADMIN_STATE } from "../constants/actionTypes";

const initialState = {
    user: [],
    userByID: '',
    adminState: null
};
const userReducer = (state = initialState, { type, payload } = {}) => {
    switch (type) {
        case USER_LIST:
            return {
                ...state,
                user: payload,
            };
        case ADMIN_STATE:
            return {
                ...state,
                adminState: payload,
            };
        // case "SET_USER_BY_DATA":
            // return {
            //     ...state,
            //     userByID: payload,
            // };
        default:
            return state;
    }
};
export default userReducer;
