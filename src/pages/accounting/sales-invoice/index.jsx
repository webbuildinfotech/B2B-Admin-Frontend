import { PageSeo } from 'src/components/seo';
import { SalesInvoiceListView } from 'src/sections/accounting/sales-invoice/view';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Sales Invoice"
        description="Manage Intecomart sales invoices and billing records."
      />
      <SalesInvoiceListView />
    </>
  );
}
