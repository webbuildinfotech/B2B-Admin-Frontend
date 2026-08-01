import { PageSeo } from 'src/components/seo';
import TermEditForm from 'src/sections/setting/terms-conditions/view/term-edit-form';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Terms & Conditions"
        description="Edit Intecomart Terms and Conditions content shown to customers."
      />
      <TermEditForm />
    </>
  );
}
