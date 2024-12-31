import { useDispatch } from 'react-redux';
import { LogoList } from 'src/store/action/settingActions';


export const useFetchData = () => {
    const dispatch = useDispatch();

    const fetchData = async () => {
        await dispatch(LogoList());
    };
    return { fetchData };
};
