import { PageSeo } from 'src/components/seo';
import { PrivacyListView } from 'src/sections/setting/privacy-policy/view';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Privacy Policy"
        description="Edit Intecomart website Privacy Policy content shown to customers."
      />
      <PrivacyListView />
    </>
  );
}
