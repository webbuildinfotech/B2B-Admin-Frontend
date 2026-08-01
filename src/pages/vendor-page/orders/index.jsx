import { PageSeo } from 'src/components/seo';
import { OrderListView } from 'src/sections/order/view';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Orders Reports"
        description="View Intecomart order reports and vendor order history."
      />
      <OrderListView />
    </>
  );
}
