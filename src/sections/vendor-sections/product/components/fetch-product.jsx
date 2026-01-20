import { useDispatch } from 'react-redux';
import { deleteProduct, getAllItemsForFilter, itemList, productList } from 'src/store/action/productActions';


export const useFetchProductData = () => {
  const dispatch = useDispatch();

  const fetchData = async () => {
    await dispatch(itemList());
  };
  const fetchAllItems = async () => {
    await dispatch(getAllItemsForFilter());
  };


  return { fetchData, fetchAllItems };
};

