import { useDispatch } from 'react-redux';
import { deleteAllItem, stockList } from 'src/store/action/stockSummaryActions';


export const useFetchStockData = () => {
  const dispatch = useDispatch();

  const fetchData = async (page, limit, search) => {
    const result = await dispatch(stockList(page, limit, search));
    return result;
  };

  const deleteAllItems = async (ids, page, limit, search) => {
    try {
      const response = await dispatch(deleteAllItem(ids));
      if (response) {
        await fetchData(page, limit, search);
      }
    } catch (error) {
      console.error("Error deleting stocks:", error);
    }
  };

  return { fetchData, deleteAllItems };
};

