import { useDispatch } from 'react-redux';
import { deletePayment, paymentList } from 'src/store/action/paymentActions';

export const useFetchData = () => {
    const dispatch = useDispatch();

    const fetchData = async (page, limit, search) => {
        await dispatch(paymentList(page, limit, search));
    };

    const fetchDeleteData = async (id) => {
        try {
            const response = await dispatch(deletePayment(id));
            if (response) {
                return true;
            }
        } catch (error) {
            console.error("Error deleting payment:", error);
        }
        return false;
    };

    return { fetchData, fetchDeleteData };
};
