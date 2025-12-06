import { useDispatch } from 'react-redux';
import { deleteAllItem, deleteReceivable, receivableGetByList, receivableList } from 'src/store/action/accountingActions';


export const useFetchData = () => {
  const dispatch = useDispatch();

  const fetchData = async (page, limit, search) => {
    const result = await dispatch(receivableList(page, limit, search));
    return result;
  };

  const fetchByIdData = async (id) => {
    await dispatch(receivableGetByList(id));
  };

  const fetchDeleteData = async (id) => {
    await dispatch(deleteReceivable(id));
  };

  const deleteAllItems = async (ids, page, limit, search) => {
    try {
      const response = await dispatch(deleteAllItem(ids));
      if (response) {
        await fetchData(page, limit, search);
      }
    } catch (error) {
      console.error("Error deleting receivables:", error);
    }
  };

  return { fetchData, fetchByIdData, fetchDeleteData, deleteAllItems };
};

