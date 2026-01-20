import { Helmet } from 'react-helmet-async';
import { SalesInvoiceListView } from 'src/sections/accounting/sales-invoice/view';

export default function Page() {
    const metadata = { title: `Sales Invoice` };

    return (
        <>
            <Helmet>
                <title> {metadata.title}</title>
            </Helmet>

            <SalesInvoiceListView />
        </>
    );
}

