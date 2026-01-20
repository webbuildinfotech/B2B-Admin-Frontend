import { useDispatch } from 'react-redux';
import { deleteAllSalesInvoice, deleteSalesInvoice, salesInvoiceGetById, salesInvoiceList, updateSalesInvoice } from 'src/store/action/accountingActions';

export const useFetchSalesInvoice = () => {
  const dispatch = useDispatch();

  const fetchData = async (page, limit, search) => {
    const result = await dispatch(salesInvoiceList(page, limit, search));
    return result;
  };

  const fetchByIdData = async (id) => {
    await dispatch(salesInvoiceGetById(id));
  };

  const fetchDeleteData = async (id) => {
    await dispatch(deleteSalesInvoice(id));
  };

  const deleteAllItems = async (ids, page, limit, search) => {
    try {
      const response = await dispatch(deleteAllSalesInvoice(ids));
      if (response) {
        await fetchData(page, limit, search);
      }
    } catch (error) {
      console.error("Error deleting sales invoices:", error);
    }
  };

  const updateData = async (id, data) => {
    const result = await dispatch(updateSalesInvoice(id, data));
    return result;
  };

  return { fetchData, fetchByIdData, fetchDeleteData, deleteAllItems, updateData };
};

