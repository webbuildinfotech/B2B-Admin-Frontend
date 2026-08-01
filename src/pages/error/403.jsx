import { PageSeo } from 'src/components/seo';
import { View403 } from 'src/sections/error';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Access Forbidden"
        description="You do not have permission to view this Intecomart Admin page."
      />
      <View403 />
    </>
  );
}
