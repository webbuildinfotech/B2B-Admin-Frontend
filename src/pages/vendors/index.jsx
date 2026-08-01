import { PageSeo } from 'src/components/seo';
import { VendorListView } from 'src/sections/vendor/view';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Vendors"
        description="Manage Intecomart vendors — view, approve, and update vendor accounts and details."
      />
      <VendorListView />
    </>
  );
}
