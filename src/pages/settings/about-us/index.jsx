
import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import AboutUsEditForm from 'src/sections/setting/about-us/view/about-us-edit-form';

const metadata = { title: `About Us - ${CONFIG.site.name}` };

export default function Page() {
    return (
        <>
            <Helmet>
                <title> {metadata.title}</title>
            </Helmet>

            <AboutUsEditForm />
        </>
    );
}

