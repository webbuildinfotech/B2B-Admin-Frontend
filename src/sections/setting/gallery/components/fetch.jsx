import { useDispatch } from 'react-redux';
import { galleryList, deleteGallery } from 'src/store/action/settingActions';


export const useFetchData = () => {
    const dispatch = useDispatch();

    const fetchData = async () => {
        await dispatch(galleryList());
    };

    const fetchDeleteData = async (id) => {

        try {
            const response = await dispatch(deleteGallery(id));;
            if (response) {
                fetchData(); // Refetch banner data only on successful deletion
            }
        } catch (error) {
            console.error("Error deleting banner:", error);
        }
    };


    return { fetchData, fetchDeleteData };
};
