import { PageSeo } from 'src/components/seo';
import { MainSetting } from 'src/sections/setting/sync/view/main';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Settings"
        description="Intecomart basic settings — logo, terms, privacy policy, contact, about us, and footer information."
      />
      <MainSetting />
    </>
  );
}
