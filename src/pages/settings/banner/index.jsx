import { PageSeo } from 'src/components/seo';
import { BannerListView } from 'src/sections/setting/banner/view/banner-list-view';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Banners"
        description="Manage Intecomart website banners and promotional images."
      />
      <BannerListView />
    </>
  );
}
