import { PageSeo } from 'src/components/seo';
import { CheckoutListView } from 'src/sections/vendor-sections/checkout/view/checkout-list';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Sales Order"
        description="Manage Intecomart sales orders and checkout records."
      />
      <CheckoutListView />
    </>
  );
}
