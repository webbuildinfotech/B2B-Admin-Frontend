
import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { MainSetting } from 'src/sections/setting/sync/view/main';


const metadata = { title: `Sync - ${CONFIG.site.name}` };

export default function Page() {
    return (
        <>
            <Helmet>
                <title> {metadata.title}</title>
            </Helmet>

            <MainSetting/>
        </>
    );
}
