import { PageSeo } from 'src/components/seo';
import useUserRole from 'src/layouts/components/user-role';
import { UserProfileView } from 'src/sections/vendor-sections/setting/profile/view';

export default function Page() {
  const role = useUserRole();

  return (
    <>
      <PageSeo
        title={`Profile - ${role || 'User'}`}
        description="View and update your Intecomart account profile settings."
      />
      <UserProfileView />
    </>
  );
}
