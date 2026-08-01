import { PageSeo } from 'src/components/seo';
import { NotFoundView } from 'src/sections/error';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Page Not Found"
        description="The requested Intecomart Admin page could not be found."
      />
      <NotFoundView />
    </>
  );
}
