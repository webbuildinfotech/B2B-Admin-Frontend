import { PageSeo } from 'src/components/seo';
import { FAQsListView } from 'src/sections/setting/FAQ/view';

export default function Page() {
  return (
    <>
      <PageSeo
        title="FAQs"
        description="Manage Intecomart frequently asked questions shown on the website."
      />
      <FAQsListView />
    </>
  );
}
