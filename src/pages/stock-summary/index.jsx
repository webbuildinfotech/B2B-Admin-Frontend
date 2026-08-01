import { PageSeo } from 'src/components/seo';
import { StockListView } from 'src/sections/stock-summary/view';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Stock Summary"
        description="View Intecomart stock summary and inventory levels."
      />
      <StockListView />
    </>
  );
}
