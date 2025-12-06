import { useDispatch } from 'react-redux';
import { ledgerList, deleteAllLedger, ledgerGetByList } from 'src/store/action/accountingActions';


export const useFetchData = () => {
    const dispatch = useDispatch();

    const fetchData = async (page, limit, search) => {
        const result = await dispatch(ledgerList(page, limit, search));
        return result;
    };

    const fetchByIdData = async (id) => {
        await dispatch(ledgerGetByList(id));
    };

    const deleteAllItems = async (ids, page, limit, search) => {
        try {
            const response = await dispatch(deleteAllLedger(ids));
            if (response) {
                await fetchData(page, limit, search);
            }
        } catch (error) {
            console.error("Error deleting ledger:", error);
        }
    };

    return { fetchData, fetchByIdData, deleteAllItems };
};

