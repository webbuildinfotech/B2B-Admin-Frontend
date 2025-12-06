import { useDispatch } from 'react-redux';
import { bannerList, deleteBanner } from 'src/store/action/settingActions';


export const useFetchBannerData = () => {
    const dispatch = useDispatch();

    const fetchBannerData = async (page, limit, search) => {
        await dispatch(bannerList(page, limit, search));
    };

    const fetchDeleteBannerData = async (id) => {
        try {
            const response = await dispatch(deleteBanner(id));
            if (response) {
                return true;
            }
        } catch (error) {
            console.error("Error deleting banner:", error);
        }
        return false;
    };

    return { fetchBannerData, fetchDeleteBannerData };
};
