import { PageSeo } from 'src/components/seo';
import { View500 } from 'src/sections/error';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Server Error"
        description="Something went wrong in Intecomart Admin. Please try again later."
      />
      <View500 />
    </>
  );
}
