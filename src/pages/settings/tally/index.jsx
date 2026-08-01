import { PageSeo } from 'src/components/seo';
import { TallyView } from 'src/sections/setting/tally/tally-view';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Tally"
        description="Configure Intecomart Tally sync and accounting integration settings."
      />
      <TallyView />
    </>
  );
}
