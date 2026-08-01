import { PageSeo } from 'src/components/seo';
import { LedgerListView } from 'src/sections/accounting/ledger/view';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Ledger Statement"
        description="View Intecomart ledger statements and account transactions."
      />
      <LedgerListView />
    </>
  );
}
