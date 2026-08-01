import { PageSeo } from 'src/components/seo';
import { PaymentView } from 'src/sections/payments/payment-view';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Payments"
        description="Track and manage Intecomart payments and payment history."
      />
      <PaymentView />
    </>
  );
}
