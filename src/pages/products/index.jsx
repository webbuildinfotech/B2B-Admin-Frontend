import { PageSeo } from 'src/components/seo';
import { ProductListView } from 'src/sections/product/view';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Products"
        description="Manage Intecomart product catalog — add, edit, sync, and view industrial products."
      />
      <ProductListView />
    </>
  );
}
