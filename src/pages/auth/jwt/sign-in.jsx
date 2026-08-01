import { PageSeo } from 'src/components/seo';
import { JwtSignInView } from 'src/sections/auth/jwt';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Sign In"
        description="Sign in to Intecomart Admin Panel to manage products, vendors, and orders."
      />
      <JwtSignInView />
    </>
  );
}
