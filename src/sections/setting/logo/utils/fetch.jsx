import { useDispatch } from 'react-redux';
import { LogoList } from 'src/store/action/settingActions';


export const useFetchData = () => {
    const dispatch = useDispatch();

    const fetchData = async () => {
        try {
            await dispatch(LogoList());
            return true;
        } catch (error) {
            console.error("Error fetching logo:", error);
            return false;
        }
    };
    return { fetchData };
};
