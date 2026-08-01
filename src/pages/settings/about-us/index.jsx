import { PageSeo } from 'src/components/seo';
import AboutUsEditForm from 'src/sections/setting/about-us/view/about-us-edit-form';

export default function Page() {
  return (
    <>
      <PageSeo
        title="About Us"
        description="Edit Intecomart About Us content displayed on the website."
      />
      <AboutUsEditForm />
    </>
  );
}
