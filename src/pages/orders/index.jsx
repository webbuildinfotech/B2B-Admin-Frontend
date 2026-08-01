import { PageSeo } from 'src/components/seo';
import { OrderListView } from 'src/sections/order/view';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Orders"
        description="View and manage Intecomart sales orders, order status, and order history."
      />
      <OrderListView />
    </>
  );
}
