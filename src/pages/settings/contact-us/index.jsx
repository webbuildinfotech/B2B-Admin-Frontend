import { PageSeo } from 'src/components/seo';
import ContactEditForm from 'src/sections/setting/Contact-us/view/contact-edit-form';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Contact Us"
        description="Edit Intecomart Contact Us details shown on the website."
      />
      <ContactEditForm />
    </>
  );
}
