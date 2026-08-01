import { PageSeo } from 'src/components/seo';
import { ReceivablesListView } from 'src/sections/accounting/Receivables/view';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Outstanding Receivables"
        description="Track Intecomart outstanding receivables and customer balances."
      />
      <ReceivablesListView />
    </>
  );
}
