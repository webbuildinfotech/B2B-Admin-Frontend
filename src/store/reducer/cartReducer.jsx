import { CART_LIST, UPDATE_CART_ITEM_DISCOUNT } from "../constants/actionTypes";

const initialState = {
    cart: []
};
const cartReducer = (state = initialState, { type, payload } = {}) => {
    switch (type) {
        case CART_LIST:
            return {
                ...state,
                cart: payload,
            };
        case UPDATE_CART_ITEM_DISCOUNT:
            // Update discount for specific cart item without changing order
            // Maintain createdAt order by preserving the original array order
            return {
                ...state,
                cart: state.cart.map((item) =>
                    item.id === payload.cartItemId
                        ? { ...item, discount: payload.discount }
                        : item
                ),
            };
        default:
            return state;
    }
};
export default cartReducer;
