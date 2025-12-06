import { useDispatch } from 'react-redux';
import { logsList, getLogStatusCounts } from 'src/store/action/logsActions';

export const useFetchOrderData = () => {
  const dispatch = useDispatch();

  const fetchData = async (page, limit, search, status) => {
    await dispatch(logsList(page, limit, search, status));
  };

  const fetchStatusCounts = () => dispatch(getLogStatusCounts());

  return { fetchData, fetchStatusCounts };
};

