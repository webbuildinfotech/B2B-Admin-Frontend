import { useDispatch } from 'react-redux';
import { deleteProduct, itemList, deleteItem, deleteAllItem, getAllSubGroup1Options, getSubGroup2Options } from 'src/store/action/productActions';


export const useFetchProductData = () => {
  const dispatch = useDispatch();

  // Unified fetch data with optional pagination and filters
  const fetchData = async (page, limit, search, subGroup1, subGroup2) => {
    const result = await dispatch(itemList(page, limit, search, subGroup1, subGroup2));
    return result;
  };

  // Fetch all subGroup1 options from backend
  const fetchAllSubGroup1Options = async () => {
    const options = await dispatch(getAllSubGroup1Options());
    return options;
  };

  // Fetch subGroup2 options from backend
  const fetchSubGroup2Options = async (subGroup1) => {
    const options = await dispatch(getSubGroup2Options(subGroup1));
    return options;
  };

  const fetchDeleteData = async (id, page, limit, search, subGroup1, subGroup2) => {
    try {
      const response = await dispatch(deleteProduct(id));
      if (response) {
        await fetchData(page, limit, search, subGroup1, subGroup2);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const fetchDeleteItem = async (id, page, limit, search, subGroup1, subGroup2) => {
    try {
      const response = await dispatch(deleteItem(id));
      if (response) {
        await fetchData(page, limit, search, subGroup1, subGroup2);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const deleteAllItems = async (ids, page, limit, search, subGroup1, subGroup2) => {
    try {
      const response = await dispatch(deleteAllItem(ids));
      if (response) {
        await fetchData(page, limit, search, subGroup1, subGroup2);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return { fetchData, fetchAllSubGroup1Options, fetchSubGroup2Options, fetchDeleteData, deleteAllItems, fetchDeleteItem };
};

