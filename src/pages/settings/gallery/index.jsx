import { PageSeo } from 'src/components/seo';
import { GalleryList } from 'src/sections/setting/gallery/view/gallery-list';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Gallery"
        description="Manage Intecomart gallery images shown on the website."
      />
      <GalleryList />
    </>
  );
}
