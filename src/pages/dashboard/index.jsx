import { PageSeo } from 'src/components/seo';
import useUserRole from 'src/layouts/components/user-role';
import { Overview } from 'src/sections/overview/adminDash/view';
import { OverviewBookingView } from 'src/sections/overview/booking/view';

export default function OverviewAppPage() {
  const role = useUserRole();

  return (
    <>
      <PageSeo
        title="Dashboard"
        description="Intecomart Admin dashboard — overview of orders, vendors, products, and business metrics."
      />
      {role === 'Admin' ? <Overview /> : <OverviewBookingView />}
    </>
  );
}
