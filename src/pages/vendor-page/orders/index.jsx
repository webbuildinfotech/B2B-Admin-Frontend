
import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { OrderListView } from 'src/sections/order/view';


const metadata = { title: `Orders Reports - ${CONFIG.site.name}` };

export default function Page() {
    return (
        <>
            <Helmet>
                <title> {metadata.title}</title>
            </Helmet>

            <OrderListView />
        </>
    );
}
