import { PageSeo } from 'src/components/seo';
import { LogListView } from 'src/sections/logs-history/view';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Logs"
        description="View Intecomart system logs and activity history."
      />
      <LogListView />
    </>
  );
}
