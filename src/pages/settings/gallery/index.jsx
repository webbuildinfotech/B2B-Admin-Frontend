
import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';

import { GalleryList } from 'src/sections/setting/gallery/view/gallery-list';

const metadata = { title: `Banner - ${CONFIG.site.name}` };

export default function Page() {
    return (
        <>
            <Helmet>
                <title> {metadata.title}</title>
            </Helmet>

            <GalleryList />
        </>
    );
}
