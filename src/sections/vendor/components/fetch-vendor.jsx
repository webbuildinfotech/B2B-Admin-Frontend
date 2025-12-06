import { useDispatch } from 'react-redux';
import { deleteVendor, vendorList, deleteAllItem, getVendorStatusCounts } from 'src/store/action/vendorActions';

export const useFetchVendorData = () => {
  const dispatch = useDispatch();

  const fetchData = async (page, limit, search, status) => {
    const result = await dispatch(vendorList(page, limit, search, status));
    return result;
  };

  const fetchDeleteData = async (id, page, limit, search, status) => {
    try {
      const response = await dispatch(deleteVendor(id));
      if (response) {
        await fetchData(page, limit, search, status);
      }
    } catch (error) {
      console.error("Error deleting vendor:", error);
    }
  };

  const deleteAllItems = async (ids, page, limit, search, status) => {
    try {
      const response = await dispatch(deleteAllItem(ids));
      if (response) {
        await fetchData(page, limit, search, status);
      }
    } catch (error) {
      console.error("Error deleting vendors:", error);
    }
  };

  const fetchStatusCounts = async () => {
    const counts = await dispatch(getVendorStatusCounts());
    return counts;
  };

  return { fetchData, fetchDeleteData, deleteAllItems, fetchStatusCounts };
};

