import { useDispatch } from 'react-redux';
import { deleteOrder, orderGetByList, orderList, deleteAllItem, getOrderStatusCounts } from 'src/store/action/orderActions';


export const useFetchOrderData = () => {
  const dispatch = useDispatch();

  const fetchData = async (page, limit, search, status, startDate, endDate) => {
    await dispatch(orderList(page, limit, search, status, startDate, endDate));
  };

  const fetchByIdData = async (id) => {
    await dispatch(orderGetByList(id));
  };

  const fetchDeleteData = async (id) => {
    try {
      const response = await dispatch(deleteOrder(id));
      if (response) {
        // Return success to trigger refetch in calling component
        return true;
      }
    } catch (error) {
      console.error("Error deleting order:", error);
    }
    return false;
  };

  const deleteAllItems = async (id) => {
    try {
      const response = await dispatch(deleteAllItem(id));
      if (response) {
        return true;
      }
    } catch (error) {
      console.error("Error deleting orders:", error);
    }
    return false;
  };

  const fetchStatusCounts = () => dispatch(getOrderStatusCounts());

  return { fetchData, fetchByIdData, fetchDeleteData, deleteAllItems, fetchStatusCounts };
};

